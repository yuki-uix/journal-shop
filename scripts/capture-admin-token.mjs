/**
 * 运行方式：
 * 1. SHOPIFY_CLIENT_SECRET=你的secret node scripts/capture-admin-token.mjs
 * 2. 另一个终端：shopify app dev --store journal-shop-dev.myshopify.com --reset
 * 3. 在浏览器完成授权后，token 自动写入 .env.local
 */
import http from 'http'
import { URL } from 'url'
import fs from 'fs'

const CLIENT_ID = 'e28cc57520f9f283e815e0fee63d9cf1'
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET
const PORT = 3000

if (!CLIENT_SECRET) {
  console.error('❌ 请设置环境变量 SHOPIFY_CLIENT_SECRET')
  console.error('   运行方式：SHOPIFY_CLIENT_SECRET=你的secret node scripts/capture-admin-token.mjs')
  process.exit(1)
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)

  if (url.pathname === '/api/auth') {
    const code = url.searchParams.get('code')
    const shop = url.searchParams.get('shop')

    if (!code || !shop) {
      res.writeHead(400)
      res.end('Missing code or shop')
      return
    }

    console.log(`\n🔄 收到 OAuth callback，shop: ${shop}`)
    console.log('   正在交换 access token...')

    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    })

    const json = await tokenRes.json()
    const access_token = json.access_token

    if (!access_token) {
      console.error('❌ 获取 token 失败:', json)
      res.writeHead(500)
      res.end('Failed to get token: ' + JSON.stringify(json))
      return
    }

    // 写入 .env.local
    let envContent = fs.readFileSync('.env.local', 'utf8')
    if (envContent.includes('SHOPIFY_ADMIN_ACCESS_TOKEN')) {
      envContent = envContent.replace(/SHOPIFY_ADMIN_ACCESS_TOKEN=.*/, `SHOPIFY_ADMIN_ACCESS_TOKEN=${access_token}`)
    } else {
      envContent += `\nSHOPIFY_ADMIN_ACCESS_TOKEN=${access_token}\n`
    }
    fs.writeFileSync('.env.local', envContent)

    console.log('\n✅ Admin token 已写入 .env.local')
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h1>✅ Token 捕获成功！可以关闭此页面。</h1><p>Token 已写入 .env.local</p>')
    server.close()

  } else {
    // 其他路径统一返回 200，避免 CLI 报错
    res.writeHead(200)
    res.end('OK')
  }
})

server.listen(PORT, () => {
  const SHOP = 'journal-shop-dev.myshopify.com'
  const SCOPES = 'read_products,write_products,read_inventory,write_inventory,read_orders,write_orders,read_customers'
  const REDIRECT_URI = encodeURIComponent(`http://localhost:${PORT}/api/auth`)
  const STATE = Math.random().toString(36).slice(2)

  const authUrl = `https://${SHOP}/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&state=${STATE}`

  console.log(`\n✅ OAuth capture server 运行在 http://localhost:${PORT}`)
  console.log('\n在浏览器中打开以下链接完成授权：')
  console.log(`\n  ${authUrl}\n`)
})

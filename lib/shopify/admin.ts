// ⚠️ 此文件仅可在服务端（Server Actions / Route Handlers / scripts）使用
// 禁止在 Client Component 中导入，否则 SHOPIFY_ADMIN_ACCESS_TOKEN 会泄露到客户端 bundle

const domain = process.env.SHOPIFY_STORE_DOMAIN
const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
const endpoint = `https://${domain}/admin/api/2024-01/graphql.json`

export async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token!,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Admin API HTTP error: ${res.status}`)
  }

  const { data, errors } = await res.json()
  if (errors?.length) throw new Error(errors[0].message)
  return data
}

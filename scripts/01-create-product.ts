// 运行方式：npx tsx --env-file=.env.local scripts/01-create-product.ts
import { adminFetch } from '../lib/shopify/admin'

const CREATE_PRODUCT_MUTATION = `
  mutation ProductCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product { id title }
      userErrors { field message }
    }
  }
`

async function main() {
  const data = await adminFetch<{
    productCreate: {
      product: { id: string; title: string }
      userErrors: { field: string; message: string }[]
    }
  }>(CREATE_PRODUCT_MUTATION, {
    input: {
      title: '[TEST] Admin API 验证商品',
      status: 'DRAFT',
    },
  })

  const { product, userErrors } = data.productCreate
  if (userErrors.length > 0) {
    console.error('❌ userErrors:', userErrors)
    return
  }
  console.log('✅ Admin API OK, created product:', product.id, product.title)
}

main().catch(console.error)

import { storefrontFetch } from '../lib/shopify/storefront'
import { GET_PRODUCTS_QUERY } from '../lib/shopify/queries/products'

async function main() {
  const data = await storefrontFetch<{ products: { edges: unknown[] } }>(
    GET_PRODUCTS_QUERY,
    { first: 5 }
  )
  console.log('✅ Storefront API OK, products:', data.products.edges.length)
}

main().catch(console.error)

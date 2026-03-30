import { storefrontFetch } from '../lib/shopify/storefront'
import { GET_PRODUCTS_QUERY } from '../lib/shopify/queries/products'
import type { ProductsResponse } from '../lib/types/shopify'

async function main() {
  const data = await storefrontFetch<ProductsResponse>(
    GET_PRODUCTS_QUERY,
    { first: 5 }
  )
  console.log('✅ Storefront API OK, products:', data.products.edges.length)
}

main().catch(console.error)

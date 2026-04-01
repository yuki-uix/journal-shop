import type { Metadata } from 'next'
import { storefrontFetch } from '@/lib/shopify/storefront'
import { GET_ALL_PRODUCTS_QUERY } from '@/lib/shopify/queries/products'
import type { ProductsResponse } from '@/lib/types/shopify'
import ProductCard from '@/components/product/ProductCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '全部商品 — Journal Shop',
  description: '浏览 Journal Shop 的全部手帐文具商品',
}

export default async function ProductsPage() {
  const data = await storefrontFetch<ProductsResponse>(GET_ALL_PRODUCTS_QUERY, {
    first: 50,
  })

  const products = data.products.edges.map((e) => e.node)

  if (products.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-zinc-500">暂无商品</p>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">全部商品</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

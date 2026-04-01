import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { storefrontFetch } from '@/lib/shopify/storefront'
import {
  GET_ALL_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
} from '@/lib/shopify/queries/products'
import type {
  ProductsResponse,
  ProductByHandleResponse,
} from '@/lib/types/shopify'
import ProductDetail from '@/components/product/ProductDetail'

export const revalidate = 60

export async function generateStaticParams() {
  const data = await storefrontFetch<ProductsResponse>(GET_ALL_PRODUCTS_QUERY, {
    first: 50,
  })
  return data.products.edges.map((e) => ({ handle: e.node.handle }))
}

async function getProduct(handle: string) {
  const data = await storefrontFetch<ProductByHandleResponse>(
    GET_PRODUCT_BY_HANDLE_QUERY,
    { handle }
  )
  return data.productByHandle
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    return { title: '商品未找到 — Journal Shop' }
  }

  return {
    title: `${product.title} — Journal Shop`,
    description: product.description || `${product.title} — Journal Shop 手帐文具`,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  return <ProductDetail product={product} />
}

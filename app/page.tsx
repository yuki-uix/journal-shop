import Link from 'next/link'
import { storefrontFetch } from '@/lib/shopify/storefront'
import { GET_PRODUCTS_BY_TAG_QUERY } from '@/lib/shopify/queries/products'
import type { ProductsResponse, Product } from '@/lib/types/shopify'
import ProductCard from '@/components/product/ProductCard'

const STYLES = [
  { name: '简约', emoji: '📐', bg: 'bg-stone-100', href: '/products' },
  { name: '森系', emoji: '🌿', bg: 'bg-emerald-50', href: '/products' },
  { name: '文艺', emoji: '🎨', bg: 'bg-violet-50', href: '/products' },
  { name: '可爱', emoji: '🧸', bg: 'bg-pink-50', href: '/products' },
]

function ProductSection({
  title,
  products,
}: {
  title: string
  products: Product[]
}) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
        <Link
          href="/products"
          className="text-sm font-medium text-amber-700 transition-colors hover:text-amber-800"
        >
          查看全部 →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default async function Home() {
  const [bundlesRes, notebooksRes, stickersRes, pensRes] = await Promise.all([
    storefrontFetch<ProductsResponse>(GET_PRODUCTS_BY_TAG_QUERY, {
      first: 4,
      query: 'tag:is_bundle',
    }),
    storefrontFetch<ProductsResponse>(GET_PRODUCTS_BY_TAG_QUERY, {
      first: 4,
      query: 'tag:notebook',
    }),
    storefrontFetch<ProductsResponse>(GET_PRODUCTS_BY_TAG_QUERY, {
      first: 4,
      query: 'tag:sticker',
    }),
    storefrontFetch<ProductsResponse>(GET_PRODUCTS_BY_TAG_QUERY, {
      first: 4,
      query: 'tag:pen',
    }),
  ])

  const bundles = bundlesRes.products.edges.map((e) => e.node)
  const notebooks = notebooksRes.products.edges.map((e) => e.node)
  const stickers = stickersRes.products.edges.map((e) => e.node)
  const pens = pensRes.products.edges.map((e) => e.node)

  return (
    <>
      {/* Hero */}
      <section className="bg-linear-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            找到你的第一套手帐
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-zinc-600">
            精心挑选的本子、贴纸和笔，开启你的手帐之旅
          </p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-amber-800 px-8 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-amber-900"
          >
            浏览全部
          </Link>
        </div>
      </section>

      {/* Style Entry Cards */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-semibold text-zinc-900">
          选择你的风格
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STYLES.map((style) => (
            <Link
              key={style.name}
              href={style.href}
              className={`${style.bg} flex flex-col items-center justify-center rounded-xl p-6 transition-transform duration-200 hover:scale-[1.02]`}
            >
              <span className="text-3xl">{style.emoji}</span>
              <span className="mt-2 text-sm font-medium text-zinc-700">
                {style.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Sections */}
      <ProductSection title="精选套装" products={bundles} />
      <ProductSection title="本子" products={notebooks} />
      <ProductSection title="贴纸" products={stickers} />
      <ProductSection title="笔" products={pens} />
    </>
  )
}

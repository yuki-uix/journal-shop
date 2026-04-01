import Image from 'next/image'
import type { Product } from '@/lib/types/shopify'
import VariantSelector from './VariantSelector'
import ImageGallery from './ImageGallery'

export default function ProductDetail({ product }: { product: Product }) {
  const variants = product.variants.edges.map((e) => e.node)
  const images = product.images.edges.map((e) => e.node)

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="md:grid md:grid-cols-2 md:gap-10 lg:gap-14">
        {/* Left: Image gallery */}
        <ImageGallery images={images} productTitle={product.title} />

        {/* Right: Product info */}
        <div className="mt-8 md:mt-0">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            {product.title}
          </h1>

          <div className="mt-6">
            <VariantSelector variants={variants} />
          </div>

          {/* Description */}
          {product.descriptionHtml && (
            <div className="mt-8 border-t border-zinc-200 pt-8">
              <h2 className="text-sm font-medium text-zinc-900">商品描述</h2>
              <div
                className="prose prose-sm prose-zinc mt-3 max-w-none"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

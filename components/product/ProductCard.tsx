import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types/shopify'

function formatPrice(amount: string, currencyCode: string) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))
}

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images.edges[0]?.node
  const price = product.priceRange.minVariantPrice
  const isSoldOut = product.variants?.edges[0]
    ? !product.variants.edges[0].node.availableForSale
    : false

  return (
    <Link href={`/products/${product.handle}`} className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
        {isSoldOut && (
          <span className="absolute left-2 top-2 rounded bg-zinc-500/80 px-2 py-0.5 text-xs font-medium text-white">
            售罄
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 text-sm font-medium text-zinc-900">
          {product.title}
        </h3>
        <p className="text-sm text-zinc-600">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
      </div>
    </Link>
  )
}

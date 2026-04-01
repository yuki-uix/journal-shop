'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ShopifyImage } from '@/lib/types/shopify'

export default function ImageGallery({
  images,
  productTitle,
}: {
  images: ShopifyImage[]
  productTitle: string
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const mainImage = images[selectedIndex] ?? images[0]

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-zinc-100 text-zinc-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
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
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
        <Image
          src={mainImage.url}
          alt={mainImage.altText ?? productTitle}
          width={mainImage.width ?? 800}
          height={mainImage.height ?? 800}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setSelectedIndex(i)}
              className={`
                relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all
                ${i === selectedIndex ? 'border-zinc-900' : 'border-transparent hover:border-zinc-300'}
              `}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productTitle} ${i + 1}`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

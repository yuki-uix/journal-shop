'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { CartLine, MoneyV2 } from '@/lib/types/shopify'
import { useCart } from '@/context/CartContext'

function formatPrice(money: MoneyV2) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount))
}

function computeOptimisticTotal(
  amountPerQuantity: MoneyV2,
  quantity: number
): MoneyV2 {
  const unit = parseFloat(amountPerQuantity.amount)
  return {
    amount: (unit * quantity).toFixed(2),
    currencyCode: amountPerQuantity.currencyCode,
  }
}

export function CartItem({ line }: { line: CartLine }) {
  const { updateLine, removeLine } = useCart()
  const [quantity, setQuantity] = useState(line.quantity)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local quantity when server cart data changes (e.g. after API resolves)
  useEffect(() => {
    setQuantity(line.quantity)
  }, [line.quantity])

  function scheduleUpdate(newQty: number) {
    setQuantity(newQty)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateLine(line.id, newQty)
    }, 300)
  }

  function handleDecrement() {
    if (quantity <= 1) {
      removeLine(line.id)
    } else {
      scheduleUpdate(quantity - 1)
    }
  }

  function handleIncrement() {
    scheduleUpdate(quantity + 1)
  }

  const { merchandise } = line
  const image = merchandise.image ?? merchandise.product.featuredImage

  // Optimistic row total: keeps price in sync with local quantity during debounce
  const optimisticTotal = computeOptimisticTotal(
    line.cost.amountPerQuantity,
    quantity
  )

  return (
    <div className="flex gap-3 py-4">
      {image && (
        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md border border-zinc-100">
          <Image
            src={image.url}
            alt={image.altText ?? merchandise.product.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-900 leading-tight">
            {merchandise.product.title}
          </p>
          {merchandise.title !== 'Default Title' && (
            <p className="mt-0.5 text-xs text-zinc-500">{merchandise.title}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-sm text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
              aria-label="减少数量"
            >
              −
            </button>
            <span className="w-5 text-center text-sm text-zinc-900">{quantity}</span>
            <button
              onClick={handleIncrement}
              className="flex h-6 w-6 items-center justify-center rounded border border-zinc-200 text-sm text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900"
              aria-label="增加数量"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-900">
              {formatPrice(optimisticTotal)}
            </span>
            <button
              onClick={() => removeLine(line.id)}
              aria-label="删除商品"
              className="text-zinc-400 transition-colors hover:text-red-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

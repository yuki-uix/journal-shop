'use client'

import { useState } from 'react'
import type { Variant, MoneyV2 } from '@/lib/types/shopify'
import { useCart } from '@/context/CartContext'

function formatPrice(money: MoneyV2) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount))
}

interface OptionGroup {
  name: string
  values: string[]
}

function getOptionGroups(variants: Variant[]): OptionGroup[] {
  const groups = new Map<string, Set<string>>()
  for (const v of variants) {
    for (const opt of v.selectedOptions) {
      if (!groups.has(opt.name)) groups.set(opt.name, new Set())
      groups.get(opt.name)!.add(opt.value)
    }
  }
  return Array.from(groups, ([name, values]) => ({
    name,
    values: Array.from(values),
  }))
}

function findVariant(
  variants: Variant[],
  selections: Record<string, string>
): Variant | undefined {
  return variants.find((v) =>
    v.selectedOptions.every((opt) => selections[opt.name] === opt.value)
  )
}

function isOptionAvailable(
  variants: Variant[],
  selections: Record<string, string>,
  optionName: string,
  optionValue: string
): boolean {
  const hypothetical = { ...selections, [optionName]: optionValue }
  const match = variants.find((v) =>
    v.selectedOptions.every((opt) => hypothetical[opt.name] === opt.value)
  )
  return match?.availableForSale ?? false
}

export default function VariantSelector({
  variants,
}: {
  variants: Variant[]
}) {
  const optionGroups = getOptionGroups(variants)
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const opt of variants[0]?.selectedOptions ?? []) {
      initial[opt.name] = opt.value
    }
    return initial
  })

  const selectedVariant = findVariant(variants, selections) ?? variants[0]
  const isSoldOut = !selectedVariant?.availableForSale

  function handleSelect(name: string, value: string) {
    setSelections((prev) => ({ ...prev, [name]: value }))
  }

  async function handleAddToCart() {
    if (isSoldOut || !selectedVariant || isAdding) return
    setIsAdding(true)
    try {
      await addToCart(selectedVariant.id, 1)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="space-y-1">
        <p className="text-2xl font-bold text-zinc-900 transition-all duration-200">
          {formatPrice(selectedVariant.price)}
        </p>
        {selectedVariant.compareAtPrice &&
          parseFloat(selectedVariant.compareAtPrice.amount) >
            parseFloat(selectedVariant.price.amount) && (
            <p className="text-sm text-zinc-400 line-through">
              {formatPrice(selectedVariant.compareAtPrice)}
            </p>
          )}
      </div>

      {/* Option groups */}
      {optionGroups.map((group) => (
        <div key={group.name} className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-700">{group.name}</h3>
          <div className="flex flex-wrap gap-2">
            {group.values.map((value) => {
              const isSelected = selections[group.name] === value
              const available = isOptionAvailable(
                variants,
                selections,
                group.name,
                value
              )

              return (
                <button
                  key={value}
                  onClick={() => handleSelect(group.name, value)}
                  disabled={!available}
                  className={`
                    relative rounded-md border px-4 py-2 text-sm font-medium transition-all duration-150
                    ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : available
                          ? 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
                          : 'cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-300 line-through'
                    }
                  `}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Stock status */}
      <div className="flex items-center gap-1.5 text-sm">
        {isSoldOut ? (
          <>
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            <span className="text-zinc-400">售罄</span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-zinc-600">有货</span>
          </>
        )}
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={isSoldOut || isAdding}
        className={`
          relative w-full rounded-lg py-3 text-base font-semibold transition-colors duration-150
          ${
            isSoldOut
              ? 'cursor-not-allowed bg-zinc-200 text-zinc-400'
              : isAdding
                ? 'cursor-not-allowed bg-zinc-700 text-white'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-700'
          }
        `}
      >
        {isAdding ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            加入中…
          </span>
        ) : isSoldOut ? (
          '售罄'
        ) : (
          '加入购物车'
        )}
      </button>
    </div>
  )
}

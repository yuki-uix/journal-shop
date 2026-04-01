'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export function Header() {
  const { cart, openCart } = useCart()
  const totalQuantity = cart?.totalQuantity ?? 0

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-900"
        >
          Journal Shop
        </Link>

        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              首页
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              商品
            </Link>
          </nav>

          <button
            onClick={openCart}
            aria-label={`购物车${totalQuantity > 0 ? `，共 ${totalQuantity} 件商品` : ''}`}
            className="relative text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalQuantity > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 animate-[bounce_0.3s_ease-out] items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                {totalQuantity > 99 ? '99+' : totalQuantity}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

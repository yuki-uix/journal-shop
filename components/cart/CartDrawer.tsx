'use client'

import Link from 'next/link'
import type { MoneyV2 } from '@/lib/types/shopify'
import { useCart } from '@/context/CartContext'
import { CartItem } from './CartItem'

function formatPrice(money: MoneyV2) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(parseFloat(money.amount))
}

export function CartDrawer() {
  const { cart, isOpen, closeCart } = useCart()

  const lines = cart?.lines.edges.map((e) => e.node) ?? []

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}
      aria-modal="true"
      role="dialog"
      aria-label="购物车"
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-200 ease-out sm:w-[380px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">购物车</h2>
          <button
            onClick={closeCart}
            aria-label="关闭购物车"
            className="rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-700"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
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
                className="text-zinc-300"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className="text-sm text-zinc-500">购物车是空的</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="text-sm font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-600"
              >
                继续购物
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {lines.map((line) => (
                <CartItem key={line.id} line={line} />
              ))}
            </div>
          )}
        </div>

        {/* Footer — always visible; checkout button disabled when cart is empty */}
        <div className="border-t border-zinc-100 px-5 py-5 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">小计</span>
            <span className="font-semibold text-zinc-900">
              {cart && lines.length > 0
                ? formatPrice(cart.cost.subtotalAmount)
                : '—'}
            </span>
          </div>
          {cart && lines.length > 0 ? (
            <a
              href={cart.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-zinc-900 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-zinc-800 active:bg-zinc-700"
            >
              前往结账
            </a>
          ) : (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-zinc-200 py-3 text-base font-semibold text-zinc-400"
            >
              前往结账
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

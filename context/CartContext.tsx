'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { Cart } from '@/lib/types/shopify'
import {
  fetchCart,
  cartCreate,
  cartLinesAdd,
  cartLinesUpdate,
  cartLinesRemove,
} from '@/lib/shopify/cart'

const CART_ID_KEY = 'shopify_cart_id'

interface CartContextValue {
  cart: Cart | null
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addToCart: (variantId: string, quantity?: number) => Promise<void>
  updateLine: (lineId: string, quantity: number) => Promise<void>
  removeLine: (lineId: string) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const cartIdRef = useRef<string | null>(null)

  // On mount: restore cart from localStorage cartId, handle expired/invalid cartId
  useEffect(() => {
    const savedId = localStorage.getItem(CART_ID_KEY)
    if (!savedId) return

    cartIdRef.current = savedId
    fetchCart(savedId).then((restored) => {
      if (restored) {
        setCart(restored)
      } else {
        // cartId is expired or invalid — clear it so next addToCart creates a fresh cart
        localStorage.removeItem(CART_ID_KEY)
        cartIdRef.current = null
      }
    })
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addToCart = useCallback(async (variantId: string, quantity = 1) => {
    let result: Awaited<ReturnType<typeof cartCreate>>

    if (!cartIdRef.current) {
      result = await cartCreate(variantId, quantity)
    } else {
      result = await cartLinesAdd(cartIdRef.current, variantId, quantity)
    }

    if (result.userErrors.length > 0) {
      throw new Error(result.userErrors[0].message)
    }

    cartIdRef.current = result.cart.id
    localStorage.setItem(CART_ID_KEY, result.cart.id)
    setCart(result.cart)
    setIsOpen(true)
  }, [])

  const updateLine = useCallback(async (lineId: string, quantity: number) => {
    if (!cartIdRef.current) return
    const result = await cartLinesUpdate(cartIdRef.current, lineId, quantity)
    if (result.userErrors.length === 0) setCart(result.cart)
  }, [])

  const removeLine = useCallback(async (lineId: string) => {
    if (!cartIdRef.current) return
    const result = await cartLinesRemove(cartIdRef.current, [lineId])
    if (result.userErrors.length === 0) setCart(result.cart)
  }, [])

  return (
    <CartContext.Provider
      value={{ cart, isOpen, openCart, closeCart, addToCart, updateLine, removeLine }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

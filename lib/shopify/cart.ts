import type { Cart, UserError } from '@/lib/types/shopify'
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
} from '@/lib/shopify/queries/cart'

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
const endpoint = `https://${domain}/api/2024-01/graphql.json`

interface CartMutationResult {
  cart: Cart
  userErrors: UserError[]
}

async function cartFetch<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token!,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Cart API error: ${res.status}`)

  const { data, errors } = await res.json()
  if (errors?.length) throw new Error(errors[0].message)
  return data
}

export async function cartCreate(
  variantId: string,
  quantity: number
): Promise<CartMutationResult> {
  const data = await cartFetch<{ cartCreate: CartMutationResult }>(
    CART_CREATE_MUTATION,
    { input: { lines: [{ merchandiseId: variantId, quantity }] } }
  )
  return data.cartCreate
}

export async function cartLinesAdd(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<CartMutationResult> {
  const data = await cartFetch<{ cartLinesAdd: CartMutationResult }>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] }
  )
  return data.cartLinesAdd
}

export async function cartLinesUpdate(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<CartMutationResult> {
  const data = await cartFetch<{ cartLinesUpdate: CartMutationResult }>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] }
  )
  return data.cartLinesUpdate
}

export async function cartLinesRemove(
  cartId: string,
  lineIds: string[]
): Promise<CartMutationResult> {
  const data = await cartFetch<{ cartLinesRemove: CartMutationResult }>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds }
  )
  return data.cartLinesRemove
}

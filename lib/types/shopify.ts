// GraphQL pagination helpers
export type Edge<T> = { node: T }
export type Connection<T> = { edges: Edge<T>[] }

// Shopify scalar types
export interface MoneyV2 {
  amount: string
  currencyCode: string
}

export interface ShopifyImage {
  url: string
  altText: string | null
  width?: number
  height?: number
}

export interface SelectedOption {
  name: string
  value: string
}

// Product domain
export interface Variant {
  id: string
  title: string
  availableForSale: boolean
  price: MoneyV2
  compareAtPrice: MoneyV2 | null
  selectedOptions: SelectedOption[]
  image: ShopifyImage | null
}

export interface Product {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  tags: string[]
  priceRange: {
    minVariantPrice: MoneyV2
    maxVariantPrice: MoneyV2
  }
  images: Connection<ShopifyImage>
  variants: Connection<Variant>
  featuredImage: ShopifyImage | null
}

// Cart domain
export interface CartLine {
  id: string
  quantity: number
  merchandise: Variant & {
    product: Pick<Product, 'id' | 'handle' | 'title' | 'featuredImage'>
  }
  cost: {
    totalAmount: MoneyV2
    amountPerQuantity: MoneyV2
  }
}

export interface Cart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    totalAmount: MoneyV2
    subtotalAmount: MoneyV2
    totalTaxAmount: MoneyV2 | null
  }
  lines: Connection<CartLine>
}

// Admin API mutation response helpers
export interface UserError {
  field: string[]
  message: string
}

// Storefront API response types
export interface ProductsResponse {
  products: Connection<Product>
}

export interface ProductByHandleResponse {
  productByHandle: Product | null
}

export interface CartResponse {
  cart: Cart
}

// Admin API response types
export interface AdminProductCreateResponse {
  productCreate: {
    product: Pick<Product, 'id' | 'title'> | null
    userErrors: UserError[]
  }
}

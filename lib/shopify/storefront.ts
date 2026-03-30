const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
const endpoint = `https://${domain}/api/2024-01/graphql.json`

export async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token!,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Storefront API HTTP error: ${res.status}`)
  }

  const { data, errors } = await res.json()
  if (errors?.length) throw new Error(errors[0].message)
  return data
}

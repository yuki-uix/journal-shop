export const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 1) {
            edges { node { url altText } }
          }
        }
      }
    }
  }
`

export const GET_ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 1) {
            edges { node { url altText } }
          }
          variants(first: 1) {
            edges { node { availableForSale } }
          }
        }
      }
    }
  }
`

export const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      tags
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            selectedOptions { name value }
            image { url altText width height }
          }
        }
      }
      featuredImage { url altText width height }
    }
  }
`

export const GET_PRODUCTS_BY_TAG_QUERY = `
  query GetProductsByTag($first: Int!, $query: String!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          handle
          title
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 1) {
            edges { node { url altText } }
          }
        }
      }
    }
  }
`

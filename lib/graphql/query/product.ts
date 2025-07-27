
// Consulta para obtener la lista paginada de productos (más ligera)
export const GET_PAGINATED_PRODUCTS = /* GraphQL */`
  query getPaginatedProducts(
    $first: Int,
    $last: Int,
    $after: String,
    $before: String,
    $query: String
  ) {
    products(first: $first, last: $last, after: $after, before: $before, query: $query) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          title
          handle
          featuredImage {
            url
          }
          variants(first: 1) { # Solo traemos la primera variante para obtener el SKU
            edges {
              node {
                sku
              }
            }
          }
        }
      }
    }
  }
`;

// Consulta para obtener el detalle completo de UN solo producto
export const GET_PRODUCT_DETAIL = /* GraphQL */`
  query getProductDetail($id: ID!, $locationIds: [ID!]!) {
    product(id: $id) {
      id
      title
      handle
      description
      featuredImage {
        url
      }
      variants(first: 250) {
        edges {
          node {
            id
            title
            sku
            inventoryQuantities(first: 20, filter: {locationIds: $locationIds}) {
              edges {
                node {
                  quantity
                  location {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

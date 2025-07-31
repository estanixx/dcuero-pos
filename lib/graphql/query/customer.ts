export const GET_PAGINATED_CUSTOMERS = /* GraphQL */`
  query getCustomers($query: String, $first: Int, $after: String, $last: Int, $before: String) {
    customers(query: $query, first: $first, after: $after, last: $last, before: $before) {
      edges {
        cursor
        node {
          id
          firstName
          lastName
          email
          phone
          metafields(first: 10) {
            edges {
              node {
                key
                value
                namespace
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
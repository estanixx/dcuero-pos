export const CREATE_CUSTOMER_MUTATION = /* GraphQL */`
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
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
      userErrors {
        field
        message
      }
    }
  }
`;
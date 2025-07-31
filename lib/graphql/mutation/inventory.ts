export const ADJUST_INVENTORY_MUTATION = /* GraphQL */`
  mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
    inventoryAdjustQuantities(input: $input) {
      userErrors {
        field
        message
      }
      inventoryAdjustmentGroup {
        id
      }
    }
  }
`;

export const CREATE_INVENTORY_TRANSFER_MUTATION = /* GraphQL */`
  mutation inventoryTransferCreate($input: InventoryTransferCreateInput!) {
    inventoryTransferCreate(input: $input) {
      inventoryTransfer {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = /* GraphQL */`
  mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
    productCreate(input: $input, media: $media) {
      product {
        id
        title
        handle
        variants(first: 1) {
          edges {
            node {
              id
              sku
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
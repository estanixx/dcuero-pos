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
  mutation inventoryTransferCreate($input: InventoryTransferInput!) {
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
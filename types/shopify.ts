// Representa la información de inventario en una ubicación específica
export type ShopifyInventoryQuantity = {
  quantity: number;
  location: {
    id: string;
    name: string;
  };
};

// Representa una sola variante de un producto
export type ShopifyLocation = {
  name: string;
  id: string;
}

export type ShopifyQuantity = {
  name: string;
  quantity: number;
}

export type ShopifyVariant = {
  id: string;
  title: string;
  sku: string;
  // Para la consulta de detalle, que trae el inventario de múltiples sedes
  inventoryItem?: {
    id: string;
    inventoryLevels: {
      edges: {
        node: {
          quantities: ShopifyQuantity[];
          location: ShopifyLocation;
        };
      }[];
    };
  };
};

// Representa la imagen destacada de un producto
export type ShopifyImage = {
  url: string;
};

// Representa el nodo principal del producto
export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description?: string; // Opcional, ya que no siempre se pide
  featuredImage?: ShopifyImage;
  variants: {
    edges: {
      node: ShopifyVariant;
    }[];
  };
};

export type ShopifyProductDetail = {
  id: string;
  title: string;
  handle: string;
  description?: string; // Opcional, ya que no siempre se pide
  featuredImage?: ShopifyImage;
  variants: {
    edges: {
      node: ShopifyVariant;
    }[];
  };
};

// Este es el tipo principal que representa un borde en la conexión de productos
// Es la estructura que recibes en el arreglo `products.edges`
export type ShopifyProductEdge = {
  cursor: string;
  node: ShopifyProduct;
};

// Finalmente, el tipo para la respuesta completa de la API de productos paginados
export type PaginatedProductsResponse = {
  edges: ShopifyProductEdge[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
};

export interface GetPaginatedProductsOptions {
  cursor?: string | null;
  direction?: "next" | "prev";
  q?: string | null;
}

export type ShopifyGraphQLResponse<T> = {
  data: T;
  errors?: { message: string }[];
};

// Tipo específico para la respuesta de la lista de productos
export type PaginatedProductsData = {
  products: PaginatedProductsResponse;
};


export type UpdateStockParams = {
  inventoryItemId: string;
  locationId: string;
  delta: number;
}

export type AdjustInventoryResponse = {
  userErrors: {
    field: string;
    message: string;
  }[],
  inventoryAdjustmentGroup: {
    id: string;
  };
} 

export type TransferLineItem =  {
  variantId: string;
  quantity: number;
}

export type CreateTransferParams =  {
  originLocationId: string;
  destinationLocationId: string;
  lineItems: TransferLineItem[];
}

export type CreateTransferResponse = {
  inventoryTransfer: {
    id: string;
    status: string;
  };
  userErrors: {
    field: string;
    message: string;
  }[]
};



// Tipo para representar un cliente de Shopify
export type ShopifyCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  // Campos personalizados para Colombia
  metafields?: {
    edges: {
      node: {
        key: string;
        value: string;
        namespace: string;
      };
    }[];
  };
};

// Tipo para la respuesta paginada de clientes
export type PaginatedCustomersResponse = {
  edges: {
    cursor: string;
    node: ShopifyCustomer;
  }[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
  };
};

export type PaginatedCustomersData = {
  customers: PaginatedCustomersResponse;
};

export type CreateCustomerParams = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  idNumber?: string; // Cédula
  birthDate?: string; // Fecha de nacimiento en formato ISO
};

export type CreateCustomerResponse = {
  customerCreate: {
    customer: ShopifyCustomer;
    userErrors: {
      field: string;
      message: string;
    }[];
  };
};

// ... existing code ...

export type CreateProductParams = {
  title: string;
  description?: string;
  vendor?: string;
  productType?: string;
  sku?: string;
  price?: string;
  barcode?: string;
  inventoryQuantity?: number;
  locationId?: string;
};

export type CreateProductResponse = {
  productCreate: {
    product: {
      id: string;
      title: string;
      handle: string;
      variants: {
        edges: {
          node: {
            id: string;
            sku: string;
          };
        }[];
      };
    };
    userErrors: {
      field: string;
      message: string;
    }[];
  };
};
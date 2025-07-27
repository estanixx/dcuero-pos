// Representa la información de inventario en una ubicación específica
export type ShopifyInventoryQuantity = {
  quantity: number;
  location: {
    id: string;
    name: string;
  };
};

// Representa una sola variante de un producto
export type ShopifyVariant = {
  id: string;
  title:string;
  sku: string;
  // Para la consulta de detalle, que trae el inventario de múltiples sedes
  inventoryQuantities?: {
    edges: {
      node: ShopifyInventoryQuantity;
    }[];
  };
  // Para la consulta de lista, que puede traer el inventario de una sola sede
  inventoryQuantityAtLocation?: {
    quantity: number;
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
  direction?: 'next' | 'prev';
  q?: string | null;
}
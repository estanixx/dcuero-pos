'use server';
import { sql } from "../db";
import { ADJUST_INVENTORY_MUTATION, CREATE_INVENTORY_TRANSFER_MUTATION, CREATE_CUSTOMER_MUTATION, CREATE_PRODUCT_MUTATION } from "./mutation";
import { GET_PAGINATED_PRODUCTS, GET_PRODUCT_DETAIL,GET_PAGINATED_CUSTOMERS } from "./query";
import { CreateCustomerParams, CreateCustomerResponse, GetPaginatedProductsOptions, PaginatedCustomersData, AdjustInventoryResponse, CreateTransferParams, CreateTransferResponse, PaginatedProductsData, ShopifyGraphQLResponse, ShopifyProductDetail, UpdateStockParams, CreateProductParams, CreateProductResponse } from "@/types";

async function shopifyFetch<T>(query: string, variables: Record<string, any> = {}): Promise<Record<string, T>> {
  const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_ACCESS_TOKEN } = process.env;
  const apiUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2025-07/graphql.json`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Error en la API de Shopify: ${response.status}`, errorBody);
    throw new Error(`Error en la API de Shopify: ${response.status}`);
  }
  const body = await response.json() as ShopifyGraphQLResponse<T>;
  if(body.errors){
    console.error(body.errors);
    throw Error('Error interno del servidor.');
  }
  return body.data as Record<string, T>;
}


/**
 * Obtiene una lista paginada de productos de Shopify.
 * @param options - Opciones de paginación y búsqueda.
 */
export async function getPaginatedProducts(options: GetPaginatedProductsOptions = {}): Promise<PaginatedProductsData> {
  const { cursor, direction = 'next', q } = options;

  const variables: Record<string, any> = {};
  if (q) {
    variables.query = `title:*${q}* OR sku:*${q}*`;
  }

  if (direction === 'next') {
    variables.first = 12;
    if (cursor) variables.after = cursor;
  } else {
    variables.last = 12;
    if (cursor) variables.before = cursor;
  }

  const data = await shopifyFetch<PaginatedProductsData>(GET_PAGINATED_PRODUCTS, variables);
  return data.products;
}



/**
 * Obtiene el detalle completo de un solo producto, incluyendo el inventario
 * en todas las ubicaciones registradas en la base de datos.
 * @param productId - El GID del producto de Shopify (ej: "gid://shopify/Product/12345").
 */
export async function getProductDetail(productId: string): Promise<ShopifyProductDetail> {
  // Obtenemos TODAS las ubicaciones de nuestra base de datos
  const allDbLocations = await sql`
    SELECT shopify_location_id FROM sell_location;
  `;

  // Construimos una cadena de consulta para el filtro
  // El formato es: "location_id:123 OR location_id:456"
  const locationQuery = allDbLocations
    .map((loc: any) => `location_id:${loc.shopify_location_id}`)
    .join(' OR ');

  // Aseguramos que la consulta no esté vacía
  if (!locationQuery) {
    throw new Error("No se encontraron ubicaciones en la base de datos para filtrar el inventario.");
  }

  const variables = {
    id: productId,
    locationQuery: locationQuery, // Pasamos la variable con el nombre correcto
  };
  

  // Usamos la consulta GraphQL corregida
  const data = await shopifyFetch<ShopifyProductDetail>(GET_PRODUCT_DETAIL, variables);
  return data.product;
}


/**
 * Ajusta la cantidad de inventario para un item en una ubicación específica.
 * @param params - Los parámetros para la actualización de stock.
 * @returns El resultado de la mutación de Shopify.
 */
export async function updateStock({ inventoryItemId, locationId, delta }: UpdateStockParams) {
  const variables = {
    input: {
      reason: "correction",
      name: "available",
      changes: [
        {
          inventoryItemId,
          locationId,
          delta,
        },
      ],
    },
  };
  const data = await shopifyFetch<AdjustInventoryResponse>(ADJUST_INVENTORY_MUTATION, variables);
  
  // Verificamos si Shopify devolvió errores de usuario
  const userErrors = data.inventoryAdjustQuantities?.userErrors;
  if (userErrors && userErrors.length > 0) {
    // Lanzamos un error que será capturado por la API route
    throw new Error(userErrors[0].message);
  }

  return data.inventoryAdjustQuantities.inventoryAdjustmentGroup;
}

/**
     * Crea un nuevo traslado de inventario en Shopify en estado "borrador".
     * @param params - Los detalles del traslado.
     * @returns El traslado de inventario creado.
     */
export async function createInventoryTransfer({ 
  originLocationId, 
  destinationLocationId, 
  lineItems,
  customer,
}: CreateTransferParams) {
  
  const variables = {
    input: {
      originLocationId,
      destinationLocationId,
      lineItems,
      note: customer ? JSON.stringify(customer) : undefined,
      referenceName: `Traslado POS - ${new Date().toLocaleDateString('es-CO')}`,
    },
  };

  const data = await shopifyFetch<CreateTransferResponse>(CREATE_INVENTORY_TRANSFER_MUTATION, variables);
  
  const userErrors = data.inventoryTransferCreate?.userErrors;
  if (userErrors && userErrors.length > 0) {
    throw new Error(userErrors[0].message);
  }

  return data.inventoryTransferCreate.inventoryTransfer;
}

/**
 * Obtiene una lista paginada de clientes de Shopify.
 * @param options - Opciones de paginación y búsqueda.
 */
export async function getPaginatedCustomers(options: GetPaginatedProductsOptions = {}): Promise<PaginatedCustomersData> {
  const { cursor, direction = 'next', q } = options;

  const variables: Record<string, any> = {};
  if (q) {
    variables.query = `firstName:*${q}* OR lastName:*${q}* OR email:*${q}* OR phone:*${q}*`;
  }

  if (direction === 'next') {
    variables.first = 10;
    if (cursor) variables.after = cursor;
  } else {
    variables.last = 10;
    if (cursor) variables.before = cursor;
  }

  const data = await shopifyFetch<PaginatedCustomersData>(GET_PAGINATED_CUSTOMERS, variables);
  return data.customers;
}

/**
 * Crea un nuevo cliente en Shopify.
 * @param params - Los datos del cliente a crear.
 * @returns El cliente creado.
 */
export async function createCustomer({ 
  firstName, 
  lastName, 
  email, 
  phone,
  idNumber,
  birthDate
}: CreateCustomerParams) {
  
  const input: any = {
    firstName,
    lastName,
    email,
    phone,
    emailMarketingConsent: {
      marketingState: 'SUBSCRIBED',
      marketingOptInLevel: 'SINGLE_OPT_IN'
    },
    smsMarketingConsent: {
      marketingState: 'SUBSCRIBED',
      marketingOptInLevel: 'SINGLE_OPT_IN'
    }
  };

  // Añadir metafields para cédula y fecha de nacimiento si se proporcionan
  const metafields = [];
  
  if (idNumber) {
    metafields.push({
      key: "id_number",
      value: idNumber,
      namespace: "custom",
      type: 'id'
    });
  }
  
  if (birthDate) {
    metafields.push({
      key: "birth_date",
      value: birthDate,
      namespace: "custom",
      type: 'date',
    });
  }
  
  if (metafields.length > 0) {
    input.metafields = metafields;
  }

  const variables = {
    input
  };

  const data = await shopifyFetch<CreateCustomerResponse>(CREATE_CUSTOMER_MUTATION, variables);
  
  const userErrors = data.customerCreate?.userErrors;
  if (userErrors && userErrors.length > 0) {
    console.error('Error al crear cliente:', userErrors);
    throw new Error(userErrors[0].message);
  }

  return data.customerCreate.customer;
}

/**
 * Creates a new product in Shopify.
 * @param params - The product data to create.
 * @returns The created product.
 */
export async function createProduct({ 
  title, 
  description, 
  vendor,
  productType,
  sku,
  price,
  barcode,
  inventoryQuantity,
  locationId
}: CreateProductParams) {
  
  const input: any = {
    title,
    descriptionHtml: description,
    vendor,
    productType,
    status: "ACTIVE",
    variants: [{
      sku,
      price,
      barcode,
      inventoryQuantities: inventoryQuantity && locationId ? [{
        availableQuantity: inventoryQuantity,
        locationId
      }] : undefined
    }]
  };

  const variables = {
    input
  };

  const data = await shopifyFetch<CreateProductResponse>(CREATE_PRODUCT_MUTATION, variables);
  
  const userErrors = data.productCreate?.userErrors;
  if (userErrors && userErrors.length > 0) {
    console.error('Error creating product:', userErrors);
    throw new Error(userErrors[0].message);
  }

  return data.productCreate.product;
}
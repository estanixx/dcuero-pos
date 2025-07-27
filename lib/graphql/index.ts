'use server';
import '@shopify/shopify-api/adapters/node';
import { sql } from "../db";
import { GET_PAGINATED_PRODUCTS, GET_PRODUCT_DETAIL } from "./query";
import { GetPaginatedProductsOptions } from "@/types";
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';

const shopify = shopifyApi({
  apiSecretKey: process.env.SHOPIFY_SECRET_KEY || '',
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiVersion: LATEST_API_VERSION,
  scopes: ['read_products'],
  hostName: 'ngrok-tunnel-address',
});
async function shopifyFetch(query: string, variables: Record<string, any> = {}) {
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

  return response.json();
}


/**
 * Obtiene una lista paginada de productos de Shopify.
 * @param options - Opciones de paginación y búsqueda.
 */
export async function getPaginatedProducts(options: GetPaginatedProductsOptions = {}) {
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

  const data = await shopifyFetch(GET_PAGINATED_PRODUCTS, variables);
  return data.data.products;
}



/**
 * Obtiene el detalle completo de un solo producto, incluyendo el inventario
 * en todas las ubicaciones registradas en la base de datos.
 * @param productId - El GID del producto de Shopify (ej: "gid://shopify/Product/12345").
 */
export async function getProductDetail(productId: string) {
  // Obtenemos TODAS las ubicaciones de nuestra base de datos para filtrar el inventario
  const allDbLocations = await sql`
    SELECT shopify_location_id FROM sell_location;
  `;
  const locationGids = allDbLocations.map(
    (loc) => `gid://shopify/Location/${loc.shopify_location_id}`
  );

  const variables = {
    id: productId,
    locationIds: locationGids,
  };

  const data = await shopifyFetch(GET_PRODUCT_DETAIL, variables);
  return data.data.product;
}

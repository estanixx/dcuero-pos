import { type NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { createProduct } from '@/lib/graphql';

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get data from request body
    const { 
      title, 
      description, 
      vendor, 
      productType, 
      sku, 
      price, 
      barcode,
      inventoryQuantity,
      locationId
    } = await request.json();

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'El título del producto es requerido' }, { status: 400 });
    }

    // Create product
    const product = await createProduct({ 
      title, 
      description, 
      vendor, 
      productType, 
      sku, 
      price, 
      barcode,
      inventoryQuantity,
      locationId
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
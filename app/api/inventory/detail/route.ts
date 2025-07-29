import { type NextRequest, NextResponse } from 'next/server';
import { getProductDetail } from '@/lib/graphql'; // O la ruta a tu servicio

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: "Falta el ID del producto" }, { status: 400 });
    }

    // Llamamos a nuestra función de servicio segura del lado del servidor
    const productDetails = await getProductDetail(productId);
    if (!productDetails) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Devolvemos los datos como JSON al cliente
    return NextResponse.json(productDetails);

  } catch (error) {
    console.error("Error en la API de detalle de producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
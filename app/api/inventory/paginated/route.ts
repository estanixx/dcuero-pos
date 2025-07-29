import { type NextRequest, NextResponse } from 'next/server';
import { getPaginatedProducts } from '@/lib/graphql'; // O la ruta a tu servicio

export async function GET(request: NextRequest) {
  try {
    // Leemos los parámetros de la URL de la petición entrante
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const direction = (searchParams.get('direction') as 'next' | 'prev') || 'next';
    const q = searchParams.get('q');

    // Llamamos a nuestra función de servicio segura del lado del servidor
    const productsData = await getPaginatedProducts({
      cursor,
      direction,
      q,
    });

    // Devolvemos los datos como JSON al cliente
    return NextResponse.json(productsData);

  } catch (error) {
    console.error("Error en la API de inventario:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
import { type NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { updateStock } from '@/lib/graphql'; // Importamos el nuevo método

export async function POST(request: NextRequest) {
  try {
    // 1. La autenticación permanece en la capa de la API
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Obtenemos los datos del cuerpo de la petición
    const { inventoryItemId, locationId, delta } = await request.json();

    if (!inventoryItemId || !locationId || delta === undefined) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    // 3. Llamamos al método del servicio con los datos validados
    const adjustment = await updateStock({ inventoryItemId, locationId, delta });

    return NextResponse.json({ success: true, adjustment });

  } catch (error: any) {
    // Capturamos cualquier error lanzado por el servicio o la autenticación
    console.error('Error al actualizar el stock:', error);
    // Devolvemos un error 422 (Unprocessable Entity) si es un error de lógica de negocio
    // o 500 para errores generales.
    const status = error.message.includes("Cannot set quantity to") ? 422 : 500;
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status });
  }
}
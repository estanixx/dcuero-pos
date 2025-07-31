import { type NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { getPaginatedCustomers, createCustomer } from '@/lib/graphql';

export async function GET(request: NextRequest) {
  try {
    // Autenticación
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const direction = searchParams.get('direction') as 'next' | 'prev' || 'next';
    const q = searchParams.get('q');

    // Obtener clientes paginados
    const customers = await getPaginatedCustomers({ cursor, direction, q });

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Autenticación
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener datos del cuerpo
    const { firstName, lastName, email, phone, idNumber, birthDate } = await request.json();

    // Validar datos requeridos
    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Nombre y apellido son requeridos' }, { status: 400 });
    }

    // Crear cliente
    const customer = await createCustomer({ firstName, lastName, email, phone, idNumber, birthDate });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error('Error al crear cliente:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
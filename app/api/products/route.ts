// app/api/products/route.ts
import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth0.getSession();

  // 1. Check if the user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // 2. Access user roles and locations from the session
  const userRoles = session.user['https://dcuero-pos.com/roles'] || [];
  const userSedes = session.user['https://dcuero-pos.com/sedes'] || [];

  console.log('User Roles:', userRoles);
  console.log('User Assigned Sedes:', userSedes);

  // Here you would add logic based on role.
  // For example: if (!userRoles.includes('Administrator') && userSedes.length === 0) {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }

  // 3. Securely call the Shopify API from the backend
  const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_ACCESS_TOKEN } = process.env;
  const shopifyUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/products.json?limit=10`;

  try {
    const shopifyResponse = await fetch(shopifyUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN!,
        'Content-Type': 'application/json',
      },
    });

    if (!shopifyResponse.ok) {
      throw new Error(`Shopify API responded with status ${shopifyResponse.status}`);
    }

    const data = await shopifyResponse.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
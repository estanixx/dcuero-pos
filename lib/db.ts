'use server';
import { neon } from '@neondatabase/serverless';

if (!process.env.POSTGRES_URL) {
  console.log(process.env.POSTGRES_URL)
  throw new Error('La variable de entorno POSTGRES_URL para la base de datos no está definida.');
}

// Exportamos la función `sql` ya configurada con la cadena de conexión.
export const sql = neon(process.env.POSTGRES_URL);
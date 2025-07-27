import { Auth0User, Sede, AppError } from "@/types";
import { auth0 } from "./auth0";
import { sql } from "./db";
import { cache } from "react";

export const getAvailableSedes = cache(
  async (user: Auth0User): Promise<Sede[]> => {
    try {
      // El namespace debe ser EXACTAMENTE el mismo que usaste en la Acción de Auth0
      const namespace = process.env.AUTH0_AUDIENCE;
      const userRoles = (user.roles as string[]) || [];
      const userSedesSlugs = (user.sedes as string[]) || [];

      const isAdministrator = userRoles.includes("Administrator");
      let locations: Sede[];

      if (isAdministrator) {
        const result: Sede[] =
          (await sql`SELECT slug, name, image_url, shopify_location_id FROM sell_location;`) as Sede[];
        locations = result;
      } else {
        if (userSedesSlugs.length === 0) {
          console.error({ error: "El usuario no tiene sedes asignadas" });
          return [];
        }
        const result: Sede[] =
          (await sql`SELECT slug, name, image_url, shopify_location_id FROM sell_location WHERE slug = ANY(${userSedesSlugs});`) as Sede[];
        locations = result;
      }

      return locations;
    } catch (error: any) {
      console.error("Error al obtener las sedes:", error);
      return [];
    }
  }
);

export const getAuth0User = cache(async (): Promise<Auth0User | null> => {
  const session = await auth0.getSession();
  if (!session?.tokenSet?.accessToken) {
    // Si no hay Access Token, significa que la audiencia no está configurada
    // o el usuario no ha iniciado sesión correctamente.
    console.error({
      error:
        "No se encontró el Access Token. ¿Configuraste la audiencia (AUTH0_AUDIENCE)?",
    });
    return null;
  }

  try {
    // 1. Construimos la URL del endpoint /userinfo usando tu dominio de Auth0
    const userInfoUrl = `https://${process.env.AUTH0_DOMAIN}/userinfo`;

    // 2. Hacemos la petición a Auth0
    const response = await fetch(userInfoUrl, {
      headers: {
        // 3. Enviamos el Access Token en el encabezado de autorización
        Authorization: `Bearer ${session?.tokenSet?.accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error({
        error: "Error al obtener la información del usuario desde Auth0",
      });
      return null;
    }

    // 4. Convertimos la respuesta a JSON y la devolvemos
    const userInfo = await response.json();
    userInfo.roles = userInfo[`${process.env.AUTH0_AUDIENCE}roles`] || [];
    userInfo.sedes = userInfo[`${process.env.AUTH0_AUDIENCE}sedes`] || [];
    delete userInfo[`${process.env.AUTH0_AUDIENCE}sedes`];
    delete userInfo[`${process.env.AUTH0_AUDIENCE}roles`];

    return userInfo;
  } catch (error: any) {
    console.error("Error al llamar a /userinfo:", error);
    return null;
  }
});

export const getSedeBySlug = async (slug: string): Promise<Sede | null> => {
  const result: Sede[] =
    (await sql`SELECT slug, name, image_url, shopify_location_id FROM sell_location WHERE slug = ${slug};`) as Sede[];
  if (result) {
    return result[0];
  }
  return null;
};

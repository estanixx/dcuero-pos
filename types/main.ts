export type Sede = {
  slug: string;
  shopify_location_id: string;
  name: string;
  image_url: string;
  created_at: string;
}
export type Auth0User = {
  given_name?: string;
  family_name?: string;
  nickname: string;
  name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  sub: string;
  sedes: string[];
  roles: string[];
}


export type AppError = {
  error: string;
  details?: string | object
}
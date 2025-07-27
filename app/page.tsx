import ProtectedRoute from "@/components/layout/protected-route";
import { getAuth0User } from "@/lib/api";
import { Auth0User } from "@/types";

export default async function Home() {
  const user: Auth0User | null = await getAuth0User()
  return (
    <ProtectedRoute condition={!!user && !!user?.roles}>
      Hola
    </ProtectedRoute>
  )
}
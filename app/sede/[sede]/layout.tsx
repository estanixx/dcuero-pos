import ProtectedRoute from "@/components/layout/protected-route";
import { getAuth0User, getAvailableSedes, getSedeBySlug } from "@/lib/api";
import React from "react";

export default async function SedeLayout({ children, params }: { children: React.ReactNode, params: { sede: string } }){
  const user = await getAuth0User();
  const sedes = user ? await getAvailableSedes(user) : [];
  const sede = await getSedeBySlug((await params).sede);

  return (
    <ProtectedRoute condition={!!user && !!sede && sedes.some( ({slug}) => slug === sede.slug ) }>
      {children}
    </ProtectedRoute>
  )
}
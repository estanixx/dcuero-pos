import { Auth0User } from "@/types";
import React from "react";

export default function ProtectedRoute({
  condition,
  children,
}: {
  condition: boolean;
  children: React.ReactNode;
}) {
  if (condition) {
    return <main className="w-3/4 m-auto">{children}</main>;
  } else {
    return (
      <main className="w-3/4 m-auto flex flex-col justify-center h-[80vh] items-center">
        <h2 className="text-xl font-medium">Ups...</h2>
        <p>Parece que no tienes permiso para estar aquí.</p>
        <p>Habla con un administrador para acceder a esta característica.</p>
      </main>
    );
  }
}

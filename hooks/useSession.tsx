import { SessionContext } from "@/context/session";
import { useContext } from "react";

// (Opcional pero recomendado) Creamos un hook personalizado para usar el contexto más fácilmente
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe ser usado dentro de un SessionProvider');
  }
  return context;
};
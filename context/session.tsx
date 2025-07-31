'use client';

import { createContext, useContext } from 'react';
import { Auth0User, Sede } from '@/types';

// Definimos la forma de los datos que nuestro contexto almacenará
export type SessionContextType = {
  user: Auth0User | null;
  availableSedes: Sede[];
  allSedes: { [key: string] : Sede };
}

// Creamos el contexto. ¡Asegúrate de exportarlo!
export const SessionContext = createContext<SessionContextType | null>(null);


// El SessionProvider que ya tenías está bien, lo incluyo aquí para tener el archivo completo
export const SessionProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SessionContextType;
}) => {
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};
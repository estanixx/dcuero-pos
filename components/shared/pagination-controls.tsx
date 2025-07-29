'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export default function PaginationControls({
  hasNextPage,
  hasPreviousPage,
  startCursor,
  endCursor,
}: PaginationControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Función para crear la URL de la página anterior
  const createPrevPageUrl = () => {
    const params = new URLSearchParams(searchParams);
    params.set('direction', 'prev');
    params.set('cursor', startCursor || '');
    return `${pathname}?${params.toString()}`;
  };

  // Función para crear la URL de la página siguiente
  const createNextPageUrl = () => {
    const params = new URLSearchParams(searchParams);
    params.set('direction', 'next');
    params.set('cursor', endCursor || '');
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createPrevPageUrl()}
            // El componente maneja el estado deshabilitado visualmente
            // si no tiene un href válido o con clases específicas.
            // Le añadimos `aria-disabled` para mejorar la accesibilidad.
            aria-disabled={!hasPreviousPage}
            // Evita que se pueda hacer clic si no hay página anterior
            className={!hasPreviousPage ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {/* No renderizamos números de página porque usamos cursores */}
        <PaginationItem>
          <PaginationNext
            href={createNextPageUrl()}
            aria-disabled={!hasNextPage}
            className={!hasNextPage ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
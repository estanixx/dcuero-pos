'use client';

import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { getProductDetail } from '@/lib/graphql'; // Asumimos que esta función existe
import { ShopifyProductEdge } from '@/types';

interface ProductDetailSidebarProps {
  productEdge: ShopifyProductEdge | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductDetailSidebar({ productEdge, isOpen, onOpenChange }: ProductDetailSidebarProps) {
  const [detailedProduct, setDetailedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (productEdge?.node.id) {
      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          // Llama al método del servicio para obtener todos los detalles
          const details = await getProductDetail(productEdge.node.id);
          setDetailedProduct(details);
        } catch (error) {
          console.error("Error fetching product details:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [productEdge]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{productEdge?.node.title || 'Detalle del Producto'}</SheetTitle>
          <SheetDescription>
            Aquí puedes ver el detalle de las variantes, el stock en todas las sedes y solicitar traslados.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {isLoading ? (
            <p>Cargando detalles...</p>
          ) : (
            <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
              <code className="text-white">{JSON.stringify(detailedProduct, null, 2)}</code>
            </pre>
          )}
        </div>
        <SheetFooter>
          {/* Aquí irían los botones de acción como "Solicitar Traslado" */}
          <Button type="submit">Guardar Cambios</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShopifyProduct, ShopifyProductEdge } from '@/types';
import { useSession } from '@/hooks/useSession';
import { useParams } from 'next/navigation';
import VariantStockCard from './variant-card'; // Importamos el nuevo componente

interface ProductDetailSidebarProps {
  productEdge: ShopifyProductEdge | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Componente para mostrar un esqueleto de carga (sin cambios)
const SidebarSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-5 w-3/g rounded bg-gray-200"></div>
    <div className="h-16 w-full rounded bg-gray-200"></div>
    <div className="h-5 w-1/2 rounded bg-gray-200 mt-4"></div>
    <div className="p-3 border rounded-md space-y-2">
      <div className="h-5 w-1/3 rounded bg-gray-200"></div>
      <div className="h-4 w-full rounded bg-gray-200"></div>
      <div className="h-4 w-3/4 rounded bg-gray-200"></div>
    </div>
  </div>
);

export default function ProductDetailSidebar({ productEdge, isOpen, onOpenChange }: ProductDetailSidebarProps) {
  const [detailedProduct, setDetailedProduct] = useState<ShopifyProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { availableSedes } = useSession();
  const params = useParams();
  const currentSedeSlug = params.sede as string;

  const currentLocation = availableSedes.find(s => s.slug === currentSedeSlug);
  const currentLocationId = currentLocation ? `gid://shopify/Location/${currentLocation.shopify_location_id}` : null;

  // Esta función ahora puede ser llamada por los hijos para recargar los datos
  const fetchDetails = async () => {
    if (!productEdge?.node.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/inventory/detail?productId=${productEdge.node.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "No se pudieron cargar los detalles.");
      }
      const details = await response.json();
      setDetailedProduct(details);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && productEdge?.node.id) {
      fetchDetails();
    }
  }, [isOpen, productEdge]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle>{productEdge?.node.title || 'Detalle del Producto'}</SheetTitle>
          <SheetDescription>
            Gestiona el stock de este producto y solicita traslados.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-4 px-1 flex-grow overflow-y-auto">
          {isLoading && !detailedProduct && <SidebarSkeleton />}
          {error && <p className="text-red-500">{error}</p>}
          
          {detailedProduct && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: detailedProduct.description || "Sin descripción." }} />
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 text-base">Variantes y Stock</h3>
                <div className="space-y-4">
                  {/*
                    * AHORA MAPEAMOS Y RENDERIZAMOS EL COMPONENTE VariantStockCard
                    * Pasamos todos los props necesarios para que cada tarjeta sea autónoma.
                  */}
                  {detailedProduct.variants.edges.map(({ node: variant }) => (
                    <VariantStockCard
                      key={variant.id}
                      variant={variant}
                      currentLocationId={currentLocationId}
                      currentLocationName={currentLocation?.name}
                      onStockUpdate={fetchDetails} // Pasamos la función para recargar
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <SheetFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

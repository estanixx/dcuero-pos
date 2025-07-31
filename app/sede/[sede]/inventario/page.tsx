'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { ProductCard } from '@/components/inventory/product-card';
import ProductDetailSidebar from '@/components/inventory/product-detail-sidebar';
import { PaginatedProductsResponse, ShopifyProductEdge } from '@/types';
import PaginationControls from '@/components/shared/pagination-controls';
import { useProductModal } from '@/hooks/useProductModal';

export default function InventarioPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openProductModal } = useProductModal();

  const [productsData, setProductsData] = useState<PaginatedProductsResponse | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProductEdge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usamos useCallback para que la función no se recree en cada renderizado
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Construimos la URL para nuestra API con los parámetros actuales
    const params = new URLSearchParams(searchParams);
    const url = `/api/inventory/paginated?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('No se pudieron cargar los productos.');
      }
      const data = await response.json();
      setProductsData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]); // La dependencia es searchParams

  // El useEffect ahora depende de la función fetchProducts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const products = productsData?.edges || [];
  const pageInfo = productsData?.pageInfo;
  const searchTerm = searchParams.get('q') || '';

  const handleProductClick = (productEdge: ShopifyProductEdge) => {
    setSelectedProduct(productEdge);
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Inventario</h1>
          <form className="flex gap-2 w-full max-w-sm" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newSearchTerm = formData.get('q') as string;
              const newParams = new URLSearchParams(searchParams);
              newParams.set('q', newSearchTerm);
              newParams.delete('cursor'); // Resetea el cursor al buscar
              newParams.delete('direction');
              router.push(`${pathname}?${newParams.toString()}`);
          }}>
            <Input name="q" placeholder="Buscar..." defaultValue={searchTerm} />
            <Button type="submit">
              <FaSearch className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </form>
        </div>

        {error && <p className="text-red-500 text-center py-4">{error}</p>}
        
        {isLoading ? (
          <div className="text-center py-16"><p>Cargando productos...</p></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16"><p>No se encontraron productos.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((productEdge) => (
              <div key={productEdge.node.id} onClick={() => handleProductClick(productEdge)} className="cursor-pointer">
                <ProductCard productEdge={productEdge} />
              </div>
            ))}
          </div>
        )}

        {pageInfo && (
          <PaginationControls
            hasNextPage={pageInfo.hasNextPage}
            hasPreviousPage={pageInfo.hasPreviousPage}
            startCursor={pageInfo.startCursor}
            endCursor={pageInfo.endCursor}
          />
        )}

        {/* Floating button to create a new product */}
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
          onClick={openProductModal}
        >
          <FaPlus className="w-5 h-5" />
        </Button>
      </div>

      <ProductDetailSidebar
        productEdge={selectedProduct}
        isOpen={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </>
  );
}
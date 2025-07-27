"use client";
import { getPaginatedProducts } from "@/lib/graphql";
import { useParams, useSearchParams } from "next/navigation";
import { PaginatedProductsResponse, ShopifyProductEdge } from "@/types";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import { ProductCard } from "@/components/inventory/product-card";
import Link from "next/link";
import ProductDetailSidebar from "@/components/inventory/product-detail-sidebar";

type PaginationData = {
  cursor?: string;
  direction?: "next" | "prev";
  q?: string;
};

// La página principal sigue siendo un Server Component para obtener los datos iniciales.
// Esto nos da lo mejor de ambos mundos: carga rápida y interactividad.
export default function InventarioPage() {

  const { sedeSlug } = useParams();
  const pagination = useSearchParams() as PaginationData;

  const [productsData, setProductsData] =
    useState<PaginatedProductsResponse | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ShopifyProductEdge | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Obtenemos los datos iniciales en el servidor.

  useEffect(() => {
    setIsLoading(true);
    getPaginatedProducts(pagination)
      .then((r) => setProductsData(r))
      .finally(() => setIsLoading(false));
  }, []);

  const products = productsData?.edges || [];
  const pageInfo = productsData?.pageInfo;
  const searchTerm = pagination.q as string | undefined;

  // Función para manejar el clic en una tarjeta de producto
  const handleProductClick = (productEdge: ShopifyProductEdge) => {
    setSelectedProduct(productEdge);
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Inventario</h1>
          <form className="flex gap-2 w-full max-w-sm">
            <Input name="q" placeholder="Buscar..." defaultValue={searchTerm} />
            <Button type="submit">
              <FaSearch className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </form>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              Cargando productos...
            </p>
          </div>
        ) : !products ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              No se encontraron productos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((productEdge) => (
              <div
                key={productEdge.node.id}
                onClick={() => handleProductClick(productEdge)}
                className="cursor-pointer"
              >
                <ProductCard productEdge={productEdge} />
              </div>
            ))}
          </div>
        )}

        {/* Controles de Paginación */}
        <div className="flex justify-center items-center mt-8 gap-4">
          <Link
            href={`/${sedeSlug}/inventario?direction=prev&cursor=${
              pageInfo?.startCursor
            }&q=${searchTerm || ""}`}
            passHref
          >
            <Button disabled={!pageInfo?.hasPreviousPage}>Anterior</Button>
          </Link>
          <Link
            href={`/${sedeSlug}/inventario?direction=next&cursor=${
              pageInfo?.endCursor
            }&q=${searchTerm || ""}`}
            passHref
          >
            <Button disabled={!pageInfo?.hasNextPage}>Siguiente</Button>
          </Link>
        </div>
      </div>

      {/* La Barra Lateral (Sheet) que se abre cuando hay un producto seleccionado */}
      <ProductDetailSidebar
        productEdge={selectedProduct}
        isOpen={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null);
          }
        }}
      />
    </>
  );
}

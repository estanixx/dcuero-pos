import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ShopifyProductEdge } from "@/types";
import Image from "next/image";

export const ProductCard: React.FC<{ productEdge: ShopifyProductEdge }> = ({ productEdge }) => {
  const { node: product } = productEdge;
  const firstVariant = product.variants.edges[0]?.node;

  return (
    // Envolvemos la tarjeta en un Link para que navegue al detalle del producto
    // Usaremos el 'handle' del producto para la URL, que es más amigable
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
      <CardHeader className="p-0">
        <div className="relative w-full h-48 bg-gray-100">
          <Image
            src={
              product.featuredImage?.url ||
              "https://placehold.co/600x400?text=Sin+Imagen"
            }
            alt={`Imagen de ${product.title}`}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg truncate" title={product.title}>
          {product.title}
        </CardTitle>
        <CardDescription className="mt-1">
          Ref: {firstVariant?.sku || "N/A"}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

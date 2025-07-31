// Crea este nuevo archivo en: components/inventory/VariantStockCard.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShopifyVariant } from "@/types";
import { toast } from "sonner";
import LocationStock from "./location-stock";

interface VariantStockCardProps {
  variant: ShopifyVariant;
  currentLocationId: string | null;
  currentLocationName: string | undefined;
  onStockUpdate: () => void; // Función para notificar al padre que debe recargar los datos
}

export default function VariantStockCard({
  variant,
  currentLocationId,
  currentLocationName,
  onStockUpdate,
}: VariantStockCardProps) {
  const currentSedeStock =
    variant.inventoryItem?.inventoryLevels.edges.find(
      (edge) => edge.node.location.id === currentLocationId
    )?.node.quantities[0]?.quantity || 0;
  const otherSedeStock = variant.inventoryItem?.inventoryLevels.edges.filter(
    (edge) => edge.node.location.id !== currentLocationId
  );
  // Cada tarjeta ahora maneja su propio estado de input
  const [stockInput, setStockInput] = useState<string>(
    currentSedeStock.toString()
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStock = async () => {
    const inventoryItemId = variant.inventoryItem?.id;

    if (!currentLocationId || !inventoryItemId) {
      toast.error("Error: Faltan datos de ubicación o inventario.");
      return;
    }

    const newStock = parseInt(stockInput, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast.error("Por favor, ingresa un número válido para el stock.");
      return;
    }

    const delta = newStock - currentSedeStock;
    if (delta === 0) {
      toast.info("No hay cambios en el stock.");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/inventory/update-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryItemId,
          locationId: currentLocationId,
          delta,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error del servidor.");

      toast.success(`Stock de "${variant.title}" actualizado.`);
      onStockUpdate(); // Notifica al componente padre para que recargue los datos
    } catch (error: any) {
      toast.error(`Error al actualizar: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50/50">
      <p className="font-medium">
        {variant.title}{" "}
        <span className="text-xs text-muted-foreground">
          (SKU: {variant.sku})
        </span>
      </p>

      <div className="mt-3">
        <Label htmlFor={`stock-${variant.id}`} className="text-sm font-medium">
          Stock en {currentLocationName}
        </Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            id={`stock-${variant.id}`}
            type="number"
            value={stockInput}
            onChange={(e) => setStockInput(e.target.value)}
            className="w-24"
            disabled={isUpdating}
          />
          <Button
            size="sm"
            variant="outline"
            className='cursor-pointer disabled:cursor-not-allowed'
            onClick={handleUpdateStock}
            disabled={isUpdating}
          >
            {isUpdating ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-muted-foreground mb-1">
          Stock en otras sedes:
        </p>
        <ul className="text-xs space-y-1">
          {otherSedeStock && otherSedeStock.length > 0
            ? otherSedeStock.map(({ node: inv }) => (
                <LocationStock
                  key={inv.location.id}
                  location={inv.location}
                  quantities={inv.quantities}
                  currentLocationId={currentLocationId}
                  currentLocationName={currentLocationName}
                  variant={variant} // Añadir la variante como prop
                />
              ))
            : "No hay stock en otras sedes"}
        </ul>
      </div>
    </div>
  );
}

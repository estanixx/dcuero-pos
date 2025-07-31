"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShopifyCustomer, ShopifyLocation, ShopifyVariant } from "@/types";
import { FaUser } from "react-icons/fa";
import { useCustomerModal } from "@/hooks/useCustomerModal";
import { useSession } from "@/hooks/useSession";

type TransferModalProps = {
  isOpen: boolean;
  onClose: () => void;
  variant: ShopifyVariant;
  originLocation: ShopifyLocation;
  destinationLocationId: string | null;
  destinationLocationName: string | undefined;
  availableQuantity: number;
};

export default function TransferModal({
  isOpen,
  onClose,
  variant,
  originLocation,
  destinationLocationId,
  destinationLocationName,
  availableQuantity,
}: TransferModalProps) {
  const [relatedCustomer, setRelatedCustomer] = useState<
    ShopifyCustomer | undefined
  >(undefined);
  const { allSedes } = useSession()
  const { openCustomerModal } = useCustomerModal()
  const [quantity, setQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmTransfer = async () => {
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("Por favor, ingresa una cantidad válida.");
      return;
    }

    if (parsedQuantity > availableQuantity) {
      toast.error(
        `No hay suficiente stock disponible. Máximo: ${availableQuantity}`
      );
      return;
    }

    if (!destinationLocationId) {
      toast.error("Error: Ubicación de destino no válida.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inventory/request-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originLocationId: originLocation.id,
          destinationLocationId,
          lineItems: [
            {
              inventoryItemId: variant.inventoryItem?.id,
              quantity: parsedQuantity,
            },
          ],
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error del servidor.");

      toast.success(`Traslado solicitado exitosamente.`);
      onClose();
    } catch (error: any) {
      toast.error(`Error al solicitar traslado: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Solicitar Traslado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="font-medium">Producto:</h3>
            <p>
              {variant.title}{" "}
              <span className="text-xs text-muted-foreground">
                (SKU: {variant.sku})
              </span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Origen:</h3>
              <p>{allSedes[originLocation.name].name || originLocation.name }</p>
            </div>
            <div>
              <h3 className="font-medium">Destino:</h3>
              <p>{destinationLocationName || "No seleccionado"}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium">Stock disponible:</h3>
            <p>{availableQuantity} unidades</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad a trasladar:</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={availableQuantity.toString()}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isSubmitting}
            />
          </div>{" "}
          <div className="space-y-2 flex gap-3">
            <Label htmlFor="quantity">Cliente relacionado:</Label>
            <Button variant="outline" onClick={() => openCustomerModal(setRelatedCustomer)}>
              {" "}
              <FaUser /> {relatedCustomer?.firstName || 'Seleccionar'}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmTransfer} disabled={isSubmitting}>
            {isSubmitting ? "Procesando..." : "Confirmar Traslado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

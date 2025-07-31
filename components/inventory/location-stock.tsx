"use client";
import { useState } from "react";
import { ShopifyLocation, ShopifyQuantity, ShopifyVariant } from "@/types";
import { Button } from "../ui/button";
import TransferModal from "./transfer-modal";
import { useSession } from "@/hooks/useSession";

type LocationStockCardProps = {
  location: ShopifyLocation;
  quantities: ShopifyQuantity[];
  currentLocationId: string | null;
  currentLocationName: string | undefined;
  variant: ShopifyVariant;
};

export default function LocationStock({
  location,
  quantities,
  currentLocationId,
  currentLocationName,
  variant,
}: LocationStockCardProps) {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const availableQuantity = quantities[0]?.quantity || 0;
  const {allSedes} = useSession()
  return (
    <>
      <li key={location.id} className="flex justify-between items-center">
        <span>
          {allSedes && allSedes[location.name] && allSedes[location.name].name ? allSedes[location.name].name : location.name}:{" "}
          <span className="font-semibold">{availableQuantity}</span>
        </span>
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer disabled:cursor-not-allowed"
          disabled={availableQuantity === 0}
          onClick={() => setIsTransferModalOpen(true)}
        >
          Solicitar Traslado
        </Button>
      </li>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        variant={variant}
        originLocation={location}
        destinationLocationId={currentLocationId}
        destinationLocationName={currentLocationName}
        availableQuantity={availableQuantity}
      />
    </>
  );
}
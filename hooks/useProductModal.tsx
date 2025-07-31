import { ProductModalContext } from "@/context/product-modal";
import { useContext } from "react";

export function useProductModal() {
  const context = useContext(ProductModalContext);
  if (context === undefined) {
    throw new Error('useProductModal must be used within a ProductModalProvider');
  }
  return context;
}
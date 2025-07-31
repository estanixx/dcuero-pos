'use client';

import { createContext, useContext, useState } from 'react';
import ProductModal from '@/components/inventory/product-modal';
import { ShopifyProduct } from '@/types';

type ProductModalContextType = {
  openProductModal: () => void;
};

export const ProductModalContext = createContext<ProductModalContextType | undefined>(undefined);

export function ProductModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openProductModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <ProductModalContext.Provider value={{ openProductModal }}>
      {children}
      <ProductModal 
        isOpen={isOpen} 
        onClose={closeModal} 
      />
    </ProductModalContext.Provider>
  );
}
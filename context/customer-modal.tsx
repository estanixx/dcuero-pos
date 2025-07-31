'use client';

import { createContext, useContext, useState } from 'react';
import CustomerModal from '@/components/customer/customer-modal';
import { ShopifyCustomer } from '@/types';

type CustomerModalContextType = {
  openCustomerModal: (setCustomerFn: (customer: ShopifyCustomer | undefined) => void) => void;
};

export const CustomerModalContext = createContext<CustomerModalContextType | undefined>(undefined);

export function CustomerModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [setCustomerFn, setSetCustomerFn] = useState<((customer: ShopifyCustomer | undefined) => void) | undefined>(undefined);

  const openCustomerModal = (fn: (customer: ShopifyCustomer | undefined) => void) => {
    setSetCustomerFn(() => fn);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSetCustomerFn(undefined);
  };

  return (
    <CustomerModalContext.Provider value={{ openCustomerModal }}>
      {children}
      <CustomerModal 
        isOpen={isOpen} 
        onClose={closeModal} 
        setCustomer={setCustomerFn} 
      />
    </CustomerModalContext.Provider>
  );
}


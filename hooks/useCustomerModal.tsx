import { CustomerModalContext } from "@/context/customer-modal";
import { useContext } from "react"

export function useCustomerModal() {
  const context = useContext(CustomerModalContext);
  if (context === undefined) {
    throw new Error('useCustomerModal must be used within a CustomerModalProvider');
  }
  return context;
}
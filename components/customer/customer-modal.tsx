'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShopifyCustomer } from '@/types';

type CustomerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  setCustomer: ((customer: ShopifyCustomer | undefined) => void) | undefined;
};

export default function CustomerModal({ isOpen, onClose, setCustomer }: CustomerModalProps) {
  const [customers, setCustomers] = useState<ShopifyCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<ShopifyCustomer | undefined>(undefined);
  
  // Estados para el formulario de creación
  const [isCreating, setIsCreating] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');

  // Cargar clientes al abrir el modal o cambiar el término de búsqueda
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen, searchTerm]);

  // Función para buscar clientes
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      
      const response = await fetch(`/api/customer?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar clientes');
      
      const data = await response.json();
      setCustomers(data.edges.map((edge: { node: { [key:string]: string } }) => edge.node));
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear un cliente
  const handleCreateCustomer = async () => {
    if (!firstName || !lastName) {
      toast.error('Nombre y apellido son requeridos');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, idNumber, birthDate }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear cliente');
      }

      const { customer } = await response.json();
      toast.success('Cliente creado exitosamente');
      setSelectedCustomer(customer);
      setIsCreating(false);
      // Refrescar la lista de clientes
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  // Función para aceptar la selección
  const handleAccept = () => {
    if (setCustomer) {
      setCustomer(selectedCustomer);
    }
    onClose();
  };

  // Función para mostrar el formulario de creación
  const showCreateForm = () => {
    setIsCreating(true);
    setSelectedCustomer(undefined);
  };

  // Función para volver a la lista de clientes
  const backToList = () => {
    setIsCreating(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setIdNumber('');
    setBirthDate('');
  };

  // Extraer metafields del cliente
  const getMetafield = (customer: ShopifyCustomer, key: string) => {
    if (!customer.metafields?.edges) return '';
    const metafield = customer.metafields.edges.find(edge => edge.node.key === key);
    return metafield ? metafield.node.value : '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Crear Nuevo Cliente' : 'Seleccionar Cliente'}
          </DialogTitle>
        </DialogHeader>

        {!isCreating ? (
          // Lista de clientes
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Buscar cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button onClick={fetchCustomers} disabled={loading}>
                Buscar
              </Button>
            </div>

            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              {loading ? (
                <div className="p-4 text-center">Cargando...</div>
              ) : customers.length === 0 ? (
                <div className="p-4 text-center">No se encontraron clientes</div>
              ) : (
                <div className="divide-y">
                  {customers.map((customer) => (
                    <div 
                      key={customer.id} 
                      className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedCustomer?.id === customer.id ? 'bg-gray-100' : ''}`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                      <div className="text-sm text-gray-500">
                        {customer.phone && <div>Tel: {customer.phone}</div>}
                        {getMetafield(customer, 'id_number') && (
                          <div>CC: {getMetafield(customer, 'id_number')}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={showCreateForm} className="w-full">
              Crear Nuevo Cliente
            </Button>
          </div>
        ) : (
          // Formulario de creación
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input 
                  id="firstName" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input 
                  id="lastName" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">Número de Identificación</Label>
              <Input 
                id="idNumber" 
                value={idNumber} 
                onChange={(e) => setIdNumber(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input 
                id="birthDate" 
                type="date" 
                value={birthDate} 
                onChange={(e) => setBirthDate(e.target.value)} 
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={backToList} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleCreateCustomer} disabled={loading} className="flex-1">
                {loading ? 'Creando...' : 'Crear Cliente'}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAccept} disabled={!selectedCustomer}>
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
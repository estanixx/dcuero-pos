'use client';

import { Auth0User, Sede } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { FaBoxOpen, FaShoppingCart, FaTruck, FaUserCog, FaUsers } from 'react-icons/fa';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImExit } from 'react-icons/im';
import { RiLoginBoxFill } from 'react-icons/ri';

export default function Navbar({ user, availableSedes }: { user: Auth0User | null, availableSedes: Sede[] }) {

  const [ sede, setSede ] = useState<string>(availableSedes[0]?.slug);
  const linkData = [
    {
      path: `/sede/${sede}/inventario`,
      icon: FaBoxOpen,
      label: 'Inventario'
    },
    {
      path: `/sede/${sede}/traslados`,
      icon: FaTruck,
      label: 'Traslados'
    },
    {
      path: `/sede/${sede}/clientes`,
      icon: FaUsers,
      label: 'Clientes'
    },
    {
      path: `/sede/${sede}/caja`,
      icon: FaShoppingCart,
      label: 'Flujo de Caja'
    },
    user?.roles.includes('Administrator') && {
      path: `/admin`,
      icon: FaUserCog,
      label: 'Admin'
    },
  ];
  return (
    <nav className="bg-primary p-4 w-full flex-start">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex justify-between items-center gap-3">
          <Link href='/' className="text-white text-2xl font-bold">Dcuero POS</Link>
          {
            user && availableSedes &&
            <Select defaultValue={ availableSedes[0].slug } onValueChange={setSede} disabled={availableSedes.length < 2}>
              <SelectTrigger className="w-[180px] text-white text-xs">
                <SelectValue placeholder="Sede" className='text-white'/>
              </SelectTrigger>
              <SelectContent>
                {
                  availableSedes.map((sede) => (
                    <SelectItem  key={sede.slug} value={sede.slug}>{sede.name}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          }
        </div>

        <ul className="flex justify-between items-center gap-6">
          {
          user ?
          <>
            {linkData.map((link) => (
              link &&
              <li key={link.path}>
                <Link href={link.path} className='flex items-center gap-2'>
                  <link.icon className='text-white text-3xl'/>
                  <span className="text-white text-sm font-medium">{link.label}</span>
                </Link>
              </li>
            ))}

            <li>
              <Link href='/auth/logout' className='flex items-center gap-2'>
                <ImExit className='text-white text-3xl'/>
                <span className="text-white text-sm font-medium">Cerrar sesión</span>
              </Link>
            </li>
          </>
          :
          <li>
            <Link href='/auth/login' className='flex items-center gap-2'>
              <RiLoginBoxFill className='text-white text-3xl'/>
              <span className="text-white text-sm font-medium">Iniciar sesión</span>
            </Link>
          </li>
          }
        </ul>
      </div>
    </nav>
  )
}
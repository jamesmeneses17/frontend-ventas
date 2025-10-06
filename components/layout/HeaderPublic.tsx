// /components/layout/HeaderPublic.tsx (Versión Final)

"use client";

import React, { useState } from "react";
import Link from "next/link";
// ¡IMPORTAMOS EL COMPONENTE!
import HeaderProductsDropdown from "../ui/HeaderProductsDropdown"; 
import { usePathname } from "next/navigation";

const HeaderPublic: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const pathname = usePathname();

  // Eliminamos "Productos" del array 'navigation' porque será un componente Dropdown.
  const navigation = [
    { name: "Inicio", href: "/" },
    // { name: "Productos", href: "/productos" }, // ❌ Eliminado
    { name: "Nosotros", href: "/nosotros" },
    { name: "Contacto", href: "/contacto" },
  ];

  // Clase base para los enlaces para asegurar consistencia
  const baseLinkClasses = `inline-flex items-center h-full px-1 border-b-2 
    hover:border-amber-300 hover:text-amber-700 transition duration-150 text-sm font-medium`;


  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mantén h-16 para dar buen espacio y centrar verticalmente */}
        <div className="flex justify-between h-16"> 
          
          {/* Lado Izquierdo: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-amber-600 flex items-center space-x-2"
            >
              <span className="text-2xl">☀️</span>
              <span>DISEM SAS</span>
            </Link>
          </div>
          
          {/* Lado Central: Navegación de Escritorio */}
          {/* CLAVE: sm:space-x-8 items-center para centrar y separar */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center"> 
            
            {/* 1. Mapeo de enlaces (Inicio, Nosotros, Contacto) */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${baseLinkClasses} 
                  ${
                    pathname === item.href
                      ? "border-amber-500 text-amber-700"
                      : "border-transparent text-gray-500"
                  } 
                `}
              >
                {item.name}
              </Link>
            ))}

            {/* 2. INTEGRACIÓN DEL DROP DOWN DE PRODUCTOS */}
            <HeaderProductsDropdown /> 

          </div>
          
          {/* Lado Derecho: Botones de Acción (Admin) - Escritorio */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <a
              href="/login"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-black hover:bg-gray-800 transition duration-150"
            >
              Admin
            </a>
          </div>

          {/* Botón de Menú Móvil (sin cambios) */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Abrir menú principal</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden absolute w-full bg-white shadow-xl border-t border-gray-100`}>
        <div className="pt-2 pb-3 space-y-1 px-4">
          
          {/* Enlace estático de Productos para móvil */}
          <Link
            href="/productos"
            onClick={toggleMenu}
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Productos
          </Link>

          {/* Mapear los enlaces restantes */}
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={toggleMenu} 
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        {/* Botón de Admin/Login en el menú móvil (sin cambios) */}
        <div className="border-t border-gray-100 pt-4 pb-2 px-4">
          <a
            href="/login"
            className="block w-full text-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-black hover:bg-gray-800"
          >
            Admin
          </a>
        </div>
      </div>
    </nav>
  );
};

export default HeaderPublic;
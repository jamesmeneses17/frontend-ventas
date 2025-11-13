// /components/layout/HeaderPublic.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderProductsDropdown from "../ui/HeaderProductsDropdown";
import MobileCategoryList from "../ui/MobileCategoryList";
import { useCart } from '../hooks/CartContext';
import { ShoppingCart } from 'lucide-react';

const HeaderPublic: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProductsOpenMobile, setIsProductsOpenMobile] = useState(false);
  const { items } = useCart();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) setIsProductsOpenMobile(false);
  };

  const toggleProductsMobile = () =>
    setIsProductsOpenMobile(!isProductsOpenMobile);

  const pathname = usePathname();

  const navigationItems = [
    { name: "Inicio", href: "/", isDropdown: false },
    { name: "Productos", href: "/productos", isDropdown: true },
    { name: "Nosotros", href: "/nosotros", isDropdown: false },
    { name: "Contacto", href: "/contacto", isDropdown: false },
  ];

  const desktopLinkClasses = (href: string) => `
    inline-flex items-center h-full px-1 border-b-2 transition duration-150 text-sm font-medium
    ${
      pathname.startsWith(href)
        ? "border-amber-500 text-amber-700"
        : "border-transparent text-gray-500"
    } 
    hover:border-amber-300 hover:text-amber-700
  `;

  return (
  <nav className="bg-[#d1f177] shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">

          {/* ========================================================== */}
          {/* LADO IZQUIERDO: SOLO LOGO */}
          {/* ========================================================== */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3">
                <img
                  src="/images/logo-disem.jpeg"
                  alt="DISEM SAS"
                  width={200}
                  height={60}
                  className="object-contain"
                />
              </Link>
            </div>
          </div>

          {/* ========================================================== */}
          {/* LADO DERECHO: NAVEGACIÓN + BOTÓN ADMIN */}
          {/* ========================================================== */}
          <div className="flex items-center">
            {/* Links de Navegación (Escritorio) */}
            <div className="hidden sm:flex sm:space-x-8 h-full items-center">
              {navigationItems.map((item) =>
                item.isDropdown ? (
                  <HeaderProductsDropdown key={item.name} />
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${desktopLinkClasses(item.href)} flex items-center`}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>

            {/* BOTÓN ADMIN (Escritorio) */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Link
                  href="/users/cart"
                  className="mr-4 relative flex items-center space-x-2 px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#2e9fdb] hover:bg-[#2388c5]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Carrito</span>
                  {items && items.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {items.length}
                    </span>
                  )}
                </Link>

                <Link
                  href="/login"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-black hover:bg-gray-800"
                >
                  Admin
                </Link>
            </div>

            {/* Botón de Menú Móvil (Hamburguesa) */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Abrir menú principal</span>
                {isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* MENÚ MÓVIL DESPLEGABLE COMPLETO */}
      {/* ========================================================== */}
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } sm:hidden absolute w-full bg-white shadow-xl border-t border-gray-100`}
      >
        <div className="pt-2 pb-3 space-y-1 px-4">
          {navigationItems.map((item) => (
            <div key={item.name}>
              {item.isDropdown ? (
                <div>
                  <button
                    onClick={toggleProductsMobile}
                    className={`w-full flex justify-between items-center px-3 py-2 text-base font-medium rounded-md transition duration-150 
                      ${
                        isProductsOpenMobile || pathname.startsWith(item.href)
                          ? "bg-gray-100 text-amber-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {item.name}
                    <svg
                      className={`h-5 w-5 transform transition-transform ${
                        isProductsOpenMobile ? "rotate-180" : "rotate-0"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isProductsOpenMobile && (
                    <MobileCategoryList onNavigate={toggleMenu} />
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={toggleMenu}
                  className={`block px-3 py-2 text-base font-medium rounded-md 
                    ${
                      pathname === item.href
                        ? "bg-gray-100 text-amber-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Botón de Admin/Login en el menú móvil */}
        <div className="border-t border-gray-100 pt-4 pb-2 px-4">
          <Link
            href="/login"
            onClick={toggleMenu}
            className="block w-full text-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-black hover:bg-gray-800"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default HeaderPublic;

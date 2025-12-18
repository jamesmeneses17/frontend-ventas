"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderProductsDropdown from "../ui/HeaderProductsDropdown";
import MobileCategoryList from "../ui/MobileCategoryList";
import { useCart } from '../hooks/CartContext';
import { ShoppingCart } from 'lucide-react';

const DISEM_BLUE = "#2e9fdb";

const HeaderPublic: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProductsOpenMobile, setIsProductsOpenMobile] = useState(false);
  const { items } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
   /* { name: "Nosotros", href: "/nosotros", isDropdown: false },*/
    { name: "Contacto", href: "/contacto", isDropdown: false },
  ];

  const desktopLinkClasses = (href: string) => `
    inline-flex items-center h-full px-1 border-b-2 transition duration-150 text-sm font-medium
    ${
      pathname.startsWith(href)
        ? "border-blue-500 text-blue-700"
        : "border-transparent text-gray-600"
    } 
    hover:border-blue-400 hover:text-blue-700
  `;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 shadow-md h-24 bg-[#ebebeb]">

      {/* ========================================================== */}
      {/* FONDO DIAGONAL (INGESOLAR STYLE) */}
      {/* ========================================================== */}
      <div className="absolute inset-0 z-0">

        {/* FONDO BASE → degradado azul hacia blanco */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${DISEM_BLUE}, #ffffff)`,
          }}
        />
        {/* BANDA DIAGONAL IZQUIERDA */}
        <div
          className="absolute inset-y-0 left-0 w-[35%] bg-[#2e9fdb]"
          style={{
            clipPath: "polygon(0 0, 80% 0, 65% 100%, 0% 100%)",
          }}
        />
      </div>
      {/* ========================================================== */}
      {/* CONTENIDO DEL HEADER (encima del diseño) */}
      {/* ========================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between h-24">
          {/* LADO IZQUIERDO: LOGO */}
          <div className="flex items-center">
              <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/images/logo-disem.jpeg"
                  alt="DISEM SAS"
                  width={200}
                  height={60}
                  className="object-contain"
                />
              </Link>
            </div>
          </div>
          {/* LADO DERECHO: NAV + ADMIN */}
          <div className="flex items-center">

            {/* Menú Desktop */}
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
            {/* Botones: carrito + admin */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              
              {/* CARRITO */}
              <Link
                href="/users/cart"
                className="mr-4 relative flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-[#2e9fdb] hover:bg-[#2388c5]"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Carrito</span>

                {mounted && items && items.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                    {items.length}
                  </span>
                )}
              </Link>

              {/* ADMIN */}
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-black hover:bg-gray-800"
              >
                Admin
              </Link>
            </div>

            {/* MENÚ MÓVIL */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-200"
              >
                {isOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ========================================================== */}
      {/* MENÚ MÓVIL */}
      {/* ========================================================== */}
      <div className={`${isOpen ? "block" : "hidden"} sm:hidden absolute w-full bg-white shadow-xl border-t`}>
        <div className="pt-2 pb-3 space-y-1 px-4">

          {navigationItems.map((item) => (
            <div key={item.name}>
              {item.isDropdown ? (
                <div>
                  <button
                    onClick={toggleProductsMobile}
                    className="w-full flex justify-between items-center px-3 py-2 text-base font-medium"
                  >
                    {item.name}
                    <svg
                      className={`h-5 w-5 transform transition ${isProductsOpenMobile ? "rotate-180" : ""}`}
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"/>
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
                  className="block px-3 py-2 text-base font-medium text-gray-800"
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}

        </div>

        <div className="border-t px-4 py-4">
          <Link
            href="/login"
            onClick={toggleMenu}
            className="block w-full text-center px-4 py-3 rounded-lg bg-black text-white"
          > Admin
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default HeaderPublic;

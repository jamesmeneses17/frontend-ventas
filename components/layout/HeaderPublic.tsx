"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from 'next/image'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import HeaderProductsDropdown from "../ui/HeaderProductsDropdown"
import MobileCategoryList from "../ui/MobileCategoryList"
import { useCart } from '../hooks/CartContext'

// Color azul claro solicitado
const DISEM_LIGHT_BLUE = "#83abfcff"

const HeaderPublic: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProductsOpenMobile, setIsProductsOpenMobile] = useState(false)
  const { items } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    if (isOpen) setIsProductsOpenMobile(false)
  }

  const toggleProductsMobile = () =>
    setIsProductsOpenMobile(!isProductsOpenMobile)

  const pathname = usePathname()

  const navigationItems = [
    { name: "Inicio", href: "/", isDropdown: false },
    { name: "Productos", href: "/productos", isDropdown: true },
    { name: "Nosotros", href: "/nosotros", isDropdown: false },
    { name: "Contacto", href: "/contacto", isDropdown: false },
  ]

  // Estilos de texto reducidos (13px) y elegantes para el menú desktop
  const desktopLinkClasses = (href: string) => `
    inline-flex items-center h-full px-1 border-b-2 transition duration-150 text-[13px] font-medium
    ${pathname === href || (href !== "/" && pathname.startsWith(href))
      ? "border-blue-600 text-blue-800"
      : "border-transparent text-gray-700"} 
    hover:text-blue-600 hover:border-blue-400
  `

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 shadow-md h-28 bg-white">
      {/* FONDO DIAGONAL CON DEGRADADO */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(168deg, ${DISEM_LIGHT_BLUE} 0%, ${DISEM_LIGHT_BLUE} 49%, transparent 55%, transparent 100%)`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full">
        <div className="flex justify-between h-full">

          {/* LADO IZQUIERDO: LOGO - Centrado verticalmente en la altura h-28 */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo-disem.jpeg"
                  alt="DISEM SAS"
                  width={220}
                  height={75}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>
          </div>

          {/* LADO DERECHO: NAV (Pequeño y a la derecha) + BOTONES */}
          <div className="flex items-center flex-1 justify-end">

            {/* Menú Desktop: ml-auto empuja todo a la derecha, mr-6 para separarlo de los botones */}
            <div className="hidden sm:flex sm:space-x-2 h-full items-center mr-2 ml-auto">
              {navigationItems.map((item) => (
                <div key={item.name} className="h-full flex items-center">
                  {item.isDropdown ? (
                    <HeaderProductsDropdown />
                  ) : (
                    <Link href={item.href} className={desktopLinkClasses(item.href)}>
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Botones Acciones: Carrito y Admin */}
            <div className="hidden sm:flex sm:items-center space-x-3">
              <Link
                href="/users/cart"
                className="flex items-center space-x-2 px-3 py-1.5 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition bg-white/50 backdrop-blur-sm"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 text-blue-500" />
                  {mounted && items && items.length > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                      {items.length}
                    </span>
                  )}
                </div>
                <span>Carrito</span>
              </Link>

              <Link
                href="/login"
                className="px-4 py-1.5 text-[12px] font-bold rounded-lg text-white bg-black hover:bg-gray-800 transition shadow-sm"
              >
                Admin
              </Link>
            </div>

            {/* MENÚ MÓVIL Y CARRITO */}
            <div className="flex items-center sm:hidden gap-3">
              {/* Carrito Móvil */}
              <Link
                href="/users/cart"
                className="relative p-2 text-gray-700 hover:text-blue-600"
              >
                <ShoppingCart className="w-5 h-5" />
                {mounted && items && items.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                    {items.length}
                  </span>
                )}
              </Link>

              <button onClick={toggleMenu} className="p-2 rounded-md text-gray-800 hover:bg-gray-100">
                {isOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {isOpen && (
        <div className="sm:hidden absolute w-full bg-white shadow-xl border-t z-50">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <div key={item.name}>
                {item.isDropdown ? (
                  <>
                    <button
                      onClick={toggleProductsMobile}
                      className="w-full text-left px-3 py-3 text-sm font-medium flex justify-between items-center text-gray-800"
                    >
                      {item.name}
                      <span className={`transition-transform ${isProductsOpenMobile ? "rotate-180" : ""}`}>▼</span>
                    </button>
                    {isProductsOpenMobile && (
                      <div className="bg-gray-50">
                        <MobileCategoryList onNavigate={toggleMenu} />
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={toggleMenu}
                    className="block px-3 py-3 text-sm font-medium text-gray-800 border-b border-gray-50 hover:bg-gray-50"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            <div className="py-4 space-y-2">
              <Link
                href="/login"
                onClick={toggleMenu}
                className="block w-full py-3 text-center bg-black text-white rounded-lg font-bold"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default HeaderPublic;
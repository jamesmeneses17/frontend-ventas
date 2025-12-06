"use client";

import {
  LayoutDashboard, Users, Settings, ListChecks, DollarSign, Box, Package,
  ShoppingCart, Scale, FileText, Wallet, Image, MapPin, Type,
  ChevronDown, ChevronUp 
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, MouseEvent } from "react"; // Importar MouseEvent para tipado

// -------------------------------------------------------------------
// ESTRUCTURA DE NAVEGACIÓN (Sin cambios en la data)
// -------------------------------------------------------------------
const navigation = [
  {
    title: "INICIO",
    id: "inicio", 
    isCollapsible: false, 
    items: [
      { name: "RESUMEN ANUAL Y DIARIO", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "CONFIGURACIÓN BASE",
    id: "configuracion-base", 
    isCollapsible: true, 
    items: [
      { name: "Categorías", href: "/admin/productos", icon: Settings },
      { name: "Clientes", href: "/admin/clientes", icon: Users },
      { name: "Tipos de Documento", href: "/admin/tipos-documento", icon: ListChecks },
      { name: "Métodos de Pago", href: "/admin/metodos-pago", icon: DollarSign },
    ],
  },
  {
    title: "CONFIGURACIÓN WEB",
    id: "configuracion-web",
    isCollapsible: true, 
    items: [
      // Marcamos individualmente qué rutas están en desarrollo (dev: true)
      { name: "Información de Empresa", href: "/admin/info_empresa", icon: FileText },
      { name: "Banners y Carrusel", href: "/admin/banners", icon: Image, dev: true },
      { name: "Sedes y Direcciones", href: "/admin/sedes", icon: MapPin, dev: true },
      { name: "Secciones de Contenido", href: "/admin/secciones-contenido", icon: Type, dev: true },
    ],
  },
  {
    title: "INVENTARIO Y PRODUCTOS",
    id: "inventario-productos",
    isCollapsible: true, 
    items: [
      { name: "BD LISTA PRODUCTOS", href: "/admin/bd-lista", icon: Package },
      { name: "Control de Inventario", href: "/admin/lista-productos", icon: Box },
    ],
  },
  {
    title: "OPERACIONES",
    id: "operaciones",
    isCollapsible: true, 
    items: [
      { name: "Compras", href: "/admin/compras", icon: ShoppingCart },
      { name: "Ventas", href: "/admin/ventas", icon: ShoppingCart },
    ],
  },
  {
    title: "FINANZAS Y CAJA",
    id: "finanzas-caja",
    isCollapsible: true, 
    items: [
      { name: "Cuentas por Cobrar", href: "/admin/cuentas-cobrar", icon: Scale },
      { name: "Ingresos y Egresos", href: "/admin/caja", icon: Wallet },
    ],
  },
];


export default function Sidebar() {
  const pathname = usePathname();
  const activeColor = "#8BC34A";
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  const isSectionOpen = (sectionId: string, isCollapsible: boolean, items: { href: string }[]) => {
    if (!isCollapsible) return true;
    if (openSection === sectionId) return true;

    return isCollapsible && items.some(item => {
      if (item.href === "/dashboard") {
        return pathname === item.href;
      }
      return pathname.startsWith(item.href);
    });
  };
  
  // Función manejadora para la ALERTA DE DESARROLLO
  const handleDevelopmentClick = (e: MouseEvent, name: string) => {
      // 1. Evita que el Link de Next.js navegue
      e.preventDefault(); 
      // 2. Muestra la alerta nativa
      alert(`Función de "${name}" en desarrollo`);
  };


  return (
    <div className="w-56 bg-gray-800 text-white flex flex-col">
      <div className="p-3 text-lg font-bold border-b border-gray-700">
        Panel Administrativo
      </div>

      <nav className="flex-1 p-2 overflow-y-auto hide-scrollbar">
        {navigation.map((section) => {
          const isOpen = isSectionOpen(section.id, section.isCollapsible, section.items);
          const isDevelopmentSection = section.id === "configuracion-web"; // Flag para la sección

          return (
            <div key={section.id} className="mb-1">
              
              <div
                className={`flex justify-between items-center p-2 rounded 
                  ${section.isCollapsible ? 'cursor-pointer transition hover:bg-gray-700' : ''}`}
                onClick={() => section.isCollapsible && toggleSection(section.id)}
              >
                <h3 className="text-xs font-semibold uppercase text-gray-400">
                  {section.title}
                </h3>
                {section.isCollapsible && (isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
              </div>

              {/* Contenido (Visible si isOpen es verdadero) */}
              {isOpen && (
                <div className="pl-2 pt-1 pb-1">
                  {section.items.map((item: any) => {
                    let isLinkActive = false;

                    if (item.href === "/dashboard") {
                      isLinkActive = pathname === item.href;
                    } else {
                      isLinkActive = pathname.startsWith(item.href) && pathname !== "/dashboard";
                    }
                    
                    // Asignamos el manejador de click condicionalmente por item.dev
                    const clickHandler = item.dev
                      ? (e: MouseEvent) => handleDevelopmentClick(e, item.name)
                      : undefined;

                    // Agregamos una clase visual para las rutas en desarrollo (por item.dev)
                    const devClass = item.dev ? 'opacity-75' : '';


                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={clickHandler} // Usamos el manejador de click que puede prevenir la navegación
                        className={`flex items-center gap-2 p-2 rounded transition text-sm 
                          ${isLinkActive && !isDevelopmentSection ? "text-gray-900 font-semibold" : "text-white"}
                          hover:bg-[#8BC34A] hover:text-gray-900
                          ${devClass} 
                        `}
                        style={{
                          backgroundColor: isLinkActive && !isDevelopmentSection ? activeColor : undefined,
                        }}
                        aria-current={isLinkActive ? "page" : undefined}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
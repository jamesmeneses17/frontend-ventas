"use client";

import {
  LayoutDashboard, Settings, ListChecks, DollarSign, Box, Package,
  ShoppingCart, Scale, FileText, Wallet, Image, MapPin, Type,
  ChevronDown, ChevronUp, Contact,
  ShoppingBag, HandCoins, Globe,
  Layers, Grid, ListTree // Nuevos iconos para categorías
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, MouseEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
      // ACTUALIZACIÓN DE ICONOS PARA CATEGORÍAS
      { name: "Categorías Principal", href: "/admin/categorias_principales", icon: Layers },
      { name: "Categoría", href: "/admin/productos", icon: Grid },
      { name: "Subcategoria", href: "/admin/subcategorias", icon: ListTree },

      { name: "Contactos", href: "/admin/clientes", icon: Contact },
      { name: "Tipos de Documento", href: "/admin/tipos-documento", icon: ListChecks },
      { name: "Métodos de Pago", href: "/admin/metodos-pago", icon: DollarSign },
    ],
  },
  {
    title: "CONFIGURACIÓN WEB",
    id: "configuracion-web",
    isCollapsible: true,
    items: [
      { name: "Información de Empresa", href: "/admin/info_empresa", icon: FileText },
      { name: "Banners", href: "/admin/configuracion-web/banners", icon: Image },
      // NUEVO ITEM CON PROP 'restricted'
      { name: "Historial de Sesiones", href: "/admin/historial-sesiones", icon: ListChecks, restricted: true },
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
      { name: "Compras", href: "/admin/compras", icon: ShoppingBag },
      { name: "Ventas", href: "/admin/ventas", icon: HandCoins },
      { name: "Pedidos-Online", href: "/admin/pedidos", icon: Globe },
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
  const { user } = useAuth(); // Hook de autenticación
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

  const handleDevelopmentClick = (e: MouseEvent, name: string) => {
    e.preventDefault();
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
          const isDevelopmentSection = section.id === "configuracion-web";

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

              {isOpen && (
                <div className="pl-2 pt-1 pb-1">
                  {section.items.map((item: any) => {
                    // VERIFICACIÓN DE ACCESO
                    if (item.restricted && user?.correo !== 'james@itp.edu.co') {
                      return null;
                    }

                    let isLinkActive = false;

                    if (item.href === "/dashboard") {
                      isLinkActive = pathname === item.href;
                    } else {
                      isLinkActive = pathname.startsWith(item.href) && pathname !== "/dashboard";
                    }

                    const clickHandler = item.dev
                      ? (e: MouseEvent) => handleDevelopmentClick(e, item.name)
                      : undefined;

                    const devClass = item.dev ? 'opacity-75' : '';

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={clickHandler}
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
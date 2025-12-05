"use client";

import {
  LayoutDashboard,
  Users,
  Settings,
  ListChecks,
  DollarSign,
  Box,
  Package,
  ShoppingCart,
  Scale,
  FileText,
  User,
  Wallet,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    title: "INICIO",
    items: [
      // RESUMEN DIARIO / ANUAL
      { name: "RESUMEN ANUAL Y DIARIO", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "CONFIGURACIÓN BASE",
    items: [
      { name: "Categorías", href: "/admin/productos", icon: Settings },
      { name: "Clientes", href: "/admin/clientes", icon: Users },
      { name: "Tipos de Documento", href: "/admin/tipos-documento", icon: ListChecks },
      { name: "Métodos de Pago", href: "/admin/metodos-pago", icon: DollarSign },
    ],
  },
  {
    title: "INVENTARIO Y PRODUCTOS",
    items: [
      { name: "BD LISTA PRODUCTOS", href: "/admin/bd-lista", icon: Package },
      { name: "Control de Inventario", href: "/admin/lista-productos", icon: Box },
    ],
  },
  {
    title: "OPERACIONES",
    items: [
      { name: "Compras", href: "/admin/compras", icon: ShoppingCart },
      { name: "Ventas", href: "/admin/ventas", icon: ShoppingCart },
    ],
  },
  {
    title: "FINANZAS Y CAJA",
    items: [
      { name: "Cuentas por Cobrar", href: "/admin/cuentas-cobrar", icon: Scale },
      { name: "Ingresos y Egresos", href: "/admin/caja", icon: Wallet },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const activeColor = "#8BC34A";

  return (
    <div className="w-56 bg-gray-800 text-white flex flex-col">
      <div className="p-3 text-lg font-bold border-b border-gray-700">
        Sistema Ventas
      </div>

      <nav className="flex-1 p-2 overflow-y-auto hide-scrollbar">
        {navigation.map((section) => (
          <div key={section.title} className="mb-4">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mt-2 mb-1 px-2">
              {section.title}
            </h3>

            {section.items.map((item) => {
              let isActive = false;

              if (item.href === "/dashboard") {
                isActive = pathname === item.href;
              } else {
                isActive = pathname.startsWith(item.href) && pathname !== "/dashboard";
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 p-2 rounded transition text-sm 
                    ${isActive ? "text-gray-900 font-semibold" : "text-white"}
                    hover:bg-[#8BC34A] hover:text-gray-900
                  `}
                  style={{
                    backgroundColor: isActive ? activeColor : undefined,
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}

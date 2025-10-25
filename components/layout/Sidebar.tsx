import {
  LayoutDashboard,
  Users,
  Settings,
  ListChecks,
  DollarSign,
  Box,
  Package,
  ShoppingCart,
  Wallet,
  Scale,
  FileText,
  User,
} from "lucide-react";
import Link from "next/link";
// ***** CAMBIO CLAVE 1: IMPORTAR usePathname *****
import { usePathname } from "next/navigation"; 

const navigation = [
  {
    title: "INICIO",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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
      { name: "Lista de Productos", href: "/admin/productoss", icon: Box },
      { name: "Control de Stock", href: "/admin/stock", icon: Package },
      { name: "Precios & Ofertas", href: "/admin/precios", icon: DollarSign },
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
      { name: "Ingresos y Egresos", href: "/admin/ingresos-egresos", icon: Wallet },
      { name: "Cuentas por Cobrar", href: "/admin/cuentas-por-cobrar", icon: Scale },
    ],
  },
  {
    title: "REPORTES",
    items: [
      { name: "Resumen Financiero", href: "/admin/resumen-financiero", icon: FileText },
    ],
  },
  {
    title: "CONFIGURACIÓN",
    items: [
      { name: "Usuarios Admin", href: "/admin/usuarios", icon: User },
    ],
  },
];

export default function Sidebar() {
  // ***** CAMBIO CLAVE 2: USAR EL HOOK *****
  const pathname = usePathname();
  // Se elimina la simulación con 'window.location.pathname'
  
  const activeColor = "#8BC34A";

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        Sistema Ventas
      </div>
      <nav className="flex-1 p-2">
        {navigation.map((section) => (
          <div key={section.title} className="mb-4">
            <h3 className="text-xs font-semibold uppercase text-gray-400 mt-2 mb-1 px-2">
              {section.title}
            </h3>
            
            {section.items.map((item) => {
              
              let isActive = false;
              if (item.href === '/dashboard') {
                  // Coincidencia exacta solo para el dashboard
                  isActive = pathname === item.href; 
              } else {
                  // Coincidencia 'startsWith' para el resto de los módulos
                  isActive = pathname.startsWith(item.href) && pathname !== '/dashboard';
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 p-2 rounded transition 
                    ${isActive 
                      ? 'text-gray-900 font-semibold'
                      : 'text-white'
                    }
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
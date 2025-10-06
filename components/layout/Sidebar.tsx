import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  // Apunta a la sección de administración de productos (Catálogos)
  { name: "Catalogos", href: "/admin/productos", icon: Package },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        Sistema Ventas
      </div>
      <nav className="flex-1 p-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 transition"
            aria-current={
              // Marcar como actual si la ruta coincide (mejor accesibilidad)
              typeof window !== "undefined" && window.location.pathname === item.href
                ? "page"
                : undefined
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

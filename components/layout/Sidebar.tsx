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
  { name: "Catalogos", href: "/", icon: FileText },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Inventario", href: "/", icon: FileText },
  { name: "Precios & Promociones", href: "/", icon: FileText },
  { name: "Clientes", href: "/", icon: FileText },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
  { name: "Reportes", href: "/reportes", icon: FileText },
  { name: "Usuarios", href: "/clientes", icon: Users },
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
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}

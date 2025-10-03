// components/Header.tsx
"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean; // <- agregar aquí
}

export default function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow md:ml-0 md:pl-6">
      {/* Botón hamburguesa sólo en móvil */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900 md:hidden"
          aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="text-lg font-bold">Panel Administrativo</h1>
      </div>

      {/* Notificaciones + perfil */}
      <div className="flex items-center gap-4">
        <button className="relative text-gray-600 hover:text-gray-900">
          <Bell className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src="https://i.pravatar.cc/40"
              alt="User avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">
                {user?.nombre || user?.rol || "Usuario"}
              </span>
              <span className="text-xs text-gray-500">{user?.rol}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}

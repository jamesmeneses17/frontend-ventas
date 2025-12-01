"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Image from "next/image";
import { useState } from "react";
import ConfirmDialog from "../common/ConfirmDialog";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    // abrir diálogo de confirmación
    setConfirmOpen(true);
  };

  const doLogoutConfirmed = async () => {
    // Cerrar sesión primero y luego forzar navegación completa a la landing
    setConfirmOpen(false);
    try {
      await logout();
    } catch (err) {
      // ignorar errores de logout
    }

    try {
      // Usar una navegación completa (reload) para evitar que los
      // protectores de rutas del cliente reemplacen la navegación.
      if (typeof window !== "undefined") {
        window.location.href = "/";
      } else {
        router.replace("/");
      }
    } catch (e) {
      /* ignore */
    }
  };

  const cancelLogout = () => setConfirmOpen(false);

  return (
    <header
      className="
        flex items-center justify-between 
        bg-white px-6 py-3 shadow
        sticky top-0 z-40
        h-[80px]
        md:ml-56     /* 👈 coincide con el ancho del sidebar (w-56) */
      "
    >
      {/* === LADO IZQUIERDO === */}
      <div className="flex items-center gap-4">
        {/* Botón hamburguesa SOLO visible en móvil */}
        <button
          onClick={toggleSidebar}
          className="text-gray-600 hover:text-gray-900 md:hidden"
          aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Image
          src="/images/logo-disem.jpeg"
          alt="Logo DiSem"
          width={140}
          height={60}
          className="object-contain"
          priority
        />
      </div>

      {/* === LADO DERECHO === */}
      <div className="flex items-center gap-4">
        <button className="relative text-gray-600 hover:text-gray-900">
          <Bell className="w-6 h-6" />
        </button>

        <div className="flex flex-col leading-tight text-right">
          <span className="text-sm font-medium text-gray-700">
            {user?.nombre}
          </span>
          <span className="text-xs text-gray-500">{user?.rol}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
      
      <ConfirmDialog
        open={confirmOpen}
        title="¿Estás seguro?"
        message="¿Quieres cerrar sesión y volver a la página principal?"
        onConfirm={doLogoutConfirmed}
        onCancel={cancelLogout}
      />
    </header>
  );
}

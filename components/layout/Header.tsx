"use client";

import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Image from "next/image";
import { useState } from "react";
import ConfirmDialog from "../common/ConfirmDialog";
import NotificationBell from "./NotificationBell";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => setConfirmOpen(true);

  const doLogoutConfirmed = async () => {
    setConfirmOpen(false);
    try {
      await logout();
      if (typeof window !== "undefined") window.location.href = "/";
    } catch (err) { console.error(err); }
  };

  return (
    <header className="flex items-center justify-between bg-white px-4 md:px-6 shadow-sm border-b border-gray-100 sticky top-0 z-40 h-[65px] md:h-[80px]">
      
      {/* === LADO IZQUIERDO === */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Menú"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Contenedor del Logo con ancho fijo para evitar distorsión borrosa */}
        <div className="flex items-center">
          <Image
            src="/images/logo-disem.jpeg"
            alt="Logo DiSem"
            width={140}
            height={60}
            className="w-[110px] md:w-[140px] h-auto object-contain"
            style={{ imageRendering: 'auto' }} 
            priority
          />
        </div>
      </div>

      {/* === LADO DERECHO === */}
      <div className="flex items-center gap-2 md:gap-4">
        
        <NotificationBell /> 

        {/* Nombre de usuario: Oculto en móviles para dar espacio */}
        <div className="hidden sm:flex flex-col leading-tight text-right border-l pl-4 border-gray-100">
          <span className="text-sm font-bold text-gray-800">
            {user?.nombre || "James"}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
            {user?.rol || "Admin"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 p-2 md:px-3 md:py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold"
        >
          <LogOut className="w-5 h-5 md:w-4 md:h-4" />
          <span className="hidden md:inline">Salir</span>
        </button>
      </div>
      
      <ConfirmDialog
        open={confirmOpen}
        title="¿Cerrar Sesión?"
        message="¿Quieres salir del sistema?"
        onConfirm={doLogoutConfirmed}
        onCancel={() => setConfirmOpen(false)}
      />
    </header>
  );
}
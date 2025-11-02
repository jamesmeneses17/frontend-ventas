"use client";

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Image from "next/image";

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header
      className="
        flex items-center justify-between 
        bg-white px-6 py-3 shadow
        sticky top-0 z-40
        ml-[258px]        // 🔹 deja espacio del sidebar
        h-[80px]
      "
    >
      {/* === LADO IZQUIERDO === */}
      <div className="flex items-center gap-4">
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
    </header>
  );
}

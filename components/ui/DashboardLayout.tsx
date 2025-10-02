// components/DashboardLayout.tsx
"use client";

import { Sidebar } from "lucide-react";
import React, { useState, ReactNode } from "react";
import Header from "../layout/Header";
// IMPORTA tu Sidebar real (ajusta la ruta si lo tienes en components/layout/Sidebar.tsx)
// IMPORTA tu Header (ajusta ruta)

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (controlado por isSidebarOpen en móviles) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-800 transition duration-300 ease-in-out md:flex md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* Overlay en móviles */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Pasamos ambos props al Header */}
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}

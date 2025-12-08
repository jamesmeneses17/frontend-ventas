// /components/layout/PublicLayout.tsx (CORREGIDO)

"use client";

import React, { ReactNode } from "react";
import HeaderPublic from "./HeaderPublic";
import FooterPublic from "./FooterPublic";
import BrandingBarSection from "../ui/BrandingBarSection";
import AlliedBrandsSection from "../ui/AlliedBrandsSection";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white pt-24">
      {/* 1. Navbar público (fixed top-0) */}
      <HeaderPublic />

      {/* 2. Barra de movimiento en flujo normal (no fija) */}
      <BrandingBarSection />

      {/* 3. Contenido principal sin relleno extra */}
      <main className="pt-0">
        {children}
      </main>

      {/* 🚀 SECCIÓN DE MARCAS: Fuera del main para ocupar ancho completo sin espacios */}
      <AlliedBrandsSection />

      {/* 🛑 Footer Completo */}
      <FooterPublic />
    </div>
  );
};

export default PublicLayout;
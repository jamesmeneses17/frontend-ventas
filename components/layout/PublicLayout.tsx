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
    <div className="min-h-screen bg-white">
      {/* 1. Navbar público (fixed top-0) */}
      <HeaderPublic />

      {/* 2. SECCIÓN DE BRANDING (BARRA DE MOVIMIENTO) - Justo debajo del header (h-24 = 96px) */}
      <div className="fixed top-24 left-0 right-0 z-40 w-full bg-white">
        <BrandingBarSection />
      </div>

      {/* 3. Contenido principal de la página - con padding top para compensar header (h-24 = 96px) + branding bar (~100px) */}
      <main className="pt-40">
        {children}
      </main>      {/* 🚀 SECCIÓN DE MARCAS: Fuera del main para ocupar ancho completo sin espacios */}
      <AlliedBrandsSection />

      {/* 🛑 3. Footer Completo */}
      <FooterPublic />
    </div>
  );
};

export default PublicLayout;
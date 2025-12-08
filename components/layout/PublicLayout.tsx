// /components/layout/PublicLayout.tsx (CORREGIDO)

"use client";

import React, { ReactNode } from "react";
import HeaderPublic from "./HeaderPublic";
import FooterPublic from "./FooterPublic";
import AlliedBrandsSection from "../ui/AlliedBrandsSection";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Navbar público */}
      <HeaderPublic />

      {/* 2. Contenido principal de la página */}
      {/* CAMBIO 1: Aplicamos el padding de compensación (pt-20) al main. */}
      <main className="pt-20"> 

        {/* CAMBIO 2: Eliminamos el div con pt-20. El HeroSection se renderiza directamente con los hijos. */}
        {children}
      </main>

      {/* 🚀 SECCIÓN DE MARCAS: Fuera del main para ocupar ancho completo sin espacios */}
      <AlliedBrandsSection />      {/* 🛑 3. Footer Completo */}
      <FooterPublic />
    </div>
  );
};

export default PublicLayout;
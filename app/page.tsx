// /app/page.tsx (La Landing Page de la aplicación - RUTA / )

"use client";

import React from "react";
import PublicLayout from "../components/layout/PublicLayout";
import HeroSection from "../components/ui/HeroSection";
import CategorySection from "../components/ui/CategorySection";
import FeaturedProductsSection from "../components/ui/FeaturedProductsSection";
import WhyChooseUsSection from "../components/ui/WhyChooseUsSection";
import ContactSection from "../components/ui/ContactSection";

export default function HomePage() {
  return (
    <PublicLayout>
      {/* 1. SECCIÓN PRINCIPAL (HERO) */}
      <HeroSection />
      {/* 2. SECCIÓN DE CATEGORÍAS */}
      <CategorySection /> 
      {/* 3. SECCIÓN DE VALOR/PROPUESTA DE VENTA (NUEVO) */}
            <WhyChooseUsSection />
      {/* 4. SECCIÓN DE PRODUCTOS DESTACADOS (usando el nuevo archivo) */}
      <FeaturedProductsSection />    {/* 5. SECCIÓN DE CONTACTO (NUEVO) */}
            <ContactSection />     
    </PublicLayout>
  );
}

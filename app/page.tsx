// /app/page.tsx (La Landing Page de la aplicación - RUTA / )

"use client";

import React from "react";
import PublicLayout from "../components/layout/PublicLayout";
import HeroSection from "../components/ui/HeroSection";
import FeaturedProductsSection from "../components/ui/FeaturedProductsSection";
import WhyChooseUsSection from "../components/ui/WhyChooseUsSection";

export default function HomePage() {
  return (
    <PublicLayout>
      {/* 1. SECCIÓN PRINCIPAL (HERO/CARRUSEL) */}
      <HeroSection />
      {/* 2. SECCIÓN DE PRODUCTOS DESTACADOS */}
      <FeaturedProductsSection />  
      {/* 3. SECCIÓN DE VALOR/PROPUESTA DE VENTA */}
     <WhyChooseUsSection /> 
       {/* 5. SECCIÓN DE CONTACTO (NUEVO) */}
        {/*    <ContactSection />  */}   
    </PublicLayout>
  );
}

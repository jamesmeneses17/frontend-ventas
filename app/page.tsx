// /app/page.tsx (La Landing Page de la aplicación - RUTA / )

"use client";

import React from "react";
import PublicLayout from "../components/layout/PublicLayout";
import HeroSection from "../components/ui/HeroSection";
import FeaturedProductsSection from "../components/ui/FeaturedProductsSection";
import FeaturedProductsWithDiscount from "../components/ui/FeaturedProductsWithDiscount";
import WhyChooseUsSection from "../components/ui/WhyChooseUsSection";

export default function HomePage() {
  return (
    <PublicLayout>
      {/* 1. SECCIÓN PRINCIPAL (HERO/CARRUSEL) */}
      <HeroSection />
      {/* 2. SECCIÓN DE CATEGORÍAS DESTACADAS */}
      <FeaturedProductsSection />
      {/* 3. SECCIÓN DE PRODUCTOS CON PROMOCIONES */}
      {/* 4. SECCIÓN DE VALOR/PROPUESTA DE VENTA */}
      <WhyChooseUsSection />
    </PublicLayout>
  );
}

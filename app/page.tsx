// /app/page.tsx (La Landing Page de la aplicación - RUTA / )

"use client";

import React from 'react';
import PublicLayout from '../components/layout/PublicLayout'; 
import HeroSection from '../components/ui/HeroSection'; 
// 👈 Importa la sección de Categorías (la que ya tenías)
import CategorySection from '../components/ui/CategorySection'; 
// 👈 Importa la nueva sección de Productos Destacados
import FeaturedProductsSection from '../components/ui/FeaturedProductsSection'; 

export default function HomePage() {
  return (
    <PublicLayout>
      {/* 1. SECCIÓN PRINCIPAL (HERO) */}
      <HeroSection />
      
      {/* 2. SECCIÓN DE CATEGORÍAS */}
      <CategorySection />

      {/* 3. SECCIÓN DE PRODUCTOS DESTACADOS (usando el nuevo archivo) */}
      <FeaturedProductsSection />
      
    </PublicLayout>
  );
}
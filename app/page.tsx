// /app/page.tsx (La Landing Page de la aplicación - RUTA / )

"use client";

import React from 'react';
import PublicLayout from '../components/layout/PublicLayout'; 
import HeroSection from '../components/ui/HeroSection'; 
import CategorySection from '../components/ui/CategorySection'; // 👈 ¡Importa el nuevo componente!

export default function HomePage() {
  return (
    <PublicLayout>
        {/* 1. SECCIÓN PRINCIPAL (HERO) */}
        <HeroSection />
        
        {/* 2. SECCIÓN DE CATEGORÍAS - Colocado justo debajo */}
        <CategorySection />
        
        {/* Aquí irían otras secciones: (Ej. Contacto Rápido, Beneficios) */}
        
    </PublicLayout>
  );
}
// /app/page.tsx (La Landing Page de la aplicación - RUTA / )

"use client";

import React from 'react';
import PublicLayout from '../components/layout/PublicLayout'; 
import HeroSection from '../components/ui/HeroSection'; // 👈 Importamos el nuevo componente

export default function HomePage() {
  return (
    <PublicLayout>
        {/* Contenido principal de la landing page */}
        <HeroSection />
        
        {/* Aquí irían otras secciones: Catálogo Destacado, Testimonios, Contacto Rápido */}
        
    </PublicLayout>
  );
}
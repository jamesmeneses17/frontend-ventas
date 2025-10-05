// /components/layout/PublicLayout.tsx (MODIFICADO)

import React, { ReactNode } from 'react';
import HeaderPublic from './HeaderPublic'; 

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    // CAMBIO 1: Cambiamos el fondo general a un color blanco o similar al de la imagen
    // Usaremos 'bg-white' o puedes probar 'bg-yellow-50' si quieres un tono crema muy suave
    <div className="min-h-screen bg-white"> 
      
      {/* 1. Navbar público: Este componente ya maneja su propio ancho y color */}
      <HeaderPublic /> 
      
      {/* 2. Contenido principal de la página */}
      {/* CAMBIO 2: ELIMINAMOS 'max-w-7xl' y 'px-*' y 'py-*' de <main> 
         Esto permite que el children (HeroSection) ocupe todo el ancho. 
         Los paddings y el ancho máximo los manejaremos dentro del componente HeroSection.
      */}
      <main> 
        {children}
      </main>

      {/* 3. Footer simple (mantenido) */}
      <footer className="bg-white border-t border-gray-100 mt-12 py-6">
        <div className="mx-auto max-w-7xl text-center text-sm text-gray-500">
          © {new Date().getFullYear()} DISEM SAS. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
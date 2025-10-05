// /components/layout/PublicLayout.tsx

import React, { ReactNode } from 'react';
import HeaderPublic from './HeaderPublic'; 

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Navbar público: logo, navegación, botones de cotización/contacto */}
      <HeaderPublic /> 
      
      {/* 2. Contenido principal de la página */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* 3. Footer simple (puedes agregarlo aquí o en un componente separado) */}
      <footer className="bg-white border-t border-gray-100 mt-12 py-6">
        <div className="mx-auto max-w-7xl text-center text-sm text-gray-500">
          © {new Date().getFullYear()} DISEM SAS. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
// /components/layout/PublicLayout.tsx (MODIFICADO)

import React, { ReactNode } from 'react';
import HeaderPublic from './HeaderPublic'; 
// 👈 Importa el nuevo componente Footer
import FooterPublic from './FooterPublic'; 

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white"> 
      
      {/* 1. Navbar público */}
      <HeaderPublic /> 
      
      {/* 2. Contenido principal de la página */}
      <main> 
        {children}
      </main>

      {/* 🛑 3. Footer Completo (Reemplazado) */}
      <FooterPublic />
    </div>
  );
};

export default PublicLayout;
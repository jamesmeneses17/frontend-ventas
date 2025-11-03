// /components/layout/AuthSplitPanel.tsx
import React, { ReactNode } from 'react';

interface AuthSplitPanelProps {
  children: ReactNode; 
  imageSrc: string;   
  imageAlt?: string;  
}

const AuthSplitPanel: React.FC<AuthSplitPanelProps> = ({ children, imageSrc, imageAlt = "Imagen de fondo" }) => {
  return (
<div 
      className="flex min-h-screen items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/fondo.webp')" }} // Cambia la ruta si es necesario
    >      <div className="flex w-full max-w-4xl overflow-hidden bg-red rounded-3xl border border-gray-700 h-[520px]">
        
        <div className="w-full lg:w-1/2 p-16 flex flex-col justify-center items-center">
          <div className="w-full max-w-xs">
            {children}
          </div>
        </div>

        {/* Columna 2: La Imagen (Oculta en móviles) */}
        <div className="hidden lg:block lg:w-1/2">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </div>

      </div>
    </div>
  );
};

export default AuthSplitPanel;
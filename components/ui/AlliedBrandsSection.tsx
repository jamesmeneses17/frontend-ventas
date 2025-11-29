// /components/sections/AlliedBrandsSection.tsx

"use client";

import React from 'react';

// Definimos la ruta de la única imagen que contiene todos los logos
const BARRA_LOGOS_SRC = '/images/barra_movimiento.png';
const BARRA_LOGOS_ALT = 'Logotipos de marcas aliadas en una sola imagen';

const AlliedBrandsSection: React.FC = () => {
  return (
    // 1. Contenedor de ancho completo
    <div className="w-full bg-white">
      {/* 2. Contenedor relativo que define la altura de la barra */}
      <div className="relative w-full py-0 
            h-[64px] sm:h-[80px] md:h-[100px] lg:h-[120px] 
            -mt-0 sm:-mt-0">
        
        {/* 3. Contenedor absoluto que cubre todo el espacio del padre y centra el contenido */}
        {/* Solo necesitamos este div absoluto para posicionar y centrar verticalmente */}
        <div className="absolute inset-0 flex justify-center items-center overflow-hidden">
          
          {/* 4. La imagen. Cubre el ancho y el alto del contenedor absoluto. */}
          <img
            src={BARRA_LOGOS_SRC}
            alt={BARRA_LOGOS_ALT}
            // CLASES CLAVE: w-full y h-full aseguran que ocupe todo el espacio.
            className="w-full h-full object-contain" 
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};

export default AlliedBrandsSection;
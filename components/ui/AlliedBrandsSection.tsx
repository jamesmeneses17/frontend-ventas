// /components/sections/AlliedBrandsSection.tsx

"use client";

import React from 'react';
import Image from 'next/image';

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
                    {/* Wrapper relativo necesario para que Image con `fill` funcione correctamente */}
                    <div className="relative w-full h-full">
                        <Image
                            src={BARRA_LOGOS_SRC}
                            alt={BARRA_LOGOS_ALT}
                            fill
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                </div>
      </div>
    </div>
  );
};

export default AlliedBrandsSection;
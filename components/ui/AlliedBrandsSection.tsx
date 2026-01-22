"use client";

import React from 'react';
import Image from 'next/image';

// Definimos la ruta de la única imagen que contiene todos los logos
const BARRA_LOGOS_SRC = '/images/barra_movimiento.png';
const BARRA_LOGOS_ALT = 'Logotipos de marcas aliadas en una sola imagen';

const AlliedBrandsSection: React.FC = () => {
      return (
            // 1. Contenedor de ancho completo. Aseguramos que no haya padding vertical.
            <div className="w-full bg-white py-0 my-0">
                  {/* 2. Contenedor relativo que define la altura de la barra. 
          Eliminamos los márgenes negativos (-mt-0) ya que PublicLayout ya fue ajustado. */}
                  <div className="relative w-full py-0 
            h-[30px] sm:h-[35px] md:h-[40px] lg:h-[50px]">                {/* 3. Contenedor absoluto que cubre todo el espacio del padre y centra el contenido */}
                        <div className="absolute inset-0 flex justify-center items-center overflow-hidden">
                              {/* Wrapper relativo necesario para que Image con `fill` funcione correctamente */}
                              <div className="relative w-full h-full">
                                    <Image
                                          src={BARRA_LOGOS_SRC}
                                          alt={BARRA_LOGOS_ALT}
                                          fill
                                          // Aseguramos que la imagen se vea completa (contain)
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
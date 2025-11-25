"use client";

import React from 'react';
import Image from 'next/image';

// Definimos la ruta de la única imagen que contiene todos los logos
const BARRA_LOGOS_SRC = '/images/barra_movimiento.png';
const BARRA_LOGOS_ALT = 'Logotipos de marcas aliadas en una sola imagen';

// El componente ya no necesita el array 'brands' ya que solo usa una imagen.
/*
// Array de marcas (se elimina)
const brands = [
  { name: 'marca1', src: '/images/marca1.png' },
  // ...
];
*/

const AlliedBrandsSection: React.FC = () => {
  return (
    // Utilizamos el contenedor para centrar y limitar el ancho, manteniendo el padding horizontal.
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Contenedor de la Única Imagen
        - w-full: Ocupa todo el ancho disponible del contenedor padre.
        - relative: Necesario para que Next/Image con 'fill' funcione.
        - h-auto y max-h-[...] para controlar la altura de la barra.
      */}
      <div className="w-full relative py-2 
                      h-[80px] sm:h-[100px] lg:h-[120px]">
        <Image
          src={BARRA_LOGOS_SRC}
          alt={BARRA_LOGOS_ALT}
          fill
          priority
          // 'object-contain' asegura que la imagen completa se muestre 
          // sin recortar dentro de la altura definida (h-...).
          style={{ objectFit: 'contain' }}
          sizes="100vw"
          quality={80}
        />
      </div>
    </div>
  );
};

export default AlliedBrandsSection;
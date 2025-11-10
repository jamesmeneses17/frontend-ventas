// /components/ui/AlliedBrandsSection.tsx

import React from 'react';
import Image from 'next/image';

// Array de marcas (usa las rutas de tus imágenes reales)
const brands = [
  { name: 'marca1', src: '/images/marca1.png' },
  { name: 'Marca 2', src: '/images/marca2.png' },
  { name: 'Marca 3', src: '/images/marca3.png' },
  { name: 'Marca 4', src: '/images/marca4.png' },
  { name: 'Marca 5', src: '/images/marca2.png' },
  { name: 'Marca 6', src: '/images/marca3.png' },
    { name: 'Marca 4', src: '/images/marca4.png' },
      { name: 'Marca 4', src: '/images/marca1.png' },
            { name: 'Marca 4', src: '/images/marca1.png' },
              { name: 'Marca 6', src: '/images/marca3.png' },





  // Añade más marcas aquí
];

const AlliedBrandsSection: React.FC = () => {
  return (
    // Sección principal con fondo blanco y padding vertical/horizontal
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mostrar todas las marcas en una sola fila, distribuidas equitativamente sin scroll (altura reducida) */}
        <div className="flex items-center justify-between gap-3 py-2 opacity-90">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex-1 flex justify-center items-center min-w-0 max-w-[160px] sm:max-w-[190px] lg:max-w-[240px] h-16 sm:h-14 lg:h-18 relative px-2"
            >
              {/* Next/Image con fill y objectFit contain para mantener proporción dentro del área fija */}
              <Image
                src={brand.src}
                alt={brand.name}
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 640px) 120px, 160px"
              />
            </div>
          ))}
        </div>
      </div>
  );
};

export default AlliedBrandsSection;
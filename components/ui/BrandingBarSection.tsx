"use client";

import React from 'react';
import Image from 'next/image';

const BrandingBarSection: React.FC = () => {
  return (
    <div className="w-full bg-white py-2 my-0 border-b border-gray-200">
      <div className="relative w-full h-[60px] sm:h-[70px] md:h-[85px] lg:h-[100px]">
        <Image
          src="/images/barra_movimiento.png"
          alt="Marcas aliadas"
          fill
          priority
          style={{ objectFit: 'contain', objectPosition: 'center' }}
        />
      </div>
    </div>
  );
};

export default BrandingBarSection;

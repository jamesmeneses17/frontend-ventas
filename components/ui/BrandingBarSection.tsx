"use client";

import React from 'react';
import Image from 'next/image';
import { getBannerById } from '../services/bannersService';

const BrandingBarSection: React.FC = () => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBanner = async () => {
      try {
        // ID 2 está reservado para la barra de marcas
        const banner = await getBannerById(2);
        if (banner && banner.imagenes && banner.imagenes.length > 0) {
          // Tomar la primera imagen activa
          const activeImage = banner.imagenes.find((img: any) => img.activo);
          if (activeImage) {
            setImageUrl(activeImage.urlImagen);
          }
        }
      } catch (error) {
        console.error("Error fetching branding banner:", error);
      }
    };

    fetchBanner();
  }, []);

  if (!imageUrl) return null;

  return (
    <div className="w-full bg-white py-2 my-0 border-b border-gray-200">
      <div className="relative w-full h-[60px] sm:h-[70px] md:h-[85px] lg:h-[100px]">
        <Image
          src={imageUrl}
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

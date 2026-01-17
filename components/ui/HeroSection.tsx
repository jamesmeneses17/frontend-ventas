"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getBanners, Banner } from "../services/bannersService";

interface Slide {
  id: number;
  src: string;
  alt: string;
}

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const banners = await getBanners();
        if (banners.length > 0 && banners[0].imagenes.length > 0) {
          // Filter only active images and sort by order (if any)
          const activeImages = banners[0].imagenes.filter(img => img.activo !== false); // Handle null/undefined as true? Backend default is true.

          if (activeImages.length > 0) {
            const dynamicSlides = activeImages.map((img) => ({
              id: img.id,
              src: img.urlImagen,
              alt: "Banner publicitario",
            }));
            setSlides(dynamicSlides);
          }
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    fetchBanners();
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    // Reset timer when slides change
    const slideInterval = setInterval(nextSlide, 6000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);



  return (
    <section className="bg-white relative w-full -mt-6">
      {/* Ancho Completo */}
      <div className="w-full relative overflow-hidden">        {/* Contenedor de la Imagen y altura ajustada */}
        <div className="w-full 
            h-[140px] sm:h-[180px] md:h-[240px] lg:h-[300px] xl:h-[350px] 
            relative">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
            >
              <Image
                src={slide.src}
                alt={slide.alt || `Slide ${slide.id}`}
                fill
                priority={index === 0}
                className="object-contain md:object-cover"
                sizes="100vw"
                quality={80}
              />
            </div>
          ))}
        </div>

        {/* ========================================================== */}
        {/* Botón de Navegación IZQUIERDA (Flecha) - AHORA TRANSPARENTE */}
        {/* ========================================================== */}
        <button
          onClick={prevSlide}
          // CAMBIO CLAVE: Quitamos bg-black/60 y hover:bg-black/80
          className="absolute top-1/2 left-4 transform -translate-y-1/2 p-2 rounded-full text-white z-20 transition"
          aria-label="Diapositiva anterior"
        >
          <ChevronLeft size={30} />
        </button>

        {/* ========================================================== */}
        {/* Botón de Navegación DERECHA (Flecha) - AHORA TRANSPARENTE */}
        {/* ========================================================== */}
        <button
          onClick={nextSlide}
          // CAMBIO CLAVE: Quitamos bg-black/60 y hover:bg-black/80
          className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 rounded-full text-white z-20 transition"
          aria-label="Diapositiva siguiente"
        >
          <ChevronRight size={30} />
        </button>

        {/* ========================================================== */}
        {/* Indicadores de Posición (Puntos/Dots) */}
        {/* ========================================================== */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-amber-500" : "bg-white/80 hover:bg-white"
                }`}
              aria-label={`Ir a la diapositiva ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroSection;

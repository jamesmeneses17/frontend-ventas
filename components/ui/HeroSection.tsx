"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 1. Define los datos de las diapositivas (slides)
const slides = [
  {
    id: 1,
    src: "/images/baner1.webp",
    alt: "Banner 1 de la empresa",
  },
  {
    id: 2,
    src: "/images/baner2.webp",
    alt: "Banner 2 de la empresa",
  },
  {
    id: 3,
    src: "/images/baner3.webp",
    alt: "Banner 3 de la empresa",
  },
  {
    id: 4,
    src: "/images/baner4.png",
    alt: "Banner 3 de la empresa",
  },
    {
    id: 5,
    src: "/images/baner5.png",
    alt: "Banner 3 de la empresa",
  },
    {
    id: 6,
    src: "/images/baner6.png",
    alt: "Banner 3 de la empresa",
  },
];

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 7000);
    return () => clearInterval(slideInterval);
  }, []);

  const current = slides[currentSlide];

  return (
    <section className="bg-white relative w-full -mt-6">
      {/* Ancho Completo */}
      <div className="w-full relative overflow-hidden">        {/* Contenedor de la Imagen y altura ajustada */}
        <div className="w-full 
            h-[140px] sm:h-[180px] md:h-[240px] lg:h-[300px] xl:h-[350px] 
            relative"> 
          <Image
            src={current.src}
            alt={current.alt || `Slide ${current.id}`}
            fill
            priority
            // Utilizamos 'object-cover' para llenar el espacio
            className="object-cover transition-opacity duration-1000 ease-in-out"
            sizes="100vw"
            quality={80}
          />
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
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-amber-500" : "bg-white/80 hover:bg-white"
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

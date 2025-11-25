"use client";

import React from 'react';
// Ya no necesitamos los íconos ni Image de next/image

// Definimos la ruta del video
const VIDEO_SRC = '/videos/VIDEO.mp4'; 
const WHY_CHOOSE_US_TEXT = "Nuestro enfoque personalizado y atención al detalle nos permite diseñar sistemas solares a medida, adaptados a las necesidades y metas de cada cliente. Además, nuestra dedicación a la innovación constante nos permite estar a la vanguardia de las últimas tecnologías solares, asegurando resultados superiores en términos de rendimiento, durabilidad y rentabilidad.";

/**
 * Sección que comunica los valores clave con un video de fondo.
 */
const WhyChooseUsSection: React.FC = () => {
    return (
        // 1. Contenedor principal: Altura fija, posición relativa para el video/overlay, y centrado del contenido.
        <section className="relative w-full overflow-hidden 
                            h-[300px] md:h-[350px] lg:h-[400px]">

            {/* ========================================================== */}
            {/* 2. Video de Fondo (Ocupa el 100% de la sección) */}
            {/* ========================================================== */}
            <video
                className="absolute top-0 left-0 w-full h-full object-cover"
                src={VIDEO_SRC}
                // Atributos clave para video de fondo:
                autoPlay // Inicia la reproducción automáticamente
                loop     // Se repite continuamente
                muted    // Fundamental para el autoplay en la mayoría de navegadores
                playsInline // Recomendado para móviles
            >
                {/* Fallback para navegadores que no soportan el video */}
                Tu navegador no soporta el elemento de video.
            </video>

            {/* ========================================================== */}
            {/* 3. Overlay Oscuro para Mejorar la Legibilidad del Texto */}
            {/* ========================================================== */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>

            {/* ========================================================== */}
            {/* 4. Contenido (Texto) - Centrado sobre el video */}
            {/* ========================================================== */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-white p-4">
                
                {/* Título Principal */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-center tracking-wide uppercase">
                    POR QUÉ ELEGIRNOS A NOSOTROS
                </h2>
                
                {/* Descripción Reducida */}
                <p className="mt-4 text-base sm:text-lg text-center max-w-4xl font-medium px-4">
                    {WHY_CHOOSE_US_TEXT}
                </p>

            </div>
            
        </section>
    );
};

// Ya no necesitamos el componente ValueCard si eliminamos la cuadrícula de iconos.
/*
const ValueCard: React.FC<ValueCardProps> = ({ title, description, icon }) => (...)
*/

export default WhyChooseUsSection;
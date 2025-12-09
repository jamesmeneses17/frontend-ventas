"use client";

import React from 'react';

const VIDEO_SRC = '/videos/VIDEO.mp4'; 
const WHY_CHOOSE_US_TEXT = "Nuestro enfoque personalizado y atención al detalle nos permite diseñar sistemas solares a medida, adaptados a las necesidades y metas de cada cliente. Además, nuestra dedicación a la innovación constante nos permite estar a la vanguardia de las últimas tecnologías solares, asegurando resultados superiores en términos de rendimiento, durabilidad y rentabilidad.";


const WhyChooseUsSection: React.FC = () => {
    return (
       
       <section className="relative w-full overflow-hidden h-[400px] md:h-[500px] lg:h-[600px] -mt-20">
        {/* --- FIN DE LA MODIFICACIÓN --- */}

            <video
                className="absolute top-0 left-0 w-full h-full object-cover"
                src={VIDEO_SRC}
                // Atributos clave para video de fondo:
                autoPlay // Inicia la reproducción automáticamente
                loop     // Se repite continuamente
                muted    // Fundamental para el autoplay en la mayoría de navegadores
                playsInline // Recomendado para móviles
            >
               
                Tu navegador no soporta el elemento de video.
            </video>

            
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

export default WhyChooseUsSection;
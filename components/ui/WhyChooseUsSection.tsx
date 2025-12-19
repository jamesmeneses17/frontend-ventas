"use client";

import React from 'react';

const VIDEO_SRC = '/videos/VIDEO.mp4'; 

const WhyChooseUsSection: React.FC = () => {
    return (
        /* Se redujo la altura mínima para que sea más compacta como en Ingesolar */
        <section className="relative w-full overflow-hidden min-h-[450px] md:min-h-[550px] lg:min-h-[650px]">
            {/* --- VIDEO DE FONDO --- */}
            <video
                className="absolute top-0 left-0 w-full h-full object-cover"
                src={VIDEO_SRC}
                autoPlay 
                loop     
                muted    
                playsInline 
            >
                Tu navegador no soporta el elemento de video.
            </video>

            {/* Capa de superposición para legibilidad (Ajustada a 40% para nitidez) */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/40"></div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-white py-12 md:py-16 px-6">
                
                {/* 1. Título y Subtítulo (Compactados) */}
                <div className="text-center mb-10 md:mb-14 max-w-5xl drop-shadow-md">
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-bold tracking-widest uppercase mb-3 leading-tight">
                        ENERGÍA SOLAR, CORRIENTE ALTERNA Y CONSUMIBLES AUTOMOTRICES EN UN SOLO LUGAR.
                    </h2>
                    <p className="text-base md:text-lg font-semibold tracking-wide uppercase opacity-90">
                        CALIDAD, EXCELENCIA Y ATENCIÓN PERSONALIZADA.
                    </p>
                </div>

                {/* 2. Sección de Valores (3 Columnas) */}
                <div className="w-full max-w-6xl">
                    <h3 className="text-xs md:text-sm font-bold uppercase tracking-[0.4em] mb-8 md:mb-10 text-center md:text-left opacity-80 border-l-4 border-white pl-4">
                        NOS CARACTERIZA
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center md:text-left">
                        {/* Columna 1 */}
                        <div className="space-y-3">
                            <h4 className="text-lg md:text-xl font-bold border-b border-white/40 pb-2 inline-block md:block">
                                Ética y Confianza
                            </h4>
                            <p className="text-sm md:text-base leading-relaxed text-gray-100 font-medium">
                                Actuamos con integridad, honestidad y coherencia en cada proceso.
                            </p>
                        </div>

                        {/* Columna 2 */}
                        <div className="space-y-3">
                            <h4 className="text-lg md:text-xl font-bold border-b border-white/40 pb-2 inline-block md:block">
                                Compromiso y Transparencia
                            </h4>
                            <p className="text-sm md:text-base leading-relaxed text-gray-100 font-medium">
                                Cumplimos nuestras obligaciones con claridad, responsabilidad y comunicación abierta.
                            </p>
                        </div>

                        {/* Columna 3 */}
                        <div className="space-y-3">
                            <h4 className="text-lg md:text-xl font-bold border-b border-white/40 pb-2 inline-block md:block">
                                Unidad y Colaboración
                            </h4>
                            <p className="text-sm md:text-base leading-relaxed text-gray-100 font-medium">
                                Trabajamos de manera conjunta para ofrecer soluciones eficientes y de alta calidad.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUsSection;
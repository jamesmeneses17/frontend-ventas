// /components/ui/WhyChooseUsSection.tsx

"use client"; // Se recomienda si usas elementos interactivos o hooks, aunque aquí no es estrictamente necesario.

import React from 'react';
import Image from 'next/image';
// 🛑 Importamos los iconos de Lucide
import { Award, ShieldCheck, Zap, Lightbulb } from 'lucide-react'; 


// Sub-componente para cada valor (simplicidad y reutilización)
interface ValueCardProps {
    title: string;
    description: string;
    icon: React.ReactNode; 
}

const ValueCard: React.FC<ValueCardProps> = ({ title, description, icon }) => (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        {/* Usamos el icono directamente */}
        <div className="text-amber-600 mb-4">{icon}</div> 
        
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

/**
 * Sección que comunica los valores clave y la propuesta de venta de la empresa.
 */
const WhyChooseUsSection: React.FC = () => {
    
    // 🛑 Definimos las props de los iconos aquí para DRY (Don't Repeat Yourself)
    const IconProps = { className: "w-8 h-8 md:w-10 md:h-10" };
    
    return (
        <section className="py-20 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Lado Izquierdo: Imagen (Usando Next/Image para optimización) */}
                <div className="order-2 lg:order-1 relative rounded-xl shadow-2xl overflow-hidden" 
                     style={{ aspectRatio: '16/10' }}>
                    
                    <Image 
                        src="/images/energia.webp" 
                        alt="Instalación de paneles solares por equipo experto"
                        fill // Hace que la imagen llene el contenedor padre
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 1024px) 100vw, 50vw" // Ayuda a Next.js a optimizar
                        priority // Se usa para imágenes importantes en la parte superior de la página
                    />
                </div>

                {/* Lado Derecho: Contenido y Propuestas de Valor */}
                <div className="order-1 lg:order-2">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                        ¿Por qué elegir DISEM SAS?
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 mb-10 max-w-lg">
                        Somos líderes en soluciones de energía solar en Colombia, con más 
                        de 10 años de experiencia ayudando a hogares y empresas a hacer la 
                        transición hacia energías renovables.
                    </p>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                        {/* 🛑 Reemplazamos IconCircle con iconos Lucide */}
                        <ValueCard 
                            title="Calidad Certificada"
                            description="Todos nuestros productos cuentan con certificaciones internacionales."
                            icon={<Award {...IconProps} />}
                        />
                        <ValueCard 
                            title="Garantía Extendida"
                            description="Hasta 25 años de garantía en paneles solares y equipos clave."
                            icon={<ShieldCheck {...IconProps} />}
                        />
                        <ValueCard 
                            title="Asesoría Experta"
                            description="Equipo técnico especializado para guiarte en tu proyecto de inicio a fin."
                            icon={<Lightbulb {...IconProps} />}
                        />
                        <ValueCard 
                            title="Instalación Profesional"
                            description="Servicio de instalación y mantenimiento especializado incluido."
                            icon={<Zap {...IconProps} />}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUsSection;
// /components/ui/WhyChooseUsSection.tsx

import React from 'react';
import Image from 'next/image';


// Sub-componente para cada valor (simplicidad y reutilización)
interface ValueCardProps {
    title: string;
    description: string;
    icon: React.ReactNode; 
}

const ValueCard: React.FC<ValueCardProps> = ({ title, description, icon }) => (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
        <div className="flex items-center space-x-3 mb-2">
            <div className="text-amber-500">{icon}</div> {/* Icono */}
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
    </div>
);

/**
 * Sección que comunica los valores clave y la propuesta de venta de la empresa.
 * Incluye la imagen y los cuatro puntos clave.
 */
const WhyChooseUsSection: React.FC = () => {
    // Definición de íconos (puedes usar iconos reales de React como Lucide o Heroicons)
    // Aquí usamos un SVG simple para representar los iconos anaranjados de tu imagen.
    const IconCircle = (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
        </svg>
    );

    return (
        <section className="py-20 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Lado Izquierdo: Imagen */}
                <div className="order-2 lg:order-1">
                    <img 
                        // 🛑 RUTA ACTUALIZADA: La ruta es relativa a la carpeta /public
                        src="/images/energia.webp" 
                        alt="Instalación de paneles solares por equipo experto"
                        className="rounded-xl shadow-2xl w-full h-auto"
                        style={{ aspectRatio: '16/10', objectFit: 'cover' }}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {/* Mapeamos los valores clave */}
                        <ValueCard 
                            title="Calidad Certificada"
                            description="Todos nuestros productos cuentan con certificaciones internacionales."
                            icon={IconCircle} // 🛑 Usa tu icono real aquí
                        />
                        <ValueCard 
                            title="Garantía Extendida"
                            description="Hasta 25 años de garantía en paneles solares y equipos clave."
                            icon={IconCircle} // 🛑 Usa tu icono real aquí
                        />
                        <ValueCard 
                            title="Asesoría Experta"
                            description="Equipo técnico especializado para guiarte en tu proyecto de inicio a fin."
                            icon={IconCircle} // 🛑 Usa tu icono real aquí
                        />
                        <ValueCard 
                            title="Instalación Profesional"
                            description="Servicio de instalación y mantenimiento especializado incluido."
                            icon={IconCircle} // 🛑 Usa tu icono real aquí
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUsSection;
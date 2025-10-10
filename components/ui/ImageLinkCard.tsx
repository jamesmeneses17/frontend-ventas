// /components/ui/ImageLinkCard.tsx

import React from 'react';

interface ImageLinkCardProps {
    /** La URL a la que navegará el usuario. */
    href: string;
    /** La fuente de la imagen de fondo (URL). */
    imageSrc: string;
    /** El texto alternativo para la imagen (accesibilidad). */
    altText: string;
    /** El contenido específico (título, precio, etc.) que se renderizará sobre el overlay. */
    children: React.ReactNode; 
}

/**
 * Componente base reutilizable para tarjetas visuales con imagen de fondo y efecto hover.
 * Maneja todos los estilos de layout y animación (sombra, gradiente, transformación).
 */
const ImageLinkCard: React.FC<ImageLinkCardProps> = ({ href, imageSrc, altText, children }) => (
    <a 
        href={href} 
        // Estilos visuales compartidos por ProductCard y CategoryCard
        className="group relative block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
    >
        {/* Imagen de Fondo */}
        <img 
            className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition duration-300" 
            src={imageSrc} 
            alt={altText}
        />
        {/* Overlay de Gradiente Oscuro */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        
        {/* Contenedor del Contenido (Title, Price, Description) */}
        <div className="relative p-6 pt-40 flex flex-col justify-end h-full">
            {children} 
        </div>
    </a>
);

export default ImageLinkCard;
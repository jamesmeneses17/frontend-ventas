// /components/ui/ImageLinkCard.tsx

import React from 'react';
import Image from 'next/image';

interface ImageLinkCardProps {
    /** La URL a la que navegará el usuario. */
    href: string;
    /** La fuente de la imagen de fondo (URL). */
    imageSrc: string;
    /** El texto alternativo para la imagen (accesibilidad). */
    altText: string;
    /** El contenido específico (título, precio, etc.) que se renderizará sobre el overlay. */
    children: React.ReactNode;
    /** Clases adicionales para personalizar el contenedor principal. */
    className?: string;
}

/**
 * Componente base reutilizable para tarjetas visuales con imagen de fondo y efecto hover.
 * Maneja todos los estilos de layout y animación (sombra, gradiente, transformación).
 */
const ImageLinkCard: React.FC<ImageLinkCardProps> = ({ href, imageSrc, altText, children, className = "" }) => (
    <a
        href={href}
        // Estilos visuales compartidos por ProductCard y CategoryCard
        className={`group relative block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 ${className}`}
    >
        {/* Imagen de Fondo */}
        <div className="absolute inset-0">
            <Image src={imageSrc} alt={altText} fill className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
            {/* Overlay Gradiente para legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
        </div>

        {/* Contenedor del Contenido (Title, Price, Description) */}
        <div className="relative p-3 sm:p-6 pt-24 sm:pt-40 flex flex-col justify-end h-full">
            {children}
        </div>
    </a>
);

export default ImageLinkCard;
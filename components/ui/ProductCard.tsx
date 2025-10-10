// /components/ui/ProductCard.tsx

import React from "react";

interface ProductCardProps {
    /** ID del producto, usado principalmente como clave. */
    id: number;
    /** Nombre del producto. */
    nombre: string;
    /** Precio del producto ya formateado (ej: "$245.000" o "Consultar Precio"). */
    displayPrice: string; 
    /** URL de la imagen. */
    imageSrc: string;
    /** URL a la que navegará el usuario al hacer clic. */
    href: string;
}

/**
 * Componente Tarjeta de Producto (Estilo: Imagen arriba, Contenido blanco abajo).
 * Muestra la imagen, nombre, precio y un botón "Ver más".
 */
const ProductCard: React.FC<ProductCardProps> = ({ nombre, displayPrice, imageSrc, href }) => {
    
    return (
        // Estilo de tarjeta de producto: Fondo blanco con sombra
        <div 
            className="group relative block bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
        >
            {/* Contenedor de la Imagen */}
            <a href={href} className="block relative h-48 sm:h-56 overflow-hidden">
                <img
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    src={imageSrc}
                    alt={nombre}
                />
            </a>

            {/* Contenido de Texto y Precio */}
            <div className="p-4 flex flex-col items-center text-center">
                
                {/* Estrellas de Calificación (Placeholder visual) */}
                <div className="flex text-amber-500 mb-2">
                    {Array(5).fill(0).map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.122-6.545-4.745-4.636 6.571-.955L10 2l2.87 5.954 6.571.955-4.745 4.636 1.122 6.545L10 15z" />
                        </svg>
                    ))}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-1">
                    {nombre}
                </h3>
                
                <p className="text-2xl font-bold text-amber-600 mb-3">
                    {displayPrice}
                </p>

                {/* Botón Ver más */}
                <a 
                    href={href}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-900 transition duration-150"
                >
                    Ver más
                </a>
            </div>
        </div>
    );
};

export default ProductCard;
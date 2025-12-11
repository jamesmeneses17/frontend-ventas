"use client";

import React, { useState, useEffect } from "react";
// Importamos la lógica de categorías en lugar de productos
import {
    getCategoriasPrincipales,
    CategoriaPrincipal,
} from "@/components/services/categoriasPrincipalesService";
import { createSlug } from "@/utils/slug";
// Importamos ImageLinkCard, que será nuestra tarjeta base
import ImageLinkCard from "./ImageLinkCard";
// Ya no necesitamos ProductCard, formatPrice ni ProductUtils
import Link from "next/link";
import { Zap } from "lucide-react"; // Icono opcional para el título

// --- 1. Tipos y Utilidad de Mapeo de Imágenes (Copiado de la página de Categorías) ---

interface CategoryCardDisplayProps {
    id: number;
    nombre: string;
    imageSrc: string;
    href: string;
}

const fallbackImages = [
    "/images/panel.webp",
    "/images/bateria.webp",
    "/images/controladores.webp",
    "/images/iluminacion-solar.webp",
];

const mapCategoryToImage = (nombre: string, id: number): string => {
    const slug = createSlug(nombre);

    switch (slug) {
        case "corriente-alterna":
        case "energia-ac":
            return "/images/iluminacion-solar.webp";
        case "energia-solar":
        case "energia-solar-sostenible":
            return "/images/panel.webp";
        
        default:
            const index = id % fallbackImages.length;
            return fallbackImages[index];
    }
};

// --- 2. Componente de Tarjeta de Categoría (Adaptado para la cuadrícula) ---

const CategoryCard: React.FC<CategoryCardDisplayProps> = ({
    nombre,
    imageSrc,
    href,
}) => (
    // La tarjeta es un enlace completo, usamos el componente base ImageLinkCard
    <ImageLinkCard href={href} imageSrc={imageSrc} altText={nombre}>
        <div className="flex flex-col justify-end h-full">
            {/* Overlay para el contenido de la tarjeta */}
            <div className="p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute inset-0">
                <div className="flex flex-col justify-end h-full">
                    
                    {/* Título de Categoría */}
                    <h3 className="text-xl font-bold text-white mb-2 tracking-wide">
                        {nombre}
                    </h3>

                    {/* Botón simple de Ver Categoría */}
                    <span className="text-sm font-medium text-amber-300 hover:text-amber-500 transition duration-150">
                        Explorar ahora →
                    </span>
                </div>
            </div>
        </div>
    </ImageLinkCard>
);

// --- 3. Componente de Sección Destacada (FeaturedProductsSection) ---

const FeaturedProductsSection: React.FC = () => {
    // Usamos CategoriaPrincipal en lugar de ProductoType
    const [categories, setCategories] = useState<CategoriaPrincipal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                // Llamamos al servicio de categorías principales
                const response = await getCategoriasPrincipales(1, 1000, ""); 
                
                let categoriasArray: CategoriaPrincipal[] = [];
                if (Array.isArray(response)) {
                    categoriasArray = response;
                } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
                    categoriasArray = response.data;
                }

                // Mostrar solo activas (activo === 1)
                const activeOnly = categoriasArray.filter((c: any) => Number(c.activo ?? 1) === 1);

                // Opcional: ordenar si es necesario, pero para destacados a veces se mantiene como viene
                setCategories(activeOnly);
                setLoading(false);
            } catch (err) {
                console.error("Error al cargar categorías:", err);
                setError(true);
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Mostrar solo 4 categorías (adaptado)
    const displayedCategories: CategoryCardDisplayProps[] = categories.slice(0, 4).map((cat) => ({
        id: cat.id,
        nombre: cat.nombre,
        // Usamos la lógica de mapeo de imágenes de categoría
        imageSrc: mapCategoryToImage(cat.nombre, cat.id),
        // La URL es la de la página de productos filtrados por la categoría principal
        href: `/users/categorias-principales?categoriaPrincipalId=${cat.id}`,
    }));

    if (loading) {
        return (
            <section className="py-16 text-center">
                <p className="text-lg text-amber-600">Cargando categorías destacadas...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-16 text-center">
                <p className="text-lg text-red-600">
                    Error al cargar las categorías. Intente de nuevo más tarde.
                </p>
            </section>
        );
    }

    return (
        <section className="py-8 sm:py-12 md:py-7 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900">
                        Explora Nuestras Categorías
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                        Encuentra rápidamente la sección de productos solares que necesitas.
                    </p>
                </div>

                {displayedCategories.length > 0 ? (
                    // Cuadrícula adaptada para 4 columnas, ideal para la sección destacada
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayedCategories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                {...category}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 text-lg">
                        No hay categorías disponibles por ahora.
                    </p>
                )}

                {/* Botón para ver todas las categorías (si hay más de 4) */}
                {categories.length > 4 && (
                    <div className="mt-12 text-center">
                        <a
                            href="/users/categorias" // Enlace a la página de todas las categorías
                            // --- CLASES MODIFICADAS AQUÍ ---
                            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 transition duration-150"
                            // -----------------------------
                        >
                            Ver todas las categorías →
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProductsSection;
// /app/categorias/page.tsx (PÁGINA PÚBLICA DE CATÁLOGO DE CATEGORÍAS)

"use client";

import React, { useState, useEffect, Suspense } from "react";
import PublicLayout from "../../../components/layout/PublicLayout";
import ImageLinkCard from "@/components/ui/ImageLinkCard";
import { getCategorias, Categoria } from "@/components/services/categoriasService";
import { createSlug } from "@/utils/slug"; // Asume que esta ruta es correcta

// ----------------------------------------------------------------------
// 1. Tipos y Mapeo de Imagenes (Reutilizamos la lógica del componente CategorySection)
// ----------------------------------------------------------------------

interface CategoryCardDisplayProps extends Categoria {
  descripcion?: string;
  imageSrc: string;
  href: string;
}

const mapCategoryToImage = (nombre: string): string => {
  const slug = createSlug(nombre); 

  switch (slug) {
    case "paneles-solares":
    case "energia-solar":
    case "energia-solar-sostenible":
      return "/images/panel.webp";
    case "baterias-solares":
    case "baterias":
      return "/images/bateria.webp";
    case "controladores":
    case "controlador":
      return "/images/controladores.webp";
    case "iluminacion-solar":
    case "iluminacion-ac":
    case "alumbrado-solar":
      return "/images/iluminacion-solar.webp";
    case "sistemas-de-bombeo":
      return "/images/bombeo.webp";
    default:
      return "/images/imagen.webp";
  }
};


// ----------------------------------------------------------------------
// 2. Componente de Tarjeta (CategoryCard) - Adaptado para la lista de Catálogo
// ----------------------------------------------------------------------

const CategoryCard: React.FC<CategoryCardDisplayProps> = ({ nombre, descripcion, imageSrc, href }) => (
    // Reutilizamos ImageLinkCard para la vista de cuadrícula
    <ImageLinkCard 
        href={href} 
        imageSrc={imageSrc} 
        altText={nombre}
    >
        <div className="flex items-center space-x-2 text-white mb-2">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.213a1.002 1.002 0 00-.399-.785L13.5 6l-2.401-1.849a1 1 0 00-1.2 0L6.5 6 3.399 8.428a1.002 1.002 0 00-.399.785V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5h2v5z" />
            </svg>
            <h3 className="text-xl font-bold">{nombre}</h3> 
        </div>
        <p className="text-sm text-gray-300">{descripcion || "Soluciones y productos de energía solar."}</p>
    </ImageLinkCard>
);

// ----------------------------------------------------------------------
// 3. Componente de Contenido (Lógica y Renderizado)
// ----------------------------------------------------------------------

function CategoriasClientePageContent() {
    const [categories, setCategories] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await getCategorias();
                setCategories(data);
                setLoading(false);
            } catch (err) {
                console.error("Error al cargar categorías:", err);
                setLoading(false); // Mantener el estado de carga
            }
        };
        fetchCategories();
    }, []);

    const displayedCategories: CategoryCardDisplayProps[] = categories.map((cat) => ({
        ...cat,
        imageSrc: mapCategoryToImage(cat.nombre),
        // La URL dirige a la página de productos con el filtro de categoría
        href: `/productos?categoria=${createSlug(cat.nombre)}`,
    }));


    return (
        <PublicLayout>
            {/* Contenedor Principal con fondo ambar-50 */}
            <div className="bg-amber-50 min-h-screen"> 
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                        
                    {/* SECCIÓN SUPERIOR: Título y Descripción */}
                    <div className="mb-12 text-center">
                        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
                            Catálogo de Categorías
                        </h1>
                        <p className="mt-3 text-xl text-gray-600 max-w-3xl mx-auto">
                            Explora todas nuestras categorías de productos solares y encuentra la sección que necesitas.
                        </p>
                    </div>

                    {/* --- INICIO DEL CATÁLOGO --- */}
                    <main id="catalog" className="mt-16">
                        
                        {/* NO SE REQUIERE BARRA DE CONTROLES para categorías */}

                        {/* Contenedor de Categorías: Manejo de estados de Carga/Vacío */}
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">
                                Cargando catálogo de categorías...
                            </div>
                        ) : displayedCategories.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No hay categorías disponibles en este momento.
                            </div>
                        ) : (
                            // Vista de cuadrícula fija para categorías
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {displayedCategories.map((category: CategoryCardDisplayProps) => (
                                    <CategoryCard
                                        key={category.id}
                                        {...category}
                                    />
                                ))}
                            </div>
                        )}
                        
                    </main>
                </div>
            </div>
        </PublicLayout>
    );
}

// ----------------------------------------------------------------------
// 4. Componente Raíz (Manejo de Suspense de Next.js)
// ----------------------------------------------------------------------

export default function CategoriasClientePage() {
    return (
        // Se mantiene Suspense aunque no haya searchParams, por si se añade lógica futura
        <Suspense
            fallback={
                <div className="text-center py-12 text-gray-500">
                    Cargando página de categorías...
                </div>
            }
        >
            <CategoriasClientePageContent />
        </Suspense>
    );
}
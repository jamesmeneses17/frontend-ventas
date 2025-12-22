"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import PublicLayout from "../../../components/layout/PublicLayout";
import ImageLinkCard from "@/components/ui/ImageLinkCard";
import { getCategoriasPrincipales, CategoriaPrincipal } from "@/components/services/categoriasPrincipalesService";
import { createSlug } from "@/utils/slug";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import SearchDropdown from "../../../components/common/form/SearchDropdown";

// ----------------------------------------------------------------------
// 1. Tipos, Mapeo y Fallback de Imágenes
// ----------------------------------------------------------------------

interface CategoryCardDisplayProps {
  id: number;
  nombre: string;
  descripcion?: string;
  imageSrc: string;
  href: string;
}

const fallbackImages = [
  "/images/panel.webp",
  "/images/bateria.webp",
  "/images/controladores.webp",
  "/images/iluminacion-solar.webp",
];

const mapProductToImage = (id: number): string => {
  // Alternar imágenes según el ID para que no se repita siempre la misma
  const index = id % fallbackImages.length;
  return fallbackImages[index];
};

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

// ----------------------------------------------------------------------
// 2. Tarjeta de Categoría (con botón azul "VER TODOS")
// ----------------------------------------------------------------------

const CategoryCard: React.FC<CategoryCardDisplayProps> = ({
  nombre,
  descripcion,
  imageSrc,
  href,
}) => (
  <ImageLinkCard href={href} imageSrc={imageSrc} altText={nombre}>
    <div className="flex flex-col justify-end h-full">
      {/* Título e ícono */}
      <div className="flex items-center space-x-2 text-white mb-3">
        {/* Usamos text-xl para mantener la jerarquía visual */}
        <h3 className="text-xl font-bold">{nombre}</h3>
      </div>

      {/* Botón azul */}
      <Link
        href={href}
        onClick={(e) => e.stopPropagation()}
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm 
          text-sm font-medium rounded-md text-white 
          bg-[#2e9fdb] hover:bg-[#238ac1] focus:outline-none 
          focus:ring-2 focus:ring-offset-2 focus:ring-[#2e9fdb] 
          transition duration-150 ease-in-out"
      >
        VER TODOS
      </Link>
    </div>
  </ImageLinkCard>
);

// ----------------------------------------------------------------------
// 3. Contenido principal
// ----------------------------------------------------------------------

function CategoriasClientePageContent() {
  const [categories, setCategories] = useState<CategoriaPrincipal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getCategoriasPrincipales(1, 1000, "");
        console.log('[Categorias Page] Datos recibidos:', response);
        
        // Verificar si response es un objeto con propiedad 'data' o directamente un array
        let categoriasArray: CategoriaPrincipal[] = [];
        if (Array.isArray(response)) {
          categoriasArray = response;
        } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
          categoriasArray = response.data;
        }
        
        console.log('[Categorias Page] Categorías Principales procesadas:', categoriasArray);
        
        // Ordenar categorías alfabéticamente para una mejor usabilidad
        const sortedData = categoriasArray.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setCategories(sortedData);
      } catch (err) {
        console.error("Error al cargar categorías principales:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Filtrar para mostrar solo categorías activas (activo === 1)
  const filteredCategories = categories.filter(cat => Number(cat.activo) === 1);

  // Mapear categorías principales a formato de display
  const displayedCategories: CategoryCardDisplayProps[] = filteredCategories.map((cat) => ({
    id: cat.id,
    nombre: cat.nombre,
    // Usar imagen_url de la BD si está disponible, si no usar fallback
    imageSrc: cat.imagen_url || mapCategoryToImage(cat.nombre, cat.id),
    href: `/users/categorias-principales?categoriaPrincipalId=${cat.id}`,
  }));

  return (
    <PublicLayout>
      {/* Fondo blanco */}
      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Título principal */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Catálogo de Categorías
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Explora todas nuestras categorías de productos solares y encuentra
              la sección que necesitas.
            </p>
          </div>

          {/* Buscador: usamos onSearchSubmit para navegar a la página de resultados */}
          <div className="mb-8 max-w-lg mx-auto">
            <SearchDropdown
              placeholder="Buscar categoría o producto..."
              onSearchSubmit={(v: string) => router.push(`/users/productos?q=${encodeURIComponent(v)}`)}
              maxResults={8}
              debounceMs={250}
            />
          </div>

          {/* Catálogo */}
          <main id="catalog" className="mt-5">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Cargando catálogo de categorías...
              </div>
            ) : displayedCategories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay categorías disponibles en este momento.
              </div>
            ) : (
              // ⭐️ Diseño centrado y responsivo
              <div className="flex justify-center">
                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl"
                >
                  {displayedCategories.map((category) => (
                    <CategoryCard key={category.id} {...category} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Mensaje de conteo total (opcional, pero ayuda a la intuición) */}
            {!loading && displayedCategories.length > 0 && (
              <div className="mt-10 text-center text-gray-500 text-sm">
                {displayedCategories.length === categories.length
                  ? `Mostrando las ${categories.length} categorías disponibles.`
                  : `Mostrando ${displayedCategories.length} de ${categories.length} categorías.`}
              </div>
            )}
          </main>
        </div>
      </div>
    </PublicLayout>
  );
}

// ----------------------------------------------------------------------
// 4. Suspense
// ----------------------------------------------------------------------

export default function CategoriasClientePage() {
  return (
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
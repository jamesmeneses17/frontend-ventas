// /app/categorias/page.tsx (PÁGINA PÚBLICA DE CATÁLOGO DE CATEGORÍAS)

"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import PublicLayout from "../../../components/layout/PublicLayout";
import ImageLinkCard from "@/components/ui/ImageLinkCard";
import { getCategorias, Categoria } from "@/components/services/categoriasService";
import { createSlug } from "@/utils/slug";
import SearchInput from "../../../components/common/form/SearchInput";
import Link from "next/link";

// ----------------------------------------------------------------------
// 1. Tipos, Mapeo y Fallback de Imágenes
// ----------------------------------------------------------------------

interface CategoryCardDisplayProps extends Categoria {
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

const mapCategoryToImage = (nombre: string, id: number): string => {
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
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategorias();
        setCategories(data);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Filtro optimizado
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const lower = searchTerm.toLowerCase();
    return categories.filter((cat) =>
      cat.nombre.toLowerCase().includes(lower)
    );
  }, [categories, searchTerm]);

  const displayedCategories: CategoryCardDisplayProps[] = filteredCategories.map(
      (cat) => ({ // Ahora mapeamos el array filtrado
      ...cat,
      imageSrc: mapCategoryToImage(cat.nombre, cat.id),
    href: `/users/productos?categoriaId=${cat.id}`,
    })
  );

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

          {/* Buscador */}
          <div className="mb-8 max-w-lg mx-auto">
            <SearchInput
              searchTerm={searchTerm}
              onSearchChange={(v: string) => setSearchTerm(v)}
              placeholder="Buscar categoría por nombre..."
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
                {searchTerm
                  ? `No se encontraron categorías para "${searchTerm}".`
                  : "No hay categorías disponibles en este momento."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedCategories.map((category) => (
                  <CategoryCard key={category.id} {...category} />
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

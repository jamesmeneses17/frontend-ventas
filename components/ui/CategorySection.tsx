// /components/ui/CategorySection.tsx

"use client";

import React, { useState, useEffect } from "react";
import { getCategorias, Categoria } from "../services/categoriasService";
// Importar la utilidad de slugging (Ajusta la ruta si es necesario)
import { createSlug } from "@/utils/slug";
import ImageLinkCard from "./ImageLinkCard";

// --- Tipos ---

interface CategoryCardDisplayProps extends Categoria {
  descripcion?: string;
  imageSrc: string;
  href: string;
}

// --- Mapeo de Imagenes (usa la utilidad de slugging) ---

const mapCategoryToImage = (nombre: string): string => {
  const slug = createSlug(nombre); // Usa la función centralizada

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
      return "/images/imagen.webp";
    default:
      return "/images/imagen.webp";
  }
};

// --- Componente de Tarjeta (CategoryCard) ---

const CategoryCard: React.FC<CategoryCardDisplayProps> = ({ nombre, descripcion, imageSrc, href }) => (
    <ImageLinkCard 
        href={href} 
        imageSrc={imageSrc} 
        altText={nombre}
    >
        <div className="flex items-center space-x-2 text-white mb-2">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zM5.5 10a.5.5 0 01.5-.5h8a.5.5 0 010 1h-8a.5.5 0 01-.5-.5z"/></svg>
            <h3 className="text-xl font-bold">{nombre}</h3> 
        </div>
        <p className="text-sm text-gray-300">{descripcion || "Soluciones y productos de energía solar."}</p>
    </ImageLinkCard>
);

// --- Componente de Sección Principal (CategorySection) ---

const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategorias();

        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
        setError(true);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const displayedCategories: CategoryCardDisplayProps[] = categories
    .slice(0, 4)
    .map((cat) => ({
      ...cat,
      imageSrc: mapCategoryToImage(cat.nombre),
      // Usa la función centralizada para crear el href
      href: `/productos?categoria=${createSlug(cat.nombre)}`,
    }));

  if (loading) {
    return (
      <section className="py-16 text-center">
        <p className="text-lg text-amber-600">Cargando categorías...</p>
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
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Nuestras Categorías
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Explora nuestra amplia gama de productos solares para encontrar la
            solución perfecta para tus necesidades.
          </p>
        </div>

        {displayedCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedCategories.map((category) => (
              <CategoryCard key={category.id} {...category} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">
            No hay categorías activas para mostrar. Revisa la conexión al API o
            el estado de los datos.
          </p>
        )}

        {categories.length > 4 && (
          <div className="mt-12 text-center">
            <a
              href="/productos"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-amber-600 hover:bg-amber-700 transition duration-150"
            >
              Explorar todas las {categories.length} categorías →
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;

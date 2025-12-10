"use client";

import React, { useState, useEffect, Suspense } from "react";
import PublicLayout from "../../../components/layout/PublicLayout";
import ImageLinkCard from "@/components/ui/ImageLinkCard";
import { getCategorias, Categoria } from "@/components/services/categoriasService";
import { getCategoriasPrincipales, CategoriaPrincipal } from "@/components/services/categoriasPrincipalesService";
import { createSlug } from "@/utils/slug";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import SearchDropdown from "../../../components/common/form/SearchDropdown";

// Fallback de imágenes
const fallbackImages = [
  "/images/panel.webp",
  "/images/bateria.webp",
  "/images/controladores.webp",
  "/images/iluminacion-solar.webp",
];

const mapCategoryToImage = (nombre: string, id: number): string => {
  const slug = createSlug(nombre);

  switch (slug) {
    case "accesorios-ac":
    case "bombillo-110-ac":
    case "panel-cuadrado-110-ac":
    case "reflectores-ac":
    case "panel-redondo-110-ac":
    case "toma-corriente":
    case "interruptor":
    case "alambre-cobre":
      return "/images/iluminacion-solar.webp";
    case "pwm":
    case "mppt":
      return "/images/controladores.webp";
    case "gel":
    case "litio":
    case "agm":
      return "/images/bateria.webp";
    case "onda-pura":
    case "inversor-cargado":
    case "onda-modificada":
      return "/images/panel.webp";
    default:
      const index = id % fallbackImages.length;
      return fallbackImages[index];
  }
};

interface CategoryCardDisplayProps {
  id: number;
  nombre: string;
  imageSrc: string;
  href: string;
}

const CategoryCard: React.FC<CategoryCardDisplayProps> = ({
  nombre,
  imageSrc,
  href,
}) => (
  <ImageLinkCard href={href} imageSrc={imageSrc} altText={nombre}>
    <div className="flex flex-col justify-end h-full">
      <div className="flex items-center space-x-2 text-white mb-3">
        <h3 className="text-xl font-bold">{nombre}</h3>
      </div>
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

function CategoriasPrincipalesPageContent() {
  const searchParams = useSearchParams();
  const categoriaPrincipalId = searchParams.get('categoriaPrincipalId');
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [principal, setPrincipal] = useState<CategoriaPrincipal | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener todas las categorías principales
        const principalResponse = await getCategoriasPrincipales(1, 1000, "");
        let principalesArray: CategoriaPrincipal[] = [];
        if (Array.isArray(principalResponse)) {
          principalesArray = principalResponse;
        } else if (principalResponse?.data) {
          principalesArray = principalResponse.data;
        }

        // Obtener todas las categorías
        const catResponse = await getCategorias(false, 1, 1000, "");
        let categoriasArray: Categoria[] = [];
        if (Array.isArray(catResponse?.data)) {
          categoriasArray = catResponse.data;
        } else if (Array.isArray(catResponse)) {
          categoriasArray = catResponse;
        }

        // Si hay un filtro, buscar la categoría principal y filtrar categorías
        if (categoriaPrincipalId) {
          const foundPrincipal = principalesArray.find(
            (p) => String(p.id) === String(categoriaPrincipalId)
          );
          setPrincipal(foundPrincipal || null);

          // Filtrar categorías que pertenecen a esta categoría principal
          const filtered = categoriasArray.filter(
            (c) => String(c.categoriaPrincipalId) === String(categoriaPrincipalId)
          );
          setCategories(filtered);

          console.log('[CategoriasPrincipales Page] Categoría Principal:', foundPrincipal?.nombre);
          console.log('[CategoriasPrincipales Page] Categorías encontradas:', filtered.length, filtered.map(c => c.nombre));
        } else {
          setCategories(categoriasArray);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoriaPrincipalId]);

  // Mapear categorías a formato de display
  const displayedCategories: CategoryCardDisplayProps[] = categories
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map((cat) => ({
      id: cat.id,
      nombre: cat.nombre,
      imageSrc: mapCategoryToImage(cat.nombre, cat.id),
      href: `/users/subcategorias?categoriaId=${cat.id}`,
    }));

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Título principal */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              {principal ? principal.nombre : "Categorías"}
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Explora todas las categorías disponibles en esta sección.
            </p>
          </div>

          {/* Buscador */}
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
                Cargando categorías...
              </div>
            ) : (
              <>
                {displayedCategories.length > 0 ? (
                  <>
                    {/* Grid de tarjetas - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                      {displayedCategories.map((cat) => (
                        <CategoryCard
                          key={cat.id}
                          id={cat.id}
                          nombre={cat.nombre}
                          imageSrc={cat.imageSrc}
                          href={cat.href}
                        />
                      ))}
                    </div>

                    {/* Footer con información */}
                    <div className="mt-12 text-center">
                      <p className="text-gray-600 text-base">
                        Mostrando {displayedCategories.length} categoría(s) disponible(s).
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">
                      No hay categorías disponibles en este momento.
                    </p>
                    <Link href="/users/categorias" className="text-blue-600 hover:text-blue-700 font-medium">
                      Volver a categorías principales
                    </Link>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </PublicLayout>
  );
}

// Wrapper con Suspense para manejo de búsqueda asincrónica
export default function CategoriasPrincipalesPage() {
  return (
    <Suspense
      fallback={
        <PublicLayout>
          <div className="bg-white min-h-screen flex items-center justify-center">
            <div className="text-center text-gray-500">Cargando...</div>
          </div>
        </PublicLayout>
      }
    >
      <CategoriasPrincipalesPageContent />
    </Suspense>
  );
}

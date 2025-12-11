"use client";

import React, { useState, useEffect, Suspense } from "react";
import PublicLayout from "../../../components/layout/PublicLayout";
import ImageLinkCard from "@/components/ui/ImageLinkCard";
import { getSubcategorias, Subcategoria } from "@/components/services/subcategoriasService";
import { getCategorias, Categoria } from "@/components/services/categoriasService";
import { getCategoriasPrincipales, CategoriaPrincipal } from "@/components/services/categoriasPrincipalesService";
import { createSlug } from "@/utils/slug";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import SearchDropdown from "../../../components/common/form/SearchDropdown";

// Fallback de imágenes
const fallbackImages = [
  "/images/panel.webp",
  "/images/bateria.webp",
  "/images/controladores.webp",
  "/images/iluminacion-solar.webp",
];

const mapProductToImage = (id: number): string => {
  const index = id % fallbackImages.length;
  return fallbackImages[index];
};

const mapCategoryToImage = (nombre: string, id: number): string => {
  const slug = createSlug(nombre);

  switch (slug) {
    case "pwm":
    case "mppt":
      return "/images/controladores.webp";
    case "gel":
    case "litio":
    case "agm":
      return "/images/bateria.webp";
    case "bombillo-110-ac":
    case "reflectores-ac":
    case "panel-cuadrado-110-ac":
    case "panel-redondo-110-ac":
    case "toma-corriente":
    case "interruptor":
    case "alambre-cobre":
    case "accesorios-ac":
      return "/images/iluminacion-solar.webp";
    case "onda-pura":
    case "inversor-cargado":
    case "onda-modificada":
    case "pastillas-de-freno":
    case "discos-de-freno":
    case "guaya-de-freno":
    case "cilindro-de-freno":
    case "campana-de-freno":
    case "banda-de-freno":
    case "filtro-combustible":
    case "filtro-cabina":
    case "filtro-aire":
      return "/images/panel.webp";
    default:
      const index = id % fallbackImages.length;
      return fallbackImages[index];
  }
};

interface SubcategoryCardDisplayProps {
  id: number;
  nombre: string;
  imageSrc: string;
  href: string;
}

const SubcategoryCard: React.FC<SubcategoryCardDisplayProps> = ({
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

function SubcategoriasClientePageContent() {
  const searchParams = useSearchParams();
  const categoriaPrincipalId = searchParams.get('categoriaPrincipalId');
  const categoriaId = searchParams.get('categoriaId');
  
  const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [principal, setPrincipal] = useState<CategoriaPrincipal | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [subResponse, catResponse, principalResponse] = await Promise.all([
          getSubcategorias(1, 1000, ""),
          getCategorias(false, 1, 1000, ""),
          getCategoriasPrincipales(1, 1000, ""),
        ]);

        // Procesar subcategorías
        let subcategoriasArray: Subcategoria[] = [];
        if (Array.isArray(subResponse?.data)) {
          subcategoriasArray = subResponse.data;
        } else if (Array.isArray(subResponse)) {
          subcategoriasArray = subResponse;
        }

        // Procesar categorías
        let categoriasArray: any[] = [];
        if (Array.isArray(catResponse?.data)) {
          categoriasArray = catResponse.data;
        } else if (Array.isArray(catResponse)) {
          categoriasArray = catResponse;
        }

        // Procesar categorías principales
        let principalesArray: CategoriaPrincipal[] = [];
        if (Array.isArray(principalResponse?.data)) {
          principalesArray = principalResponse.data;
        } else if (Array.isArray(principalResponse)) {
          principalesArray = principalResponse;
        }

        console.log('[Subcategorias Page] Subcategorías cargadas:', subcategoriasArray.length);
        console.log('[Subcategorias Page] Categorías cargadas:', categoriasArray.length);
        console.log('[Subcategorias Page] Categoría ID filter:', categoriaId);
        console.log('[Subcategorias Page] Principal ID filter:', categoriaPrincipalId);

        let filteredSubs: Subcategoria[] = subcategoriasArray;

        // CASO 1: Filtrar por categoriaId específico
        if (categoriaId) {
          const categoryIdNum = Number(categoriaId);
          filteredSubs = subcategoriasArray.filter((sub: any) => {
            const subCatId = sub.categoriaId || sub.categoria_id;
            return Number(subCatId) === categoryIdNum;
          });
          
          // Obtener la categoría específica
          const foundCategoria = categoriasArray.find((c: any) => Number(c.id) === categoryIdNum);
          setCategoria(foundCategoria || null);
          
          // Si la categoría tiene una categoría principal, obtenerla
          if (foundCategoria?.categoriaPrincipalId) {
            const foundPrincipal = principalesArray.find(
              (p) => Number(p.id) === Number(foundCategoria.categoriaPrincipalId)
            );
            setPrincipal(foundPrincipal || null);
          }
          
          console.log('[Subcategorias Page] Filtradas por categoriaId:', filteredSubs.length, foundCategoria?.nombre);
        }
        // CASO 2: Filtrar por categoriaPrincipalId
        else if (categoriaPrincipalId) {
          const principalIdNum = Number(categoriaPrincipalId);
          
          // Obtener categorías que pertenecen a esta categoría principal
          const categoriasDeEstaPrincipal = categoriasArray
            .filter((cat: any) => Number(cat.categoriaPrincipalId) === principalIdNum)
            .map((cat: any) => Number(cat.id));
          
          // Filtrar subcategorías que pertenecen a estas categorías
          filteredSubs = subcategoriasArray.filter((sub: any) => {
            const subCatId = sub.categoriaId || sub.categoria_id;
            return categoriasDeEstaPrincipal.includes(Number(subCatId));
          });
          
          // Obtener la categoría principal
          const foundPrincipal = principalesArray.find(
            (p) => Number(p.id) === principalIdNum
          );
          setPrincipal(foundPrincipal || null);
          
          console.log('[Subcategorias Page] Categorías de principal:', categoriasDeEstaPrincipal);
          console.log('[Subcategorias Page] Filtradas por principal:', filteredSubs.length);
        }

        setSubcategories(filteredSubs);
      } catch (err) {
        console.error("Error al cargar subcategorías:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoriaPrincipalId, categoriaId]);

  // Mapear subcategorías a formato de display
  const displayedSubcategories: SubcategoryCardDisplayProps[] = subcategories
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map((sub) => ({
      id: sub.id,
      nombre: sub.nombre,
      // Usar imagen_url de la BD si está disponible, si no usar fallback
      imageSrc: sub.imagen_url || mapCategoryToImage(sub.nombre, sub.id),
      href: `/users/productos?subcategoriaId=${sub.id}`,
    }));

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Título principal */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              {categoria ? categoria.nombre : principal ? principal.nombre : "Subcategorías"}
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Explora todas las subcategorías disponibles.
            </p>
          </div>

          {/* Buscador */}
          <div className="mb-8 max-w-lg mx-auto">
            <SearchDropdown
              placeholder="Buscar subcategoría o producto..."
              onSearchSubmit={(v: string) => router.push(`/users/productos?q=${encodeURIComponent(v)}`)}
              maxResults={8}
              debounceMs={250}
            />
          </div>

          {/* Catálogo */}
          <main id="catalog" className="mt-5">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Cargando subcategorías...
              </div>
            ) : (
              <>
                {displayedSubcategories.length > 0 ? (
                  <>
                    {/* Grid de tarjetas - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayedSubcategories.map((sub) => (
                        <SubcategoryCard
                          key={sub.id}
                          id={sub.id}
                          nombre={sub.nombre}
                          imageSrc={sub.imageSrc}
                          href={sub.href}
                        />
                      ))}
                    </div>

                    {/* Footer con información */}
                    <div className="mt-12 text-center">
                      <p className="text-gray-600 text-base">
                        Mostrando {displayedSubcategories.length} subcategoría(s) disponible(s).
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">
                      No hay subcategorías disponibles en este momento.
                    </p>
                    <Link href="/users/categorias" className="text-blue-600 hover:text-blue-700 font-medium">
                      Volver a categorías
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

// Wrapper con Suspense
export default function SubcategoriasPage() {
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
      <SubcategoriasClientePageContent />
    </Suspense>
  );
}

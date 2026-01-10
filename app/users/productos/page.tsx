// /app/productos/page.tsx (PÁGINA PÚBLICA DE CATÁLOGO)

"use client";

import React, { useState, Suspense, useMemo, useEffect } from "react";
import PublicLayout from "../../../components/layout/PublicLayout";
import ProductCard from "@/components/ui/ProductCard";
import { ChevronDown, List, Grid } from "lucide-react";
import {
  useProductListLogic,
  SortOption,
} from "@/components/hooks/useProductListLogic";
import { ProductCardData } from "@/utils/ProductUtils";
import { useSearchParams } from "next/navigation";
import { getCategoriaById } from "@/components/services/categoriasService";
import { getSubcategoriaById } from "@/components/services/subcategoriasService";

// ----------------------------------------------------------------------
import { isImageUrl } from "@/utils/ProductUtils";

// 1. Imágenes aleatorias de respaldo
// ----------------------------------------------------------------------

const fallbackImages = [
  "/images/panel.webp",
  "/images/bateria.webp",
  "/images/controladores.webp",
  "/images/iluminacion-solar.webp",
];

// 👉 función para asignar una imagen aleatoria
const mapProductToImage = (id: number): string => {
  const randomIndex = id % fallbackImages.length;
  return fallbackImages[randomIndex];
};

// ----------------------------------------------------------------------
// 2. Controles de catálogo
// ----------------------------------------------------------------------

interface ControlsProps {
  count: number;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

const ProductControls: React.FC<ControlsProps> = ({
  count,
  sortOption,
  setSortOption,
  viewMode,
  setViewMode,
}) => {
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value as SortOption);
  };

  return (
    <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-8">
      <p className="text-md font-medium text-gray-600">
        Mostrando {count} productos
      </p>

      <div className="flex items-center space-x-4">
        {/* Selector de orden */}
        <div className="relative">
          <select
            className="appearance-none block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-[#2e9fdb] focus:ring-[#2e9fdb]"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="relevancia">Ordenar: Relevancia</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>

        {/* Botones de vista */}
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 border border-gray-300 rounded-l-md transition-colors ${viewMode === "grid"
                ? "bg-[#2e9fdb] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            aria-label="Vista de cuadrícula"
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 border border-gray-300 rounded-r-md transition-colors ${viewMode === "list"
                ? "bg-[#2e9fdb] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            aria-label="Vista de lista"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. Contenido principal
// ----------------------------------------------------------------------

function ProductosClientePageContent() {
  const { displayedProducts, loading, sortOption, setSortOption } =
    useProductListLogic();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const searchParams = useSearchParams();
  const categoriaId = searchParams.get("categoriaId");
  const subcategoriaId = searchParams.get("subcategoriaId");

  const [pageTitle, setPageTitle] = useState("Catálogo de Productos");
  const [pageDescription, setPageDescription] = useState(
    "Explora nuestra amplia selección de productos solares y accesorios energéticos."
  );

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        if (subcategoriaId) {
          const subcat = await getSubcategoriaById(Number(subcategoriaId));
          if (subcat) {
            setPageTitle(subcat.nombre);
            setPageDescription(
              `Explora nuestra selección de ${subcat.nombre}. Calidad y eficiencia garantizada.`
            );
            return;
          }
        }

        if (categoriaId) {
          const cat = await getCategoriaById(Number(categoriaId));
          if (cat) {
            setPageTitle(cat.nombre);
            setPageDescription(`Descubre los mejores productos en la categoría ${cat.nombre}.`);
            return;
          }
        }

        // Default
        setPageTitle("Catálogo de Productos");
        setPageDescription(
          "Explora nuestra amplia selección de productos solares y accesorios energéticos."
        );

      } catch (error) {
        console.error("Error fetching header data", error);
        // Fallback to default on error
        setPageTitle("Catálogo de Productos");
        setPageDescription(
          "Explora nuestra amplia selección de productos solares y accesorios energéticos."
        );
      }
    };

    fetchHeaderData();
  }, [categoriaId, subcategoriaId]);

  // Asignar imagen aleatoria a cada producto
  const displayedProductsWithImages = useMemo(
    () =>
      displayedProducts.map((product: ProductCardData) => ({
        ...product,
        // imageSrc ya viene del hook useProductListLogic con la primera imagen del array
      })),
    [displayedProducts]
  );

  const listClassName =
    viewMode === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      : "space-y-6";

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Encabezado */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              {pageTitle}
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {pageDescription}
            </p>
          </div>

          {/* Controles */}
          <ProductControls
            count={displayedProductsWithImages.length}
            sortOption={sortOption}
            setSortOption={setSortOption}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Catálogo */}
          <main id="catalog" className="mt-5">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Cargando catálogo...
              </div>
            ) : displayedProductsWithImages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No se encontraron productos con estos filtros.
              </div>
            ) : (
              <div className={listClassName}>
                {displayedProductsWithImages.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    nombre={product.nombre}
                    displayPrice={product.displayPrice}
                    originalPrice={product.originalPrice}
                    imageSrc={product.imageSrc}
                    href={product.href}
                    viewMode={viewMode}
                    stock={product.stock}
                    categoria={product.categoria}
                    discountPercent={product.discountPercent}
                    salesCount={product.salesCount}
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
// 4. Suspense
// ----------------------------------------------------------------------

export default function ProductosClientePage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12 text-gray-500">
          Cargando catálogo...
        </div>
      }
    >
      <ProductosClientePageContent />
    </Suspense>
  );
}

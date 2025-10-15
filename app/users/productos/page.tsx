// /app/productos/page.tsx (PÁGINA PÚBLICA DE CATÁLOGO)

"use client";

import React, { useState, Suspense } from "react";
import PublicLayout from "../../../components/layout/PublicLayout";
import ProductCard from "@/components/ui/ProductCard";
import { ChevronDown, List, Grid } from "lucide-react";
import {
  useProductListLogic,
  SortOption,
} from "@/components/hooks/useProductListLogic";
import { ProductCardData } from "@/utils/ProductUtils";

// ----------------------------------------------------------------------
// 1. Componente de Controles (Separación de UI)
// ----------------------------------------------------------------------

interface ControlsProps {
  count: number;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

/**
 * Muestra la barra de controles de la lista de productos: contador, selector de orden y selector de vista.
 */
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
      {/* Contador de Productos */}
      <p className="text-md font-medium text-gray-600">
        Mostrando {count} productos
      </p>

      <div className="flex items-center space-x-4">
        {/* Selector de Orden */}
        <div className="relative">
          <select
            className="appearance-none block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-amber-500 focus:ring-amber-500"
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

        {/* Selector de Vista (Grid/List) */}
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 border border-gray-300 rounded-l-md transition-colors 
                            ${
                              viewMode === "grid"
                                ? "bg-amber-500 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
            aria-label="Vista de cuadrícula"
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 border border-gray-300 rounded-r-md transition-colors 
                            ${
                              viewMode === "list"
                                ? "bg-amber-500 text-white"
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
// 2. Componente de Contenido (Lógica y Renderizado)
// ----------------------------------------------------------------------

function ProductosClientePageContent() {
  const { displayedProducts, loading, sortOption, setSortOption } =
    useProductListLogic();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Clase CSS dinámica para el contenedor de la lista
  const listClassName =
    viewMode === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      : "space-y-6";

  return (
    <PublicLayout>
                  {/* Contenedor Principal con fondo ambar-50 */}           
      <div className="bg-amber-50">
                       
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                                                 
          {/* SECCIÓN SUPERIOR: Título y Descripción */}                   
          <div className="mb-12">
                                   
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
                                          Nuestros Productos                    
                 
            </h1>
                                   
            <p className="mt-3 text-xl text-gray-600 max-w-3xl">
                                          Explora nuestra amplia gama de
              productos solares para encontrar la solución                      
                    perfecta para tus necesidades.                        
            </p>
                               
          </div>
                                                 
          {/* --- INICIO DEL CATÁLOGO --- */}                   
          <main id="catalog" className="mt-16">
                                                               
            {/* Barra de Controles (Componente separado) */}
                                   
            <ProductControls
              count={displayedProducts.length}
              sortOption={sortOption}
              setSortOption={setSortOption}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
                                   
            {/* Contenedor de Productos: Manejo de estados de Carga/Vacío */}   
                               
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Cargando catálogo...
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No se encontraron productos con estos filtros.
              </div>
            ) : (
              <div className={listClassName}>
                                               
                {displayedProducts.map((product: ProductCardData) => (
                  <ProductCard
                    key={product.id}
                    // Pasamos todas las props necesarias desde el objeto mapeado
                    id={product.id}
                    nombre={product.nombre}
                    displayPrice={product.displayPrice}
                    imageSrc={product.imageSrc}
                    href={product.href}
                    viewMode={viewMode}
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
// 3. Componente Raíz (Manejo de Suspense de Next.js)
// ----------------------------------------------------------------------

export default function ProductosClientePage() {
  return (
    // Necesario porque useProductListLogic utiliza useSearchParams (Next.js)
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

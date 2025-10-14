// /app/productos/page.tsx (PÁGINA PÚBLICA DE CATÁLOGO)

"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import PublicLayout from '../../../components/layout/PublicLayout';
import ProductCard from '@/components/ui/ProductCard'; 
import { getProductos, Producto as ProductoType } from '@/components/services/productosService';
import { ChevronDown, List, Grid, Zap } from 'lucide-react'; 
import { createSlug } from '@/utils/slug';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// --- Tipos de Ordenamiento ---
type SortOption = 'relevancia' | 'precio-asc' | 'precio-desc';

// --- Interfaces y Utilidades ---

interface BaseProductType {
    id: number;
    nombre: string;
    precios?: { valor_unitario: string | number }[]; 
    inventario?: { stock: number }[];
}

interface ProductCardDataForGlobal extends BaseProductType {
    name: string;
    price: string;
    imageUrl: string;
    brand: string;
    rating: number;
    stock: number; 
    imageSrc: string;
    href: string;
    displayPrice: string;
    numericPrice: number; 
}

const mapProductToImage = (nombre: string): string => {
    const slug = createSlug(nombre);
    switch (true) {
        case slug.includes("panel"): return "/images/panel.webp";
        case slug.includes("bateria"): return "/images/bateria.webp";
        case slug.includes("controlador"): return "/images/controladores.webp";
        case slug.includes("inversor"): return "/images/inversor.webp";
        default: return "/images/imagen.webp";
    }
};

const formatPrice = (priceStr: string | number | undefined): string => {
    const priceNum = parseFloat(String(priceStr || 0));
    if (isNaN(priceNum) || priceNum === 0) { return "Consultar Precio"; }
    return priceNum.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    });
};

const getNumericPrice = (priceStr: string | number | undefined): number => {
    return parseFloat(String(priceStr || 0));
}

// --- Componente Principal ---


export default function ProductosClientePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Cargando catálogo...</div>}>
      <ProductosClientePageContent />
    </Suspense>
  );
}

function ProductosClientePageContent() {
    const searchParams = useSearchParams();
    const subcategoriaIdParam = searchParams.get('subcategoriaId');
    const categoriaIdParam = searchParams.get('categoriaId');

    const [productos, setProductos] = useState<BaseProductType[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [sortOption, setSortOption] = useState<SortOption>('relevancia');

    useEffect(() => {
        setLoading(true);
        const fetchProductos = async () => {
            try {
                const subId = subcategoriaIdParam ? parseInt(subcategoriaIdParam, 10) : undefined;
                const catId = categoriaIdParam ? parseInt(categoriaIdParam, 10) : undefined;
                const data = await getProductos(subId, catId);
                setProductos(data);
                setLoading(false);
            } catch (err) {
                console.error("Error al cargar productos:", err);
                setLoading(false);
            }
        };
        fetchProductos();
    }, [subcategoriaIdParam, categoriaIdParam]);

    
    // Lógica de Mapeo y Ordenamiento de Productos
    const displayedProducts = useMemo(() => {
        let mappedProducts: ProductCardDataForGlobal[] = productos.map((p) => {
            const priceValue = p.precios?.[0]?.valor_unitario;
            const numericPrice = getNumericPrice(priceValue);
            const displayPrice = formatPrice(priceValue);
            const imageSrc = mapProductToImage(p.nombre);
            
            return {
                ...p,
                name: p.nombre,
                imageSrc: imageSrc,
                href: `/producto/${p.id}`,
                displayPrice: displayPrice,
                numericPrice: numericPrice,
                brand: "DISEM SAS", // Mantener brand, rating y stock
                rating: 4.5,
                stock: p.inventario?.[0]?.stock || 0,
            } as ProductCardDataForGlobal;
        });

        let sortedProducts = mappedProducts.slice(); 

        // Aplicación de la lógica de ordenamiento
        switch (sortOption) {
            case 'precio-asc':
                sortedProducts.sort((a, b) => {
                    if (a.numericPrice === 0 && b.numericPrice !== 0) return 1;
                    if (b.numericPrice === 0 && a.numericPrice !== 0) return -1;
                    return a.numericPrice - b.numericPrice;
                });
                break;
            case 'precio-desc':
                sortedProducts.sort((a, b) => b.numericPrice - a.numericPrice);
                break;
            case 'relevancia':
            default:
                sortedProducts.sort((a, b) => a.id - b.id);
                break;
        }

        return sortedProducts;
    }, [productos, sortOption]); 

    // Manejadores de Estado
    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOption(event.target.value as SortOption);
    };
    
    const handleViewModeChange = (mode: 'grid' | 'list') => {
        setViewMode(mode);
    };

    return (
        <PublicLayout>
            {/* 🛑 Contenedor Principal con fondo ambar-50 */}
            <div className="bg-amber-50"> 
                {/* Contenedor de ancho máximo */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                    
                    {/* SECCIÓN SUPERIOR: Título y Descripción */}
                    <div className="mb-12">
                        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
                            Nuestros Productos
                        </h1>
                        <p className="mt-3 text-xl text-gray-600 max-w-3xl">
                            Explora nuestra amplia gama de productos solares para encontrar la solución
                            perfecta para tus necesidades.
                        </p>
                    </div>

                    
                    {/* --- INICIO DEL CATÁLOGO --- */}
                    <main id="catalog" className="mt-16">
                            
                        {/* Barra de Controles: Contador, Ordenar y Vista */}
                        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-8">
                            
                            {/* Contador de Productos */}
                            <p className="text-md font-medium text-gray-600">
                                Mostrando {displayedProducts.length} productos
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
                                        onClick={() => handleViewModeChange('grid')}
                                        className={`p-2 border border-gray-300 rounded-l-md transition-colors 
                                            ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`
                                        }
                                        aria-label="Vista de cuadrícula"
                                    >
                                        <Grid className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleViewModeChange('list')}
                                        className={`p-2 border border-gray-300 rounded-r-md transition-colors 
                                            ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`
                                        }
                                        aria-label="Vista de lista"
                                    >
                                        <List className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* Contenedor de Productos (ProductList) */}
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Cargando catálogo...</div>
                        ) : displayedProducts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No se encontraron productos con estos filtros.</div>
                        ) : (
                            <div
                                className={
                                    viewMode === 'grid' 
                                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                    : "space-y-6"
                                }
                            >
                                {displayedProducts.map((product) => (
                                    <ProductCard 
                                        key={product.id} 
                                        id={product.id} 
                                        nombre={product.nombre} 
                                        displayPrice={product.displayPrice} 
                                        imageSrc={product.imageSrc} 
                                        href={product.href} 
                                        viewMode={viewMode}   // 👈 aquí

                                        // Si el ProductCard soporta el modo de vista, descomentar:
                                        // viewMode={viewMode}
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                    {/* 🛑 FINAL DEL CONTENEDOR DE ANCHO MÁXIMO (Cerrando el div de max-w-7xl) */}
                </div>
                {/* 🛑 FINAL DEL CONTENEDOR DE FONDO AMBAR (Cerrando el div de bg-amber-50) */}
            </div>
        </PublicLayout>
    );
}
// /app/productos/page.tsx (PÁGINA PÚBLICA DE CATÁLOGO)

"use client";

import React, { useState, useEffect } from 'react';
import PublicLayout from '../../../components/layout/PublicLayout';
import FilterPanel from '@/components/ui/FilterPanel'; // 🛑 Importamos el nuevo panel de filtros
import ProductCard from '@/components/ui/ProductCard'; // Importamos la tarjeta
import { getProductos, Producto as ProductoType } from '@/components/services/productosService';
import { ChevronDown, List, Grid } from 'lucide-react'; // Iconos para el selector de vista
import { createSlug } from '@/utils/slug'; // Utilidad para la imagen

// --- Utilidades de Mapeo y Formato (copiadas de FeaturedProductsSection.tsx) ---

// Definimos la estructura básica del producto con los campos de la API que usas
interface BaseProductType {
    id: number;
    nombre: string;
    // Otros campos que vengan de la API...
    precios?: { valor_unitario: string | number }[]; // Array opcional de precios
    // Inventario si lo necesitas...
    inventario?: { stock: number }[];
}

// Interfaz para el objeto que ProductCard realmente espera (adaptado al catálogo)
interface ProductCardDataForGlobal extends BaseProductType {
    name: string;
    price: string;
    imageUrl: string;
    brand: string;
    rating: number;
    stock: number; 
    // Campos extra para la vista de Card/Lista
    imageSrc: string;
    href: string;
    displayPrice: string;
}

const mapProductToImage = (nombre: string): string => {
    const slug = createSlug(nombre);
    // Lógica de mapeo de imágenes basada en el slug (misma que en FeaturedProductsSection)
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

// --- Componente Principal ---

export default function ProductosClientePage() {
    const [productos, setProductos] = useState<BaseProductType[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Estado para alternar entre Grid y Lista

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const data = await getProductos();
                setProductos(data);
                setLoading(false);
            } catch (err) {
                console.error("Error al cargar productos:", err);
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    // 🛑 Mapeo de productos para que coincida con la estructura de ProductCard.tsx
    const displayedProducts: ProductCardDataForGlobal[] = productos.map((p) => {
        const priceValue = p.precios?.[0]?.valor_unitario;
        const displayPrice = formatPrice(priceValue);
        const imageSrc = mapProductToImage(p.nombre);
        
        return {
            ...p,
            // Datos requeridos por el componente ProductCard
            name: p.nombre,              // nombre -> name
            price: displayPrice,         // displayPrice -> price
            imageUrl: imageSrc,          // imageSrc -> imageUrl
            brand: "DISEM SAS",          // Placeholder
            rating: 4.5,                 // Placeholder
            stock: p.inventario?.[0]?.stock || 0, // Usar stock del inventario
            // Campos originales de tu lógica de mapeo
            imageSrc: imageSrc,
            href: `/producto/${p.id}`,
            displayPrice: displayPrice,
        } as ProductCardDataForGlobal;
    });

    return (
        <PublicLayout>
            <div className="bg-amber-50"> {/* Fondo ligeramente beige para toda la página de catálogo */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                    
                    {/* Sección Superior: Título y Descripción */}
                    <div className="mb-12">
                        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
                            Nuestros Productos
                        </h1>
                        <p className="mt-3 text-xl text-gray-600 max-w-3xl">
                            Explora nuestra amplia gama de productos solares para encontrar la solución
                            perfecta para tus necesidades.
                        </p>
                    </div>

                    {/* Contenido Principal: Filtros y Listado */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        
                        {/* Columna Izquierda: Filtros (1/4 del ancho) */}
                        <div className="lg:col-span-1">
                            {/* El componente FilterPanel tiene un sticky top-4 */}
                            <FilterPanel /> 
                        </div>

                        {/* Columna Derecha: Listado de Productos (3/4 del ancho) */}
                        <div className="lg:col-span-3">
                            
                            {/* Barra de Controles (Contador, Ordenar, Vista) */}
                            <div className="flex justify-between items-center mb-6 py-2 border-b border-gray-200">
                                {/* Contador */}
                                <p className="text-sm text-gray-600 font-medium">
                                    Mostrando **{displayedProducts.length}** productos
                                    {/* Puedes añadir la categoría activa aquí si implementas un contexto */}
                                    {/* {activeCategory && ` en ${activeCategory}`} */}
                                </p>
                                
                                {/* Ordenar y Vista */}
                                <div className="flex items-center space-x-4">
                                    {/* Selector de Orden */}
                                    <div className="relative inline-flex items-center">
                                        <span className="text-sm font-medium text-gray-700 mr-2 hidden sm:inline">Ordenar:</span>
                                        <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                            Precio: Menor a Mayor 
                                            <ChevronDown className="ml-1.5 h-4 w-4" />
                                        </button>
                                    </div>
                                    
                                    {/* Selector de Vista (Grid/List) */}
                                    <div className="flex space-x-1">
                                        <button 
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                                            aria-label="Vista de Lista"
                                        >
                                            <List className="h-5 w-5" />
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                                            aria-label="Vista de Cuadrícula"
                                        >
                                            <Grid className="h-5 w-5" />
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
                                    className={viewMode === 'grid' 
                                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" 
                                        : "space-y-4" // Si es lista, usamos espacio vertical
                                    }
                                >
                                                                        {displayedProducts.map((product) => (
                                                                            <ProductCard 
                                                                                key={product.id}
                                                                                {...product}
                                                                            />
                                                                        ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
// /components/ui/HeaderProductsDropdown.tsx

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Importamos getSubcategorias (que trae la relación padre)
import { getSubcategorias, Subcategoria } from '../services/subcategoriasService'; 

// --- INTERFACES para la estructura del filtro ---
interface FilterCategory {
    id: number;
    nombre: string;
    subcategorias?: FilterCategory[]; 
}

const HeaderProductsDropdown: React.FC = () => {
    const [groupedCategories, setGroupedCategories] = useState<FilterCategory[]>([]); 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // 🛑 ESTADO CLAVE: Rastrea la ID de la Categoría que tiene el mouse encima (hover)
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

    const pathname = usePathname();

    // 1. Lógica de Carga y Agrupación (Categoría <- Subcategoría)
    useEffect(() => {
        const fetchAndGroup = async () => {
            try {
                const apiSubcategorias: Subcategoria[] = await getSubcategorias(); 
                const categoryMap = new Map<number, FilterCategory>();
                
                apiSubcategorias.forEach(subCat => {
                    const parent = subCat.categoria;
                    
                    if (!subCat.estado || subCat.estado.nombre !== 'Activo') return;

                    const childCategory: FilterCategory = {
                        id: subCat.id,
                        nombre: subCat.nombre,
                    };

                    if (!categoryMap.has(parent.id)) {
                        const parentCategory: FilterCategory = {
                            id: parent.id,
                            nombre: parent.nombre,
                            subcategorias: [],
                        };
                        categoryMap.set(parent.id, parentCategory);
                    }
                    
                    categoryMap.get(parent.id)?.subcategorias?.push(childCategory);
                });

                const categories = Array.from(categoryMap.values());
                setGroupedCategories(categories);
                // 🛑 OPCIONAL: Establece la primera categoría como activa por defecto al cargar
                if (categories.length > 0) {
                    setActiveCategoryId(categories[0].id);
                }

            } catch (error) {
                console.error("❌ Error al cargar y agrupar categorías en el menú:", error);
            }
        };
        fetchAndGroup();
    }, []);
    
    // Encuentra la categoría activa y sus subcategorías para mostrarlas en la segunda columna
    const activeCategory = useMemo(() => {
        return groupedCategories.find(c => c.id === activeCategoryId);
    }, [groupedCategories, activeCategoryId]);

    const isProductsActive = pathname.startsWith('/productos');
    const handleMouseEnter = () => setIsMenuOpen(true);
    const handleMouseLeave = () => {
        setIsMenuOpen(false);
        // Opcional: limpiar el activeCategoryId al cerrar el menú
        // setActiveCategoryId(null); 
    };

    const baseLinkClasses = `inline-flex items-center h-full px-1 border-b-2 transition duration-150 text-sm font-medium`;

    return (
        <div
            className="relative h-full flex items-center" 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Enlace principal "Productos" */}
            <Link
                href="/productos"
                className={`${baseLinkClasses} 
                    ${isProductsActive ? 'border-amber-500 text-amber-700' : 'border-transparent text-gray-500'} 
                    hover:border-amber-300 hover:text-amber-700
                `}
            >
                Productos 
                {/* Icono de flecha */}
                <svg className={`ml-1 -mr-0.5 h-4 w-4 transform ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </Link>

            {/* 🛑 Menú Desplegable con estructura de 2 columnas (Categoría | Subcategoría) */}
            {isMenuOpen && groupedCategories.length > 0 && (
                <div 
                    // Contenedor principal del desplegable
                    className="absolute z-50 top-full left-0 mt-0 min-w-[500px] max-w-4xl origin-top-left rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none flex p-0"
                >
                    
                    {/* COLUMNA 1: Lista de Categorías (Navegación Vertical) */}
                    <div className="w-2/5 p-2 border-r border-gray-100 space-y-1">
                        {groupedCategories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/productos?categoriaId=${category.id}`} 
                                onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer click
                                onMouseEnter={() => setActiveCategoryId(category.id)} // 🛑 CLAVE: Muestra las subcategorías
                                
                                // Estilo de Categoría (Naranja bonito)
                                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors 
                                    ${activeCategoryId === category.id 
                                        ? 'bg-amber-500 text-white font-bold' 
                                        : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                                    }
                                `}
                            >
                                {category.nombre}
                            </Link>
                        ))}
                    </div>

                    {/* COLUMNA 2: Lista de Subcategorías (Contenido Dinámico) */}
                    <div className="w-3/5 p-4">
                        <h4 className="text-base font-extrabold text-gray-800 mb-3 border-b border-gray-100 pb-2">
                            {activeCategory?.nombre || 'Selecciona una Categoría'}
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {activeCategory?.subcategorias?.map((subCat) => (
                                <Link
                                    key={subCat.id}
                                    href={`/productos?subcategoriaId=${subCat.id}`} 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block text-sm text-gray-600 hover:text-amber-700 transition-colors"
                                >
                                    {subCat.nombre}
                                </Link>
                            ))}
                        </div>

                        {/* Mensaje si no hay subcategorías o si la lista está vacía */}
                        {(!activeCategory || (activeCategory.subcategorias?.length === 0)) && (
                            <p className="text-sm text-gray-500 italic mt-4">
                                No hay subcategorías disponibles.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeaderProductsDropdown;
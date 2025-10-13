// /components/ui/FilterPanel.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronRight, ChevronDown } from 'lucide-react';
import InputField from './InputField'; 
import { Search as SearchIcon } from 'lucide-react';

// Importamos Subcategoria, que debe tener la relación 'categoria'
import { getSubcategorias, Subcategoria } from '../services/subcategoriasService'; 
// Asegúrate de que tu interfaz Subcategoria en subcategoriasService.ts incluye:
// categoria: { id: number, nombre: string, ... }


// --- Función Auxiliar ---
const createSlug = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};


// --- Definición de la Categoría para el Filtro (Estructura Anidada) ---
interface FilterCategory {
    id: number | 'all'; 
    nombre: string;
    slug: string;
    categoriaId?: number; 
    subcategorias?: FilterCategory[]; 
}


/**
 * Panel lateral de filtros con buscador y lista de categorías.
 */
const FilterPanel: React.FC = () => {
    // ... (Estados sin cambios)
    const [categories, setCategories] = useState<FilterCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [openCategory, setOpenCategory] = useState<string>('all'); 


    // Manejadores sin cambios
    const handleCategoryClick = (slug: string) => { 
        setActiveCategory(slug);
        // Aquí podrías notificar al componente padre para que filtre los productos
    };
    
    const toggleOpenCategory = (slug: string) => {
        setOpenCategory(prev => (prev === slug ? 'all' : slug));
    };


    // --- Lógica de Fetch y Agrupación (SOLUCIÓN FINAL) ---
    useEffect(() => {
        const fetchAndGroupCategories = async () => {
            try {
                setIsLoading(true);
                
                // 1. Hacemos una SOLA llamada a subcategorías
                const apiSubcategorias: Subcategoria[] = await getSubcategorias(); 

                console.log("DIAGNÓSTICO: Subcategorías recibidas para agrupar:", apiSubcategorias.length);

                // 2. Agrupamos las subcategorías por su categoría padre (subCat.categoria.id)
                const categoryMap = new Map<number, FilterCategory>();
                
                // Iteramos sobre las subcategorías (asumimos que tu endpoint ya solo devuelve las 'Activas')
                apiSubcategorias.forEach(subCat => {
                    // La relación padre viene anidada en 'categoria'
                    const parent = subCat.categoria;
                    
                    // Solo procedemos si el padre es válido (para evitar errores)
                    if (!parent || !parent.id || !parent.nombre) {
                        return;
                    }
                    
                    const subCatSlug = createSlug(subCat.nombre);
                    
                    // Mapeo del objeto Subcategoría (el hijo)
                    const childCategory: FilterCategory = {
                        id: subCat.id,
                        nombre: subCat.nombre,
                        slug: subCatSlug,
                        categoriaId: parent.id, // Referencia al padre
                    };

                    // Si la categoría padre aún no está en el mapa, la creamos
                    if (!categoryMap.has(parent.id)) {
                        const parentSlug = createSlug(parent.nombre);
                        const parentCategory: FilterCategory = {
                            id: parent.id,
                            nombre: parent.nombre,
                            slug: parentSlug,
                            subcategorias: [],
                        };
                        categoryMap.set(parent.id, parentCategory);
                    }
                    
                    // Añadimos la subcategoría al array 'subcategorias' del padre
                    categoryMap.get(parent.id)?.subcategorias?.push(childCategory);
                });

                // 3. Convertimos el mapa a un array de categorías principales
                const topLevelCategories: FilterCategory[] = Array.from(categoryMap.values());
                
                // 🛑 DIAGNÓSTICO FINAL: Mostrar cuántos grupos se formaron
                console.log("DIAGNÓSTICO FINAL: Categorías principales (Agrupadas):", topLevelCategories.length);
                
                // 4. Añadir "Todas" y establecer el estado
                const finalCategories: FilterCategory[] = [
                    { id: 'all', nombre: 'Todas las categorías', slug: 'all' },
                    ...topLevelCategories
                ];

                setCategories(finalCategories);
                setIsLoading(false);
                
            } catch (error) {
                console.error("Error al agrupar categorías y subcategorías:", error);
                setCategories([{ id: 'all', nombre: 'Todas las categorías', slug: 'all' }]);
                setIsLoading(false);
            }
        };

        fetchAndGroupCategories();
    }, []); 
    
    // --- Componente Reutilizable: Botón de Categoría (CategoryButton) ---
    const CategoryButton: React.FC<{ category: FilterCategory, isSubCategory?: boolean }> = useCallback(({ category, isSubCategory = false }) => {
        const hasSubcategories = category.subcategorias && category.subcategorias.length > 0;
        const isActive = activeCategory === category.slug;
        const isOpen = openCategory === category.slug;

        return (
            <div key={category.id}>
                <div className="flex items-center">
                    {/* Botón Principal */}
                    <button
                        onClick={() => handleCategoryClick(category.slug)}
                        className={`w-full text-left py-2 px-3 rounded-lg text-sm transition duration-150 flex-grow 
                            ${isSubCategory ? 'pl-8' : ''}
                            ${isActive 
                                ? 'bg-amber-600 text-white font-bold shadow-md' 
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {category.nombre}
                    </button>

                    {/* 🛑 ICONO DE DESPLIEGUE: Se muestra si hay subcategorías */}
                    {hasSubcategories && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); 
                                toggleOpenCategory(category.slug);
                            }}
                            className={`p-2 rounded-lg transition ml-1 ${isActive ? 'text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                            aria-expanded={isOpen}
                            aria-label={`Desplegar subcategorías de ${category.nombre}`}
                        >
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {/* 🛑 SUBCATEGORÍAS DESPLEGABLES: Se muestran si hay subcategorías Y el panel está abierto */}
                {hasSubcategories && isOpen && (
                    <div className="pl-2 pt-1 border-l border-gray-200 ml-3 space-y-1">
                        {category.subcategorias!.map(subCat => (
                            <CategoryButton 
                                key={subCat.id} 
                                category={subCat} 
                                isSubCategory={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }, [activeCategory, openCategory, handleCategoryClick, toggleOpenCategory]);

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 sticky top-4">
            {/* ... (Buscador) ... */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Categorías</h4>
                <div className="space-y-1">
                    {isLoading ? (
                        <p className="text-sm text-gray-500">Cargando categorías...</p>
                    ) : (
                        categories.map((category) => (
                            <CategoryButton 
                                key={category.id} 
                                category={category} 
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
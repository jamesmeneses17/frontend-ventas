// /components/ui/FilterPanel.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import InputField from './InputField'; 
import { Search as SearchIcon } from 'lucide-react';

// 🛑 IMPORTAMOS el servicio y la interfaz de categoría
import { getCategorias, Categoria } from '../services/categoriasService'; 


// --- Definición de la Categoría para el Filtro ---
// Usaremos la interfaz Categoria del servicio. 
// Además, incluiremos una categoría "Todas" manualmente al inicio.
interface FilterCategory {
    id: number | 'all'; // 'all' para la opción "Todas las categorías"
    nombre: string;
    slug: string; // Necesitamos un slug o identificador para el filtro
}

/**
 * Función auxiliar para convertir el nombre de la categoría en un slug (identificador).
 * Ejemplo: "Paneles Solares" -> "paneles-solares"
 */
const createSlug = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};


/**
 * Panel lateral de filtros con buscador y lista de categorías.
 */
const FilterPanel: React.FC = () => {
    // 🛑 Reemplazamos MOCK_CATEGORIES con un estado para las categorías reales
    const [categories, setCategories] = useState<FilterCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all'); // Inicia en 'all'
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // 🛑 1. Hook para cargar las categorías de la API al montar el componente
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // 🛑 Llamamos al servicio para obtener categorías activas
                const apiCategories: Categoria[] = await getCategorias();
                
                // 🛑 Mapeamos las categorías de la API a nuestro formato de filtro
                const mappedCategories: FilterCategory[] = apiCategories
                    // Filtramos las categorías activas si es necesario (asumiendo que el endpoint ya lo hace)
                    .filter(cat => cat.estado.nombre === 'Activo') 
                    .map(cat => ({
                        id: cat.id,
                        nombre: cat.nombre,
                        slug: createSlug(cat.nombre), // Generamos un slug para usar en el filtro
                    }));
                
                // 🛑 Añadimos la opción 'Todas las categorías' al inicio
                const allCategories: FilterCategory[] = [
                    { id: 'all', nombre: 'Todas las categorías', slug: 'all' },
                    ...mappedCategories
                ];

                setCategories(allCategories);
                setIsLoading(false);
                
            } catch (error) {
                console.error("Error al cargar categorías:", error);
                // En caso de error, podríamos dejar solo la opción 'Todas'
                setCategories([{ id: 'all', nombre: 'Todas las categorías', slug: 'all' }]);
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []); // El array vacío asegura que se ejecute solo una vez al inicio

    const handleCategoryClick = (slug: string) => {
        setActiveCategory(slug);
        console.log(`Filtro aplicado: ${slug}`);
        // ⚠️ Nota: Aquí es donde enviarías el 'slug' (o el 'id' de la categoría)
        // al componente padre o a un hook de estado global para filtrar los productos.
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 sticky top-4">
            
            {/* Título de Filtros (sin cambios) */}
            <div className="flex items-center text-gray-800 mb-6 border-b border-gray-200 pb-4">
                <SlidersHorizontal className="w-5 h-5 mr-2 text-amber-600" />
                <h3 className="text-lg font-semibold">Filtros</h3>
            </div>

            {/* Buscador (sin cambios) */}
            <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Buscar</h4>
                <InputField 
                    id="search-products"
                    label="Buscar productos..." 
                    className="sr-only" 
                    icon={SearchIcon} 
                    name="search-products"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Lista de Categorías */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Categorías</h4>
                <div className="space-y-2">
                    {/* 🛑 Indicador de carga */}
                    {isLoading ? (
                        <p className="text-sm text-gray-500">Cargando categorías...</p>
                    ) : (
                        // 🛑 Mapeamos las categorías del estado
                        categories.map((category) => (
                            <button
                                key={category.id} // Usamos el ID de la categoría (o 'all')
                                onClick={() => handleCategoryClick(category.slug)}
                                className={`w-full text-left py-2 px-3 rounded-lg text-sm transition duration-150 
                                    ${activeCategory === category.slug 
                                        ? 'bg-amber-600 text-white font-bold shadow-md' 
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {category.nombre}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
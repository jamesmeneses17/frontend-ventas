// /components/ui/FilterPanel.tsx

"use client";

import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
// 🛑 IMPORTAMOS EL COMPONENTE InputField y la interfaz Icon que necesita
import InputField from './InputField'; 
import { Search as SearchIcon } from 'lucide-react'; // Renombramos Search de lucide como SearchIcon

// --- Mock Data para Categorías ---
const MOCK_CATEGORIES = [
    { name: 'Todas las categorías', slug: 'all' },
    { name: 'Paneles Solares', slug: 'paneles-solares' },
    { name: 'Baterías Solares', slug: 'baterias-solares' },
    { name: 'Controladores De Carga', slug: 'controladores' },
    { name: 'Inversores Solares', slug: 'inversores' },
    { name: 'Kits y Accesorios', slug: 'kits-accesorios' },
];

/**
 * Panel lateral de filtros con buscador y lista de categorías.
 */
const FilterPanel: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('paneles-solares'); 
    const [searchTerm, setSearchTerm] = useState('');

    const handleCategoryClick = (slug: string) => {
        setActiveCategory(slug);
        console.log(`Filtro aplicado: ${slug}`);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 sticky top-4">
            
            {/* Título de Filtros */}
            <div className="flex items-center text-gray-800 mb-6 border-b border-gray-200 pb-4">
                <SlidersHorizontal className="w-5 h-5 mr-2 text-amber-600" />
                <h3 className="text-lg font-semibold">Filtros</h3>
            </div>

            {/* Buscador */}
            <div className="mb-8">
                {/* 🛑 Cambiamos el título a una etiqueta más discreta */}
                <h4 className="text-sm font-medium text-gray-700 mb-2">Buscar</h4>
                
                {/* 🛑 Eliminamos el div 'relative' y el icono manual. */}
                {/* 🛑 Usamos el InputField con la prop 'icon' y pasamos un 'label' oculto. */}
                <InputField 
                    id="search-products"
                    // 🛑 PASAMOS LA ETIQUETA REQUERIDA PERO LA OCULTAMOS CON CLASES
                    label="Buscar productos..." 
                    className="sr-only" // Ocultamos la etiqueta visualmente
                    
                    // 🛑 Pasamos el icono de búsqueda como prop 'icon'
                    icon={SearchIcon} 
                    
                    // Props del input
                    name="search-products"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    // 🛑 Aseguramos que el input tenga el padding correcto (pl-10) para el icono
                    // La lógica del `InputField` ya maneja el padding, así que no necesitamos `className="pl-10"` aquí.
                />
            </div>

            {/* Lista de Categorías */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Categorías</h4>
                <div className="space-y-2">
                    {MOCK_CATEGORIES.map((category) => (
                        <button
                            key={category.slug}
                            onClick={() => handleCategoryClick(category.slug)}
                            className={`w-full text-left py-2 px-3 rounded-lg text-sm transition duration-150 
                                ${activeCategory === category.slug 
                                    ? 'bg-amber-600 text-white font-bold shadow-md' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
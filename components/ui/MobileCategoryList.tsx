// /components/ui/MobileCategoryList.tsx

"use client";
import React from 'react';
import Link from 'next/link';
// 🚨 ELIMINAR: Importación del servicio (si existía)
// 🚨 AGREGAR: Importar el hook del Contexto Global
// Update the import path below to the actual location of CategoriesContext in your project
import { useCategories } from '../../contexts/CategoriesContext';

interface MobileCategoryListProps {
    onNavigate: () => void;
}

const MobileCategoryList: React.FC<MobileCategoryListProps> = ({ onNavigate }) => {
    // 🚨 CONSUMIR CATEGORÍAS DEL CONTEXTO
    const { categorias, isLoading } = useCategories(); 
    // 🚨 ELIMINAR EL useEffect Y EL useState DE CATEGORÍAS DE AQUÍ

    if (isLoading) {
        return <div className="p-3 text-sm text-gray-500">Cargando categorías...</div>;
    }

    if (categorias.length === 0) {
        return <div className="p-3 text-sm text-gray-500">No hay categorías.</div>;
    }
    
    return (
        <div className="py-1 space-y-1 pl-4 border-l border-gray-200 ml-3">
            {/* Enlace para ver todos los productos sin filtro */}
            <Link
                href="/productos"
                onClick={onNavigate}
                className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
                Ver todos los productos
            </Link>
            
            {/* Mapear las categorías del contexto */}
            {categorias.map((categoria) => (
                <Link
                    key={categoria.id}
                    href={`/productos?categoriaId=${categoria.id}`}
                    onClick={onNavigate}
                    className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                    {categoria.nombre}
                </Link>
            ))}
        </div>
    );
};

export default MobileCategoryList;
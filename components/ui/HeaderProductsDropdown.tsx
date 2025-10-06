// /components/ui/HeaderProductsDropdown.tsx

"use client";

// 🚨 ELIMINAR: useState y useEffect ya no son necesarios para cargar la data
import React, { useState } from 'react'; 
import Link from 'next/link';
// 🚨 ELIMINAR: Ya no necesitamos el servicio aquí, lo carga el Contexto
// import { getCategorias, Categoria } from '../services/categoriasService'; 
import { usePathname } from 'next/navigation';
// 🚨 AGREGAR: Importar el hook del Contexto Global
// Ajusta la ruta según la ubicación real del archivo CategoriesContext
import { useCategories } from '../../contexts/CategoriesContext';

const HeaderProductsDropdown: React.FC = () => {
    // 🚨 ELIMINAR: const [categorias, setCategorias] = useState<Categoria[]>([]);

    // 1. Usar el hook del Contexto para obtener la data y el estado de carga
    const { categorias, isLoading } = useCategories(); 

    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // 🚨 ELIMINAR: Todo el bloque useEffect, ya que la carga es en el layout

    // Determina si estamos en la ruta /productos o cualquier subruta.
    const isProductsActive = pathname.startsWith('/productos');

    // Lógica de Hover (Desktop)
    const handleMouseEnter = () => setIsOpen(true);
    const handleMouseLeave = () => setIsOpen(false);

    // Clase base para el enlace principal
    const baseLinkClasses = `inline-flex items-center h-full px-1 border-b-2 transition duration-150 text-sm font-medium`;

    // ** Manejo del estado de carga **
    if (isLoading) {
        // Muestra un estado mientras se cargan las categorías (esto solo pasa la primera vez)
        return (
            <div className="h-full flex items-center">
                <span className="text-gray-500 text-sm">Cargando...</span>
            </div>
        );
    }
    
    // Si no hay categorías que mostrar, podemos ocultar o mostrar un mensaje simple.
    // Si bien el menú desplegable no se mostrará si categorias.length es 0, el link principal sí.
    
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
                <svg className={`ml-1 -mr-0.5 h-4 w-4 transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
            </Link>

            {/* Menú Desplegable (usa la data del contexto) */}
            {/* Solo se abre si está abierto Y hay categorías cargadas */}
            {isOpen && categorias.length > 0 && ( 
                <div 
                    className="absolute z-50 top-full left-0 mt-0 w-max origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2"
                >
                    <div className="py-1 grid grid-cols-1 gap-y-1">
                        {/* 🚨 Mapeamos las categorías del Contexto */}
                        {categorias.map((categoria) => ( 
                            <Link
                                key={categoria.id}
                                href={`/productos?categoriaId=${categoria.id}`} 
                                onClick={() => setIsOpen(false)} 
                                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md whitespace-nowrap"
                            >
                                {categoria.nombre}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeaderProductsDropdown;
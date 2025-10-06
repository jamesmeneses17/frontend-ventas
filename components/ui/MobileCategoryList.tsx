// /components/ui/MobileCategoryList.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Asegúrate de que esta ruta sea correcta:
import { getCategorias, Categoria } from '../services/categoriasService'; 

interface MobileCategoryListProps {
    // Función para cerrar el menú principal al navegar a un enlace
    onNavigate: () => void; 
}

const MobileCategoryList: React.FC<MobileCategoryListProps> = ({ onNavigate }) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await getCategorias();
                // Usamos todos los datos ya que el campo 'estado' no está en tu API (image_4ad7e3.jpg)
                setCategorias(data); 
            } catch (error) {
                console.error("Error al cargar categorías en el menú móvil:", error);
                setCategorias([]); // En caso de error, mostramos lista vacía
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategorias();
    }, []);

    // Muestra un loader si es necesario
    if (isLoading) {
        return <div className="p-3 text-sm text-gray-500">Cargando categorías...</div>;
    }

    return (
        <div className="pl-4 mt-1 space-y-1 border-l border-gray-200">
            {/* Mapeo de categorías */}
            {categorias.map((categoria) => (
                <Link
                    key={categoria.id}
                    // Enlaza a la página de productos, filtrada por ID de categoría
                    href={`/productos?categoriaId=${categoria.id}`} 
                    onClick={onNavigate} // Cierra el menú principal
                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md whitespace-nowrap"
                >
                    - {categoria.nombre}
                </Link>
            ))}
        </div>
    );
};

export default MobileCategoryList;
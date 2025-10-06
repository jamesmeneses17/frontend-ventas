// /components/ui/HeaderProductsDropdown.tsx

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Asumo que tu servicio está en esta ruta. ¡Verifica la ruta!
import { getCategorias, Categoria } from '../services/categoriasService'; 
import { usePathname } from 'next/navigation';

const HeaderProductsDropdown: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 1. Cargar las categorías (solo una vez al montar)
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await getCategorias();
        
        // 🛑 CAMBIO CLAVE 1: Deshabilitamos el filtro temporalmente.
        // Las categorías en tu backend (captura: image_4ad7e3.jpg) no incluyen 
        // el campo 'estado'. Si lo incluyes en el futuro, vuelve a la línea comentada.
        // setCategorias(data.filter(c => c.estado === "Activo")); // ❌ Comentado
        setCategorias(data); // ✅ Usamos todos los datos recibidos

      } catch (error) {
        console.error("❌ Error al cargar categorías en el menú:", error);
      }
    };
    fetchCategorias();
  }, []);

  // Determina si estamos en la ruta /productos o cualquier subruta.
  const isProductsActive = pathname.startsWith('/productos');

  // Lógica de Hover (Desktop)
  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  // Clase base para el enlace principal para asegurar la alineación con los demás enlaces.
  const baseLinkClasses = `inline-flex items-center h-full px-1 border-b-2 transition duration-150 text-sm font-medium`;

  return (
    // Contenedor principal para el hover y el posicionamiento relativo
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

      {/* Menú Desplegable (se muestra con hover) */}
      {isOpen && categorias.length > 0 && (
        <div 
          // top-full lo coloca justo debajo de la barra de navegación
          // w-max asegura que se ajuste al ancho del texto más largo
          className="absolute z-50 top-full left-0 mt-0 w-max origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2"
        >
          {/* 💥 CAMBIO CLAVE 2: Aseguramos que sea una lista VERTICAL con grid-cols-1 */}
          <div className="py-1 grid grid-cols-1 gap-y-1">
            {categorias.map((categoria) => (
              <Link
                key={categoria.id}
                // Enlaza a la página de productos, filtrada por ID de categoría
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
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Importamos getCategorias
import { getCategorias, Categoria } from "../services/categoriasService";

// --- INTERFACES para la estructura del filtro ---
interface FilterCategory {
  id: number;
  nombre: string;
}

const HeaderProductsDropdown: React.FC = () => {
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pathname = usePathname();

  // 1. Cargar solo categorías principales
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiCategorias: Categoria[] = await getCategorias();
        const cats: FilterCategory[] = apiCategorias.map((c) => ({
          id: c.id,
          nombre: c.nombre,
        }));
        setCategories(cats);
      } catch (error) {
        console.error("❌ Error al cargar categorías para el menú:", error);
      }
    };
    fetchCategories();
  }, []);

  const isProductsActive = pathname.startsWith("/productos");
  const handleMouseEnter = () => setIsMenuOpen(true);
  const handleMouseLeave = () => setIsMenuOpen(false);

  const baseLinkClasses = `inline-flex items-center h-full px-1 border-b-2 transition duration-150 text-sm font-medium`;

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Enlace principal "Productos" */}
      <Link
        href="/users/productos"
        className={`${baseLinkClasses}
                  ${
                    isProductsActive
                      ? "border-amber-500 text-amber-700"
                      : "border-transparent text-gray-500"
                  }
                  hover:border-amber-300 hover:text-amber-700
                `}
      >
        Productos
        {/* Icono de flecha */}
        <svg
          className={`ml-1 -mr-0.5 h-4 w-4 transform ${
            isMenuOpen ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </Link>

      {/* 🟢 Menú simple de Categorías (aparece hacia abajo - debajo del header) */}
      {isMenuOpen && categories.length > 0 && (
        <div className="absolute z-50 top-full left-0 mt-0 w-56 origin-top-left rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/users/productos?categoriaId=${category.id}`}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
              >
                {category.nombre}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderProductsDropdown;
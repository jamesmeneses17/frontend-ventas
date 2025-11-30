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

  const isProductsActive = pathname.startsWith("/users/productos");
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

      {/* Mega-menu: columnas, centrado y scroll si hay muchas categorías */}
      {isMenuOpen && categories.length > 0 && (
        <div
          className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 w-[900px] max-w-[calc(100vw-2rem)] rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-label="Categorías de productos"
        >
          <div className="p-4 max-h-80 overflow-auto">
            {/* Calcula columnas según número de categorías (responsive) */}
            {(() => {
              const total = categories.length;
              let cols = 5;
              if (total <= 8) cols = 2;
              else if (total <= 16) cols = 3;
              else if (total <= 28) cols = 4;
              // dividir categorías en columnas contiguas (verticales)
              const splitIntoColumns = <T,>(items: T[], cols: number): T[][] => {
                const result: T[][] = [];
                if (cols <= 0) return result;
                const perCol = Math.ceil(items.length / cols);
                for (let i = 0; i < cols; i++) {
                  const start = i * perCol;
                  const end = start + perCol;
                  result.push(items.slice(start, end));
                }
                return result;
              };

              const columns = splitIntoColumns(categories, cols);

              return (
                <div
                  className="grid gap-x-8"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
                >
                  {columns.map((col, colIdx) => (
                    <div key={colIdx} className="space-y-1">
                      {col.map((category) => (
                        <Link
                          key={category.id}
                          href={`/users/productos?categoriaId=${category.id}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-0 py-1 text-sm text-gray-700 hover:text-amber-700"
                        >
                          {category.nombre}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderProductsDropdown;
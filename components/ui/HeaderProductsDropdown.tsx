"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [activeGroup, setActiveGroup] = useState<number>(0);

  const pathname = usePathname();

  // ref para timeout de cierre
  const closeTimeout = useRef<number | null>(null);

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
        console.error(" Error al cargar categorías para el menú:", error);
      }
    };
    fetchCategories();
  }, []);

  // limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (closeTimeout.current) {
        window.clearTimeout(closeTimeout.current);
        closeTimeout.current = null;
      }
    };
  }, []);

  // Definimos 4 grupos generales con palabras clave para agrupar categorías
  const groups = [
    {
      id: "energia",
      nombre: "Energía y Electricidad ",
      keywords: [
        "energia",
        "eléctr",
        "electric",
        "110v",
        "panel",
        "reflector",
        "ilumin",
        "bombillo",
        "toma",
        "proteccion",
      ],
    },
    {
      id: "frenos",
      nombre: "Frenos y Transmisión ",
      keywords: [
        "freno",
        "frenos",
        "disco",
        "pastilla",
        "cilindro",
        "guaya",
        "banda",
        "campana",
        "transm",
        "caja",
      ],
    },
    {
      id: "fluidos",
      nombre: "Fluidos y Motor ",
      keywords: [
        "aceite",
        "liquido",
        "refriger",
        "motor",
        "fluido",
        "hidraul",
        "diferencial",
      ],
    },
    {
      id: "filtros",
      nombre: "Filtración y Mantenimiento ",
      keywords: [
        "filtro",
        "filtros",
        "mantenimiento",
        "filtro aire",
        "filtro combustible",
        "filtro aceite",
      ],
    },
  ];

  const matchesKeywords = (name: string, keywords: string[]) => {
    const n = name.toLowerCase();
    return keywords.some((k) => n.includes(k));
  };

  // Asignar categorías a cada grupo (y otras que no calcen)
  const grouped = groups.map((g) => ({
    ...g,
    categorias: categories.filter((c) => matchesKeywords(c.nombre, g.keywords)),
  }));

  const uncategorized = categories.filter((c) => {
    return !groups.some((g) => matchesKeywords(c.nombre, g.keywords));
  });

  const isProductsActive = pathname.startsWith("/users/productos");

  const handleMouseEnter = () => {
    // cancelar cierre pendiente y abrir
    if (closeTimeout.current) {
      window.clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setActiveGroup(0);
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeout.current) window.clearTimeout(closeTimeout.current);
    closeTimeout.current = window.setTimeout(() => {
      setIsMenuOpen(false);
      closeTimeout.current = null;
    }, 160);
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
          <div className="p-4 max-h-80 overflow-hidden">
            <div className="flex gap-6">
              {/* Columna izquierda: 4 grupos generales */}
              <div className="w-1/3">
                <div className="space-y-1">
                  {grouped.map((g, idx) => (
                    <button
                      key={g.id}
                      onMouseEnter={() => setActiveGroup(idx)}
                      onFocus={() => setActiveGroup(idx)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition ${
                        activeGroup === idx ? "bg-gray-100 text-amber-700" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {g.nombre}
                      <div className="text-xs font-normal text-gray-500">
                        {g.categorias.length} categorías
                      </div>
                    </button>
                  ))}

                  {/* Si hay categorías sin agrupar, mostrar un botón "Otros" */}
                  {uncategorized.length > 0 && (
                    <button
                      onMouseEnter={() => setActiveGroup(grouped.length)}
                      onFocus={() => setActiveGroup(grouped.length)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition ${
                        activeGroup === grouped.length ? "bg-gray-100 text-amber-700" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Otros
                      <div className="text-xs font-normal text-gray-500">
                        {uncategorized.length} categorías
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Columna derecha: categorías del grupo activo */}
              <div className="w-2/3 border-l pl-6 max-h-64 overflow-auto">
                {(() => {
                  const showCats = activeGroup < grouped.length ? grouped[activeGroup].categorias : uncategorized;
                  if (!showCats || showCats.length === 0) {
                    return <div className="text-sm text-gray-500">No hay categorías en este grupo.</div>;
                  }
                  return (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      {showCats.map((category) => (
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
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderProductsDropdown;
// /components/ui/MobileCategoryList.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import {
  getSubcategorias,
  Subcategoria,
} from "../services/subcategoriasService";

interface FilterCategory {
  id: number;
  nombre: string;
  subcategorias?: FilterCategory[];
}

interface MobileCategoryListProps {
  onNavigate: () => void;
}

const MobileCategoryList: React.FC<MobileCategoryListProps> = ({
  onNavigate,
}) => {
  const [groupedCategories, setGroupedCategories] = useState<FilterCategory[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAndGroup = async () => {
      setIsLoading(true);
      try {
        const apiSubcategorias: Subcategoria[] = await getSubcategorias();
        const categoryMap = new Map<number, FilterCategory>();

        apiSubcategorias.forEach((subCat) => {
          const parent = subCat.categoria;
          if (!subCat.estado || subCat.estado.nombre !== "Activo") return;
          const childCategory: FilterCategory = {
            id: subCat.id,
            nombre: subCat.nombre,
          };

          if (!categoryMap.has(parent.id)) {
            const parentCategory: FilterCategory = {
              id: parent.id,
              nombre: parent.nombre,
              subcategorias: [],
            };
            categoryMap.set(parent.id, parentCategory);
          }
          categoryMap.get(parent.id)?.subcategorias?.push(childCategory);
        });
        setGroupedCategories(Array.from(categoryMap.values()));
      } catch (error) {
        console.error(
          "❌ Error al cargar y agrupar categorías en el menú móvil:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndGroup();
  }, []);

  const toggleCategory = (categoryId: number, hasSubcategories: boolean) => {
    if (hasSubcategories) {
      setOpenCategoryId(openCategoryId === categoryId ? null : categoryId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 text-sm text-gray-500">Cargando productos...</div>
    );
  }

  return (
    <div className="pt-2 pb-3 space-y-1">
      {groupedCategories.map((category) => {
        const isCategoryOpen = openCategoryId === category.id;
        const hasSubcategories = (category.subcategorias?.length || 0) > 0;

        return (
          <div key={category.id} className="space-y-1">
            {/* Contenedor del Botón/Enlace de la Categoría Principal */}
            <div
              // ✅ Clase condicional para resaltar la categoría abierta en móvil
              className={`flex items-center justify-between rounded-md transition duration-150 
                                ${
                                  isCategoryOpen
                                    ? "bg-amber-100"
                                    : "bg-gray-50 hover:bg-gray-100"
                                }
                            `}
            >
              {/* 1. Enlace a la Categoría */}
              <Link
                href={`/users/productos?categoriaId=${category.id}`}
                onClick={onNavigate}
                // ✅ Color del texto de la categoría
                className={`flex-1 px-3 py-2 text-base font-bold ${
                  isCategoryOpen ? "text-amber-700" : "text-gray-800"
                }`}
              >
                {category.nombre}
              </Link>

              {/* 2. Botón para Desplegar (solo si hay subcategorías) */}
              {hasSubcategories && (
                <button
                  onClick={() => toggleCategory(category.id, hasSubcategories)}
                  // ✅ Color del icono de flecha
                  className={`p-2 transition-colors ${
                    isCategoryOpen
                      ? "text-amber-700"
                      : "text-gray-600 hover:text-amber-700"
                  }`}
                  aria-expanded={isCategoryOpen}
                >
                  <svg
                    className={`h-5 w-5 transform transition-transform ${
                      isCategoryOpen ? "rotate-180" : "rotate-0"
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
                </button>
              )}
            </div>

            {/* Lista de Subcategorías (Acordeón) */}
            {isCategoryOpen && hasSubcategories && (
              <div className="pl-4 space-y-0.5 border-l border-gray-100 ml-4 pt-1">
                {category.subcategorias?.map((subCat) => (
                  <Link
                    key={subCat.id}
                    href={`/users/productos?subcategoriaId=${subCat.id}`}
                    onClick={onNavigate}
                    // ✅ Estilo ámbar para subcategorías al hacer hover/tap
                    className="block px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition duration-150"
                  >
                    {subCat.nombre}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MobileCategoryList;

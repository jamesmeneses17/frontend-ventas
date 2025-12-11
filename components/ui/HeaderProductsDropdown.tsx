"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getCategorias, Categoria } from "../services/categoriasService";
import {
  getCategoriasPrincipales,
  CategoriaPrincipal,
} from "../services/categoriasPrincipalesService";
import { getSubcategorias, Subcategoria } from "../services/subcategoriasService";

// Tipo extendido de categoría que puede incluir subcategorías
type CategoriaConSubcategorias = Categoria & {
  subcategorias?: any[];
  sub?: any[];
};

const HeaderProductsDropdown: React.FC = () => {
  const [categories, setCategories] = useState<CategoriaConSubcategorias[]>([]);
  const [mainCategories, setMainCategories] = useState<CategoriaPrincipal[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const pathname = usePathname();
  const closeTimeout = useRef<number | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const [apiCategorias, apiMainResponse, apiSubcategorias] =
          await Promise.all([
            getCategorias(false, 1, 1000, ""),
            getCategoriasPrincipales(1, 1000, ""),
            getSubcategorias(1, 1000, ""),
          ]);

        // Normalizar respuestas - manejar tanto arrays como objetos con .data
        const catsRaw = Array.isArray(apiCategorias?.data)
          ? apiCategorias.data
          : Array.isArray(apiCategorias)
            ? apiCategorias
            : [];

        const mainsRaw = Array.isArray(apiMainResponse?.data)
          ? apiMainResponse.data
          : Array.isArray(apiMainResponse)
            ? apiMainResponse
            : [];

        const subsRaw = Array.isArray(apiSubcategorias?.data)
          ? apiSubcategorias.data
          : Array.isArray(apiSubcategorias)
            ? apiSubcategorias
            : [];

        // Solo mostrar activos (1 = activo)
        const cats = catsRaw.filter((c: any) => Number(c.activo ?? 1) === 1);
        const mains = mainsRaw.filter((m: any) => Number(m.activo ?? 1) === 1);
        const subs = subsRaw.filter((s: any) => Number(s.activo ?? 1) === 1);

        setCategories(cats);
        setMainCategories(mains);
        setSubcategories(subs);

        // Logs de debugging detallados
        console.log("📦 Categorías cargadas:", cats.length, cats);
        console.log("📂 Categorías principales cargadas:", mains.length, mains);
        console.log("🏷️ Subcategorías cargadas:", subs.length, subs);

        // Validación de relaciones
        console.log("🔗 VALIDACIÓN DE RELACIONES:");
        
        // Mostrar estructura de una subcategoría de ejemplo
        if (subs.length > 0) {
          console.log("📝 Ejemplo de subcategoría:", subs[0]);
          console.log(
            `   - Campos disponibles: categoria_id=${subs[0].categoria_id}, categoriaId=${(subs[0] as any).categoriaId}`
          );
          console.log(
            `   - El campo correcto es: ${(subs[0] as any).categoriaId ? "categoriaId ✅" : "categoria_id ❌ (NaN)"}`
          );
        }

        // Mostrar estructura de una categoría de ejemplo
        if (cats.length > 0) {
          console.log("📝 Ejemplo de categoría:", cats[0]);
          console.log(`   - ID de la categoría: ${cats[0].id}`);
        }

        // Test de coincidencias
        if (subs.length > 0 && cats.length > 0) {
          const testCat = cats[0];
          const matchesByCategoria_id = subs.filter(
            (sub) => sub.categoria_id === testCat.id
          );
          const matchesByCategoria_Id = subs.filter(
            (sub) => (sub as any).categoriaId === testCat.id
          );
          console.log(
            `   ✓ Usando categoria_id: ${matchesByCategoria_id.length} matches`
          );
          console.log(
            `   ✓ Usando categoriaId: ${matchesByCategoria_Id.length} matches`
          );
        }

        if (Array.isArray(mains) && mains.length > 0) setActiveGroup(0);
      } catch (e) {
        console.error("❌ Error cargando categorías/subcategorías:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Agrupar categorías por categoría principal y asignar subcategorías a cada una
  const grouped = mainCategories.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    categorias: categories
      .filter((c) => c.categoriaPrincipalId === m.id)
      .map((cat) => {
        // Las subcategorías pueden estar en 3 lugares posibles:
        // 1. En el campo 'subcategorias' de la categoría
        // 2. En el campo 'sub' de la categoría
        // 3. Filtradas desde el estado de subcategorías globales
        
        let catSubs = [];
        
        // Opción 1: Subcategorías incluidas en la categoría misma
        if ((cat as any).subcategorias && Array.isArray((cat as any).subcategorias)) {
          catSubs = (cat as any).subcategorias;
        } 
        // Opción 2: Subcategorías en campo 'sub'
        else if ((cat as any).sub && Array.isArray((cat as any).sub)) {
          catSubs = (cat as any).sub;
        } 
        // Opción 3: Filtrar desde subcategorías globales usando AMBOS campos (categoria_id y categoriaId)
        else {
          catSubs = subcategories.filter(
            (sub) => sub.categoria_id === cat.id || (sub as any).categoriaId === cat.id
          );
        }
        
        if (catSubs.length > 0) {
          console.log(
            `  📌 Categoría "${cat.nombre}" (ID: ${cat.id}) contiene ${catSubs.length} subcategoría(s): [${catSubs
              .map((s: any) => `"${s.nombre}"`)
              .join(", ")}]`
          );
        }
        
        return {
          ...cat,
          subcategorias: catSubs,
        };
      }),
  }));

  // Categorías sin categoría principal asignada
  const uncategorized = categories
    .filter((c) => !c.categoriaPrincipalId)
    .map((cat) => {
      // Misma lógica de búsqueda de subcategorías
      let catSubs = [];
      
      if ((cat as any).subcategorias && Array.isArray((cat as any).subcategorias)) {
        catSubs = (cat as any).subcategorias;
      } else if ((cat as any).sub && Array.isArray((cat as any).sub)) {
        catSubs = (cat as any).sub;
      } else {
        catSubs = subcategories.filter(
          (sub) => sub.categoria_id === cat.id || (sub as any).categoriaId === cat.id
        );
      }
      
      return {
        ...cat,
        subcategorias: catSubs,
      };
    });

  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setActiveGroup(0);
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = window.setTimeout(() => {
      setIsMenuOpen(false);
    }, 150);
  };

  const isProductsActive = pathname.startsWith("/users/productos");

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href="/users/productos"
        className={`inline-flex items-center h-full px-1 border-b-2 transition text-sm font-medium
        ${
          isProductsActive
            ? "border-blue-500 text-blue-700"
            : "border-transparent text-gray-600"
        }
        hover:border-blue-400 hover:text-blue-700`}
      >
        Productos
        <svg
          className={`ml-1 h-4 w-4 transform ${
            isMenuOpen ? "rotate-180" : "rotate-0"
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z"
          />
        </svg>
      </Link>

      {isMenuOpen && (categories.length > 0 || mainCategories.length > 0) && (
        <div
          className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-[900px] max-w-[calc(100vw-2rem)] rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
        >
          <div className="p-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Cargando categorías...
              </div>
            ) : (
              <div className="flex gap-6">
                {/* IZQUIERDA - Categoría Principal */}
                <div className="w-1/3 border-r pr-4">
                  <div className="space-y-1">
                    {grouped.length > 0 ? (
                      grouped.map((g, idx) => (
                        <button
                          key={g.id}
                          onMouseEnter={() => setActiveGroup(idx)}
                          onFocus={() => setActiveGroup(idx)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition
                          ${
                            activeGroup === idx
                              ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                              : "text-gray-700 hover:bg-gray-50 border-l-2 border-transparent"
                          }`}
                        >
                          {g.nombre}
                          <div className="text-xs text-gray-500 font-normal">
                            {g.categorias.length}{" "}
                            {g.categorias.length === 1
                              ? "categoría"
                              : "categorías"}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 py-2">
                        Sin grupos
                      </div>
                    )}

                    {uncategorized.length > 0 && (
                      <button
                        onMouseEnter={() => setActiveGroup(grouped.length)}
                        onFocus={() => setActiveGroup(grouped.length)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-semibold transition
                        ${
                          activeGroup === grouped.length
                            ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                            : "text-gray-700 hover:bg-gray-50 border-l-2 border-transparent"
                        }`}
                      >
                        Otros
                        <div className="text-xs text-gray-500 font-normal">
                          {uncategorized.length}{" "}
                          {uncategorized.length === 1
                            ? "categoría"
                            : "categorías"}
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* DERECHA - Categorías con subcategorías */}
                <div className="w-2/3 pl-4">
                  {(() => {
                    const active =
                      activeGroup < grouped.length
                        ? grouped[activeGroup].categorias
                        : uncategorized;

                    if (!active || active.length === 0) {
                      return (
                        <div className="text-sm text-gray-500 py-4">
                          No hay categorías en este grupo
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 gap-6">
                        {active.map((cat) => (
                          <div key={cat.id} className="pb-3">
                            {/* Nombre de la categoría como enlace */}
                            <Link
                              href={`/users/productos?categoriaId=${cat.id}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="block font-semibold text-gray-800 hover:text-blue-600 transition mb-1"
                            >
                              {cat.nombre}
                            </Link>

                            {/* Subcategorías */}
                            {(() => {
                              const subs = cat.subcategorias || [];
                              return subs.length > 0 ? (
                                <ul className="text-sm text-gray-600 space-y-0.5 ml-2">
                                  {subs.map((sub: any) => (
                                    <li key={sub.id}>
                                      <Link
                                        href={`/users/productos?subcategoriaId=${sub.id}&categoriaId=${cat.id}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="hover:text-blue-600 transition text-xs"
                                      >
                                        • {sub.nombre}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : null;
                            })()}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderProductsDropdown;

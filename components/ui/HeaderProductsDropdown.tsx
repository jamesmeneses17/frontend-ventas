"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SunMedium,
  Car,
  Zap,
  Bike,
  Cpu,
  Activity,
  Battery,
  Package,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
  Server,
  ArrowRight
} from "lucide-react";

import { getCategorias, Categoria } from "../services/categoriasService";
import {
  getCategoriasPrincipales,
  CategoriaPrincipal,
} from "../services/categoriasPrincipalesService";
import { getSubcategorias, Subcategoria } from "../services/subcategoriasService";

// COLORES PERSONALIZADOS
const LOGO_LIME = "#2b7920ff"; // Verde Hoja (Solicitado)
const LOGO_BLUE = "#2563eb"; // Azul Corporativo (Blue 600)

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

        // Normalizar respuestas
        const catsRaw = Array.isArray(apiCategorias?.data) ? apiCategorias.data : (Array.isArray(apiCategorias) ? apiCategorias : []);
        const mainsRaw = Array.isArray(apiMainResponse?.data) ? apiMainResponse.data : (Array.isArray(apiMainResponse) ? apiMainResponse : []);
        const subsRaw = Array.isArray(apiSubcategorias?.data) ? apiSubcategorias.data : (Array.isArray(apiSubcategorias) ? apiSubcategorias : []);

        // Solo mostrar activos
        const cats = catsRaw.filter((c: any) => Number(c.activo ?? 1) === 1);
        const mains = mainsRaw.filter((m: any) => Number(m.activo ?? 1) === 1);
        const subs = subsRaw.filter((s: any) => Number(s.activo ?? 1) === 1);

        setCategories(cats);
        setMainCategories(mains);
        setSubcategories(subs);
        if (Array.isArray(mains) && mains.length > 0) setActiveGroup(0);
      } catch (e) {
        console.error("❌ Error cargando categorías:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Agrupar categorías
  const grouped = mainCategories.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    categorias: categories
      .filter((c) => c.categoriaPrincipalId === m.id)
      .map((cat) => {
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
        return { ...cat, subcategorias: catSubs };
      }),
  }));

  const uncategorized = categories
    .filter((c) => !c.categoriaPrincipalId)
    .map((cat) => {
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
      return { ...cat, subcategorias: catSubs };
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

  // Helper para iconos
  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    const props = { className: "w-5 h-5", strokeWidth: 1.5 };

    if (lower.includes("solar")) return <SunMedium {...props} />;
    if (lower.includes("auto")) return <Car {...props} />;
    if (lower.includes("corriente") || lower.includes("alterna")) return <Zap {...props} />;
    if (lower.includes("moto")) return <Bike {...props} />;
    if (lower.includes("control")) return <Cpu {...props} />;
    if (lower.includes("inversor")) return <Activity {...props} />;
    if (lower.includes("bater")) return <Battery {...props} />;
    if (lower.includes("ilumin")) return <Lightbulb {...props} />;
    if (lower.includes("protec")) return <ShieldCheck {...props} />;
    if (lower.includes("gabine")) return <Server {...props} />;
    return <Package {...props} />;
  };

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href="/users/productos"
        className={`inline-flex items-center h-full px-1 border-b-2 transition text-[13px] font-medium
        ${isProductsActive
            ? "border-[#a5cd37] text-gray-900"
            : "border-transparent text-gray-700"
          }
        hover:text-blue-600 hover:border-[#a5cd37]`}
      >
        Productos
        <svg
          className={`ml-1 h-3 w-3 transform transition-transform duration-200 ${isMenuOpen ? "rotate-180" : "rotate-0"
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
          className="fixed z-[60] top-28 left-0 right-0 mx-auto w-[780px] max-w-[95vw] rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/5 overflow-hidden transition-all duration-300 ease-out"
          style={{ maxHeight: 'calc(100vh - 8rem)' }}
        >
          {/* BARRA SUPERIOR DECORATIVA VERDE/AZUL */}
          <div className="h-1 w-full bg-gradient-to-r from-[#2563eb] to-[#a5cd37]" />

          <div className="flex min-h-[420px]">
            {isLoading ? (
              <div className="w-full py-20 flex items-center justify-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a5cd37] mr-2"></div>
                Cargando productos...
              </div>
            ) : (
              <>
                {/* COLUMNA 1: MENÚ LATERAL (30%) */}
                <div className="w-[30%] bg-[#f9fafb] flex-shrink-0 border-r border-gray-100 overflow-y-auto py-5">
                  <div className="space-y-1.5 px-3">
                    {grouped.length > 0 ? (
                      grouped.map((g, idx) => (
                        <button
                          key={g.id}
                          onMouseEnter={() => setActiveGroup(idx)}
                          className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-xl text-[13.5px] transition-all duration-200
                          ${activeGroup === idx
                              ? "bg-white text-[#2563eb] font-bold shadow-md ring-1 ring-[#a5cd37]/30 border-l-4 border-l-[#a5cd37]" // Borde izquierdo LIME, Texto BLUE
                              : "text-gray-600 hover:bg-white hover:text-gray-900"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`${activeGroup === idx ? "text-[#a5cd37]" : "text-gray-400 group-hover:text-[#2563eb]"}`}>
                              {getCategoryIcon(g.nombre)}
                            </span>
                            <span className="truncate">{g.nombre}</span>
                          </div>
                          {activeGroup === idx && <ChevronRight className="w-4 h-4 text-[#a5cd37]" strokeWidth={2.5} />}
                        </button>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 px-4 py-2">Sin categorías</div>
                    )}

                    {uncategorized.length > 0 && (
                      <button
                        onMouseEnter={() => setActiveGroup(grouped.length)}
                        className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-xl text-[13.5px] transition-all duration-200
                        ${activeGroup === grouped.length
                            ? "bg-white text-[#2563eb] font-bold shadow-md ring-1 ring-[#a5cd37]/30 border-l-4 border-l-[#a5cd37]"
                            : "text-gray-600 hover:bg-white hover:text-gray-900"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`${activeGroup === grouped.length ? "text-[#a5cd37]" : "text-gray-400"}`}>
                            <Package className="w-5 h-5" strokeWidth={1.5} />
                          </span>
                          <span>Otros Productos</span>
                        </div>
                        {activeGroup === grouped.length && <ChevronRight className="w-4 h-4 text-[#a5cd37]" strokeWidth={2.5} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* COLUMNA 2: CONTENIDO GRID (70%) */}
                <div className="w-[70%] bg-white p-8 overflow-y-auto max-h-[calc(100vh-8rem)]">
                  {(() => {
                    const active =
                      activeGroup < grouped.length
                        ? grouped[activeGroup].categorias
                        : uncategorized;

                    if (!active || active.length === 0) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <Package className="w-16 h-16 mb-4 opacity-10" strokeWidth={1} />
                          <p>Selecciona una categoría para ver sus productos</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-2 gap-x-12 gap-y-10 align-start">
                        {active.map((cat) => (
                          <div key={cat.id} className="break-inside-avoid">
                            {/* TÍTULO DE CATEGORÍA - Azul Corporativo */}
                            <Link
                              href={`/users/productos?categoriaId=${cat.id}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="group flex items-center mb-3.5 border-b border-gray-100 pb-1.5"
                            >
                              <h3 className="text-base font-bold text-[#2563eb] group-hover:text-[#1e40af] transition-colors">
                                {cat.nombre}
                              </h3>
                              <ArrowRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-[#a5cd37]" strokeWidth={2} />
                            </Link>

                            {/* LISTA DE SUBCATEGORÍAS */}
                            {(() => {
                              const subs = cat.subcategorias || [];
                              if (subs.length === 0) return (
                                <Link
                                  href={`/users/productos?categoriaId=${cat.id}`}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="inline-flex items-center text-xs font-semibold text-[#a5cd37] hover:text-[#8cb81d] bg-gray-50 hover:bg-[#f3fadd] px-2 py-1 rounded-md transition-colors"
                                >
                                  Explorar productos
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Link>
                              );

                              return (
                                <ul className="space-y-2.5">
                                  {subs.map((sub: any) => (
                                    <li key={sub.id}>
                                      <Link
                                        href={`/users/productos?subcategoriaId=${sub.id}&categoriaId=${cat.id}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-[13px] text-gray-600 hover:text-[#2563eb] hover:font-medium hover:translate-x-1 transition-all duration-200 flex items-center"
                                      >
                                        {sub.nombre}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderProductsDropdown;

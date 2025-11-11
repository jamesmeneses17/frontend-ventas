// /components/ProductCard.tsx
import React from "react";
import Link from "next/link";

interface ProductCardProps {
  id: number;
  nombre: string;
  displayPrice: string;
  stock?: number;
  categoria?: string;
  discountPercent?: number;
  salesCount?: number;
  imageSrc: string;
  href?: string;
  viewMode?: "grid" | "list";
  /** umbral para considerar "stock bajo" (por defecto 5) */
  lowStockThreshold?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  nombre,
  displayPrice,
  stock,
  categoria,
  discountPercent,
  salesCount,
  imageSrc,
  href,
  viewMode = "grid",
  lowStockThreshold = 5,
}) => {
  // href objetivo: si se pasa 'href' usarlo, si no construir la ruta por id
  const targetHref = href ?? `/users/especificaciones/${id}`;
  // 🔹 Determina el estado del stock (solo bajo o agotado)
  const getStockState = (s?: number) => {
    if (typeof s !== "number") return null;
    if (s <= 0)
      return { label: "Agotado", className: "bg-red-600 text-white" };
    if (s <= lowStockThreshold)
      return { label: "Stock Bajo", className: "bg-yellow-400 text-gray-800" };
    return null; // ✅ No mostrar “Disponible”
  };

  // 🟥 Etiqueta de descuento
  const DiscountBadge = () => {
    if (typeof discountPercent === "number" && discountPercent > 0) {
      return (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-20 shadow-md">
          -{discountPercent}%
        </div>
      );
    }
    return null;
  };

  // 🟨 Etiqueta de stock (derecha)
  const StockBadge = () => {
    const state = getStockState(stock);
    if (!state) return null;
    return (
      <div
        className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full shadow-md z-30 pointer-events-none ${state.className}`}
      >
        {state.label}
      </div>
    );
  };

  // ✅ --- VISTA EN CUADRÍCULA ---
  if (viewMode === "grid") {
    return (
      <div className="group relative block bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
        {/* Imagen con etiquetas */}
        <Link href={targetHref} className="block relative h-48 sm:h-56 overflow-hidden">
          <DiscountBadge />
          <StockBadge />
          <img
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 z-10 relative"
            src={imageSrc}
            alt={nombre}
          />
        </Link>

        {/* Contenido */}
        <div className="p-4 flex flex-col items-center text-center">
          {/* Nombre más destacado */}
          <h3 className="text-lg font-extrabold text-gray-900 line-clamp-2 mb-1">
            {nombre}
          </h3>

          {/* Categoría más suave */}
          {categoria && (
            <p className="text-sm font-medium text-gray-500 mb-1">
              {categoria}
            </p>
          )}

          {/* Stock (solo informativo, no etiqueta principal) */}
          {typeof stock === "number" && (
            <p className="text-xs text-gray-400 mb-1">
              Disponible: {stock}
            </p>
          )}

          {/* Ventas (opcional) */}
          {typeof salesCount === "number" && (
            <p className="text-sm text-gray-500 mt-1">Ventas: {salesCount}</p>
          )}

          {/* Precio principal */}
          <p className="text-2xl font-bold text-[#e75e55] mb-3">
            {displayPrice}
          </p>

          {/* Botón azul tipo DISEM */}
          <Link
            href={targetHref}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#2e9fdb] hover:bg-[#238ac1] transition duration-150"
          >
            Ver más
          </Link>
        </div>
      </div>
    );
  }

  // ✅ --- VISTA EN LISTA ---
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 flex flex-col sm:flex-row items-center sm:items-stretch overflow-hidden">
      {/* Imagen con etiquetas */}
      <Link
        href={targetHref}
        className="w-full sm:w-56 h-56 flex-shrink-0 relative overflow-hidden"
      >
        <DiscountBadge />
        <StockBadge />
        <img
          src={imageSrc}
          alt={nombre}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105 z-10 relative"
        />
      </Link>

      {/* Contenido */}
      <div className="flex flex-col justify-between p-4 flex-1 text-center sm:text-left">
        <div>
          {/* Nombre principal */}
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">
            {nombre}
          </h3>

          {/* Categoría */}
          {categoria && (
            <p className="text-sm font-medium text-gray-500 mb-2">
              {categoria}
            </p>
          )}

          {/* Stock informativo */}
          {typeof stock === "number" && (
            <p className="text-xs text-gray-400 mb-2">Disponible: {stock}</p>
          )}

          {/* Ventas */}
          {typeof salesCount === "number" && (
            <p className="text-sm text-gray-500">Ventas: {salesCount}</p>
          )}

          {/* Precio */}
          <p className="text-[#e75e55] text-2xl font-bold">{displayPrice}</p>
        </div>

        {/* Botón */}
        <div className="mt-4 sm:mt-0 sm:self-end">
          <Link
            href={targetHref}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#2e9fdb] hover:bg-[#238ac1] transition duration-150"
          >
            Cotizar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

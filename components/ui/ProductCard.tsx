import React from "react";

interface ProductCardProps {
  id: number;
  nombre: string;
  displayPrice: string;
  stock?: number;
  categoria?: string;
  discountPercent?: number;
  salesCount?: number;
  imageSrc: string;
  href: string;
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
  // 🔹 Determina el estado del stock (solo bajo o agotado)
  const getStockState = (s?: number) => {
    if (typeof s !== "number") return null;
    if (s <= 0)
      return { label: "Agotado", className: "bg-red-600 text-white" };
    if (s <= lowStockThreshold)
      return { label: "Stock Bajo", className: "bg-yellow-400 text-gray-800" };
    return null; // ✅ No mostrar “Disponible”
  };

  // 🟥 Etiqueta de descuento (izquierda)
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

  // 🟨 Etiqueta de stock (derecha) — solo si está bajo o agotado
  const StockBadge = () => {
    const state = getStockState(stock);
    if (!state) return null;
    return (
      <div
        className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full shadow-md z-20 ${state.className}`}
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
        <a
          href={href}
          className="block relative h-48 sm:h-56 overflow-hidden"
        >
          <DiscountBadge />
          <StockBadge />
          <img
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 z-10 relative"
            src={imageSrc}
            alt={nombre}
          />
        </a>

        {/* Contenido */}
        <div className="p-4 flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-1">
            {nombre}
          </h3>

          {categoria && (
            <p className="text-sm text-gray-600 mb-1">{categoria}</p>
          )}

          {typeof stock === "number" && (
            <p className="text-sm text-gray-500 mb-1">Stock: {stock}</p>
          )}

          {typeof salesCount === "number" && (
            <p className="text-sm text-gray-500 mt-1">Ventas: {salesCount}</p>
          )}

          <p className="text-2xl font-bold text-[#e75e55] mb-3">
            {displayPrice}
          </p>

          {/* Botón azul tipo DISEM */}
          <a
            href={href}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#2e9fdb] hover:bg-[#238ac1] transition duration-150"
          >
            Ver más
          </a>
        </div>
      </div>
    );
  }

  // ✅ --- VISTA EN LISTA ---
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 flex flex-col sm:flex-row items-center sm:items-stretch overflow-hidden">
      {/* Imagen con etiquetas */}
      <a
        href={href}
        className="w-full sm:w-56 h-56 flex-shrink-0 relative overflow-hidden"
      >
        <DiscountBadge />
        <StockBadge />
        <img
          src={imageSrc}
          alt={nombre}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105 z-10 relative"
        />
      </a>

      {/* Contenido */}
      <div className="flex flex-col justify-between p-4 flex-1 text-center sm:text-left">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{nombre}</h3>

          {categoria && (
            <p className="text-sm text-gray-600 mb-2">{categoria}</p>
          )}

          {typeof stock === "number" && (
            <p className="text-sm text-gray-500 mb-2">Stock: {stock}</p>
          )}

          {typeof salesCount === "number" && (
            <p className="text-sm text-gray-500">Ventas: {salesCount}</p>
          )}

          <p className="text-[#e75e55] text-2xl font-bold">{displayPrice}</p>
        </div>

        {/* Botón azul tipo DISEM */}
        <div className="mt-4 sm:mt-0 sm:self-end">
          <a
            href={href}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#2e9fdb] hover:bg-[#238ac1] transition duration-150"
          >
            Cotizar
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

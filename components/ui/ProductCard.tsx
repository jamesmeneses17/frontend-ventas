// /components/ui/ProductCard.tsx
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
}) => {
  // 🟥 Etiqueta redondeada de descuento sobre la imagen
  const DiscountBadge = () => {
    if (typeof discountPercent === "number" && discountPercent > 0) {
      return (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-md">
          -{discountPercent}%
        </div>
      );
    }
    return null;
  };

  // ✅ --- VISTA EN CUADRÍCULA ---
  if (viewMode === "grid") {
    return (
      <div className="group relative block bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
        {/* Imagen con etiqueta */}
        <a href={href} className="block relative h-48 sm:h-56 overflow-hidden">
          <DiscountBadge />
          <img
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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

          {typeof stock === "number" &&
            (stock > 0 ? (
              <p className="text-sm text-gray-500 mb-1">Stock: {stock}</p>
            ) : (
              <p className="text-sm text-[#e75e55] mb-1 font-medium">
                Sin stock
              </p>
            ))}

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
      {/* Imagen y descuento */}
      <a
        href={href}
        className="w-full sm:w-56 h-56 flex-shrink-0 relative overflow-hidden"
      >
        <DiscountBadge />
        <img
          src={imageSrc}
          alt={nombre}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </a>

      {/* Contenido */}
      <div className="flex flex-col justify-between p-4 flex-1 text-center sm:text-left">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{nombre}</h3>

          {categoria && (
            <p className="text-sm text-gray-600 mb-2">{categoria}</p>
          )}

          {typeof stock === "number" &&
            (stock > 0 ? (
              <p className="text-sm text-gray-500 mb-2">Stock: {stock}</p>
            ) : (
              <p className="text-sm text-[#fb2c36] mb-2 font-medium">
                Sin stock
              </p>
            ))}

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

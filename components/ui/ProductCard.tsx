// /components/ui/ProductCard.tsx
import React from "react";

interface ProductCardProps {
  /** ID del producto, usado principalmente como clave. */
  id: number;
  /** Nombre del producto. */
  nombre: string;
  /** Precio del producto ya formateado (ej: "$245.000" o "Consultar Precio"). */
  displayPrice: string;
  /** URL de la imagen. */
  imageSrc: string;
  /** URL a la que navegará el usuario al hacer clic. */
  href: string;
  /** Modo de vista: "grid" (por defecto) o "list" */
  viewMode?: "grid" | "list";
}

/**
 * Componente Tarjeta de Producto.
 * Soporta dos modos: vista de cuadrícula y vista de lista.
 */
const ProductCard: React.FC<ProductCardProps> = ({
  id,
  nombre,
  displayPrice,
  imageSrc,
  href,
  viewMode = "grid",
}) => {
  // ✅ --- VISTA EN CUADRÍCULA ---
  if (viewMode === "grid") {
    return (
      <div
        className="group relative block bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
      >
        {/* Imagen */}
        <a href={href} className="block relative h-48 sm:h-56 overflow-hidden">
          <img
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            src={imageSrc}
            alt={nombre}
          />
        </a>

        {/* Contenido */}
        <div className="p-4 flex flex-col items-center text-center">
          <div className="flex text-amber-500 mb-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.122-6.545-4.745-4.636 6.571-.955L10 2l2.87 5.954 6.571.955-4.745 4.636 1.122 6.545L10 15z" />
                </svg>
              ))}
          </div>

          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-1">
            {nombre}
          </h3>

          <p className="text-2xl font-bold text-amber-600 mb-3">
            {displayPrice}
          </p>

          <a
            href={href}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-900 transition duration-150"
          >
            Ver más
          </a>
        </div>
      </div>
    );
  }

  // ✅ --- VISTA EN LISTA ---
  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 flex flex-col sm:flex-row items-center sm:items-stretch overflow-hidden"
    >
      {/* Imagen */}
      <a
        href={href}
        className="w-full sm:w-56 h-56 flex-shrink-0 overflow-hidden"
      >
        <img
          src={imageSrc}
          alt={nombre}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </a>

      {/* Contenido */}
      <div className="flex flex-col justify-between p-4 flex-1 text-center sm:text-left">
        <div>
          <div className="flex justify-center sm:justify-start text-amber-500 mb-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.122-6.545-4.745-4.636 6.571-.955L10 2l2.87 5.954 6.571.955-4.745 4.636 1.122 6.545L10 15z" />
                </svg>
              ))}
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {nombre}
          </h3>

          <p className="text-gray-500 mb-1">DISEM SAS</p>
          <p className="text-amber-600 text-2xl font-bold">{displayPrice}</p>
        </div>

        <div className="mt-4 sm:mt-0 sm:self-end">
          <a
            href={href}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 transition duration-150"
          >
            Cotizar
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

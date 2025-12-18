// /components/ProductCard.tsx
import React from "react";
import Image from 'next/image';
import { isImageUrl } from '@/utils/ProductUtils';
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
  /** Precio original (sin descuento) para mostrar tachado */
  originalPrice?: string;
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
  originalPrice,
}) => {
  const [src, setSrc] = React.useState<string>(isImageUrl(imageSrc) ? imageSrc : "/images/imagen.webp");
  React.useEffect(() => {
    setSrc(isImageUrl(imageSrc) ? imageSrc : "/images/imagen.webp");
  }, [imageSrc]);
  // href objetivo: si se pasa 'href' usarlo, si no construir la ruta por id
  const targetHref = href ?? `/users/especificaciones/${id}`;
  // 🔹 Determina el estado del stock (solo bajo o agotado)
  const getStockState = (s?: number) => {
    if (typeof s !== "number") return null;
    if (s <= 0)
      return { label: "Agotado", className: "bg-red-600 text-white" };
    return null; // No mostrar stock bajo ni disponible
  };

  // Etiqueta de descuento (top-left)
  const DiscountBadge = () => {
    if (discountPercent && discountPercent > 0) {
      return (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-30 shadow-md flex flex-col items-center leading-tight">
          <span>-{discountPercent}%</span>
          <span className="text-[10px]">OFF</span>
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
      <div className="group relative block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 transform hover:-translate-y-1 max-w-[300px] mx-auto">
        {/* Imagen con etiquetas */}
        <Link href={targetHref} className="block relative h-48 overflow-hidden flex items-center justify-center bg-white p-4">
          <DiscountBadge />
          <StockBadge />
          <div className="relative w-full h-full">
            <Image 
              src={src} 
              alt={nombre} 
              fill 
              onError={() => setSrc('/images/imagen.webp')} 
              className="object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
        </Link>

        {/* Contenido */}
        <div className="p-4 flex flex-col">
          {/* Nombre del producto - Negrita, centrado */}
          <Link href={targetHref}>
            <h3 className="text-center text-base font-semibold text-gray-900 mb-1 hover:text-[#2e9fdb] transition-colors font-sans">
              {nombre}
            </h3>
          </Link>

        

          {/* Sección de Precios */}
          <div className="mb-4 flex flex-col items-center">
            {discountPercent && discountPercent > 0 && originalPrice ? (
              <>
                {/* Precio Anterior con etiqueta "Antes:" */}
                <p className="text-sm text-gray-400 line-through mb-2">
                  Antes: $ {originalPrice.replace(/COP\s*/, '').trim()}
                </p>
                {/* Precio Actual (Oferta) con badge al lado */}
                <div className="flex items-center gap-2">
                  <p className="text-4xl font-extrabold text-[#008000]">
                    $ {displayPrice.replace(/COP\s*/, '').trim()}
                  </p>
                </div>
              </>
            ) : (
              /* Sin descuento - Precio normal (verde) */
              <p className="text-3xl font-bold text-[#008000] mb-2">
                $ {displayPrice.replace(/COP\s*/, '').trim()}
              </p>
            )}
          </div>

          {/* Disponibilidad - Texto en negro, solo cantidad */}
          {typeof stock === "number" && (
            <p className="text-center text-xs mb-4 text-black">
              Disponible: {stock}
            </p>
          )}

          {/* Botón CTA - Agregar al carrito */}
          <Link
            href={targetHref}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold uppercase rounded-lg text-white bg-[#2e9fdb] hover:bg-[#238ac1] transition duration-150 shadow-sm hover:shadow-md"
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
        className="w-full sm:w-64 h-56 flex-shrink-0 relative overflow-hidden flex items-center justify-center p-4 bg-white"
      >
        <DiscountBadge />
        <StockBadge />
        <div className="relative w-full h-full">
          <Image 
            src={src} 
            alt={nombre} 
            fill 
            onError={() => setSrc('/images/imagen.webp')} 
            className="object-contain transition-transform duration-300 hover:scale-105" 
          />
        </div>
      </Link>

      {/* Contenido */}
      <div className="flex flex-col justify-between p-5 flex-1">
        <div>
          {/* Nombre principal */}
          <Link href={targetHref}>
            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-[#2e9fdb] transition-colors">
              {nombre}
            </h3>
          </Link>

          {/* Categoría */}
          {categoria && (
            <p className="text-sm text-gray-500 mb-3">
              {categoria}
            </p>
          )}

          {/* Sección de Precio */}
          <div className="mb-3">
            {discountPercent && discountPercent > 0 && originalPrice ? (
              <div className="flex flex-col gap-2">
                {/* Precio Anterior con "Antes:" */}
                <p className="text-base text-gray-400 line-through">
                  Antes: $ {originalPrice.replace(/COP\s*/, '').trim()}
                </p>
                {/* Precio Actual con badge al lado */}
                <div className="flex items-center gap-2">
                  <p className="text-4xl font-extrabold text-[#008000]">
                    $ {displayPrice.replace(/COP\s*/, '').trim()}
                  </p>
                </div>
              </div>
            ) : (
              /* Sin descuento (verde) */
              <p className="text-3xl font-bold text-[#008000]">
                $ {displayPrice.replace(/COP\s*/, '').trim()}
              </p>
            )}
          </div>

          {/* Disponibilidad */}
          {typeof stock === "number" && (
            <p className="text-sm mb-3 text-black">
              Disponible: {stock}
            </p>
          )}
        </div>

        {/* Botón */}
        <div className="mt-4">
          <Link
            href={targetHref}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-bold uppercase rounded-lg text-white bg-[#2e9fdb] hover:bg-[#238ac1] transition duration-150 shadow-sm hover:shadow-md"
          >
            Ver más
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

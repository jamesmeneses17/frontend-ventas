"use client";

import React, { useState, useEffect } from "react";
import { getProductos } from "@/components/services/productosService";
import { formatCurrency } from "@/utils/formatters";
import { mapProductToImage, isImageUrl } from "@/utils/ProductUtils";
import Image from "next/image";
import Link from "next/link";

interface ProductWithDiscount {
  id: number;
  nombre: string;
  precioVenta: number;
  precioConDescuento: number;
  descuentoPorcentaje: number;
  imageSrc: string;
  stock: number;
}

const FeaturedProductsWithDiscount: React.FC = () => {
  const [productos, setProductos] = useState<ProductWithDiscount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await getProductos(1, 1000, "");
        let allProducts = response.data || [];

        // Filtrar solo productos con descuento > 0
        const productsWithDiscount = allProducts
          .filter((p: any) => {
            const promo = Number(p.promocion_porcentaje ?? 0);
            return promo > 0;
          })
          .slice(0, 4) // Mostrar solo los primeros 4
          .map((p: any) => {
            const precioVenta = Number(p.precio_venta ?? p.precio ?? 0);
            const descuento = Number(p.promocion_porcentaje ?? 0);
            const precioConDescuento = precioVenta - (precioVenta * descuento) / 100;

            return {
              id: p.id,
              nombre: p.nombre,
              precioVenta,
              precioConDescuento,
              descuentoPorcentaje: descuento,
              imageSrc:
                (p.imagen_url && isImageUrl(p.imagen_url))
                  ? p.imagen_url
                  : mapProductToImage(p.nombre, p.id),
              stock: Number(p.stock ?? 0),
            };
          });

        setProductos(productsWithDiscount);
      } catch (error) {
        console.error("Error al cargar productos con descuento:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) {
    return (
      <section className="py-16 text-center">
        <p className="text-lg text-amber-600">Cargando promociones...</p>
      </section>
    );
  }

  if (productos.length === 0) {
    return null; // No mostrar la sección si no hay productos con descuento
  }

  return (
    <section className="bg-gradient-to-r from-orange-50 to-red-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
            🎉 Promociones Especiales
          </h2>
          <p className="text-xl text-gray-600">
            Aprovecha nuestras mejores ofertas con descuentos increíbles
          </p>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <Link
              key={producto.id}
              href={`/users/especificaciones/${producto.id}`}
            >
              <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col">
                {/* Badge de Descuento (esquina superior izquierda) */}
                <div className="absolute top-3 left-3 z-20 bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center flex-col shadow-lg">
                  <span className="text-2xl font-bold">
                    -{producto.descuentoPorcentaje}%
                  </span>
                  <span className="text-xs font-semibold">OFF</span>
                </div>

                {/* Stock Badge (esquina superior derecha) */}
                {producto.stock <= 0 && (
                  <div className="absolute top-3 right-3 z-20 bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Agotado
                  </div>
                )}

                {/* Imagen */}
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                  <Image
                    src={producto.imageSrc}
                    alt={producto.nombre}
                    fill
                    className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/images/imagen.webp";
                    }}
                  />
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Nombre */}
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-3">
                    {producto.nombre}
                  </h3>

                  {/* Sección de Precios (Diseño E-commerce Profesional) */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border-2 border-orange-200">
                    {/* Precio Original (Tachado) */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 font-medium">
                        Precio Original:
                      </span>
                      <span className="text-lg text-gray-400 line-through font-semibold">
                        {formatCurrency(producto.precioVenta)}
                      </span>
                    </div>

                    {/* Precio con Descuento (Destacado en Verde) */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 font-bold">
                        Ahora:
                      </span>
                      <span className="text-2xl font-extrabold text-green-600">
                        {formatCurrency(producto.precioConDescuento)}
                      </span>
                    </div>

                    {/* Ahorro en dinero */}
                    <div className="mt-2 pt-2 border-t border-orange-200 text-center">
                      <p className="text-sm font-bold text-orange-600">
                        Ahorras:{" "}
                        {formatCurrency(
                          producto.precioVenta - producto.precioConDescuento
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Botón */}
                  <button className="mt-auto w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
                    Ver Detalles
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Botón Ver Todas las Promociones */}
        <div className="mt-12 text-center">
          <Link
            href="/users/productos"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition duration-200"
          >
            Ver todas las promociones →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsWithDiscount;

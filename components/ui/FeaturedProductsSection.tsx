"use client";

import React, { useState, useEffect } from "react";
import { getProductos, Producto as ProductoType } from "@/components/services/productosService";

// Props del componente tarjeta (usa el tipo exportado)
type ProductCardProps = ProductoType & { imageSrc: string; href: string };

// Puedes usar imágenes distintas según categoría o nombre
const mapProductToImage = (nombre: string): string => {
  const slug = nombre.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-');

  switch (true) {
    case slug.includes("panel"):
      return "/images/panel.webp";
    case slug.includes("bateria"):
      return "/images/bateria.webp";
    case slug.includes("controlador"):
      return "/images/controladores.webp";
    case slug.includes("inversor"):
      return "/images/inversor.webp";
    default:
      return "/images/imagen.webp";
  }
};

// Tarjeta visual (misma estructura que CategoryCard)
const ProductCard: React.FC<ProductCardProps> = ({ nombre, precios, imageSrc, href }) => {
  const valor = precios?.[0]?.valor_unitario ?? 0;

  return (
    <a
      href={href}
      className="group relative block rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
    >
      <img
        className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition duration-300"
        src={imageSrc}
        alt={nombre}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

      <div className="relative p-6 pt-40 flex flex-col justify-end h-full">
        <div className="flex items-center space-x-2 text-white mb-2">
          <svg
            className="w-5 h-5 text-amber-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zM5.5 10a.5.5 0 01.5-.5h8a.5.5 0 010 1h-8a.5.5 0 01-.5-.5z" />
          </svg>
          <h3 className="text-xl font-bold">{nombre}</h3>
        </div>

        <p className="text-lg font-semibold text-amber-400">
          ${valor.toLocaleString("es-CO")}
        </p>
      </div>
    </a>
  );
};

const FeaturedProductsSection: React.FC = () => {
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const data = await getProductos();
        setProductos(data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Mostrar solo 4 productos
  const displayedProducts = productos.slice(0, 4).map((p) => ({
    ...p,
    imageSrc: mapProductToImage(p.nombre),
    href: `/producto/${p.id}`,
  }));

  if (loading) {
    return (
      <section className="py-16 text-center">
        <p className="text-lg text-amber-600">Cargando productos...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 text-center">
        <p className="text-lg text-red-600">
          Error al cargar los productos. Intente de nuevo más tarde.
        </p>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Productos Destacados
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestros productos más vendidos y recomendados.
          </p>
        </div>

        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">
            No hay productos disponibles por ahora.
          </p>
        )}

        {productos.length > 4 && (
          <div className="mt-12 text-center">
            <a
              href="/productos"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-amber-600 hover:bg-amber-700 transition duration-150"
            >
              Ver todos los productos →
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;

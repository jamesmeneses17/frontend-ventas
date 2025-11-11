// /components/ui/FeaturedProductsSection.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  getProductos,
  Producto as ProductoType,
} from "@/components/services/productosService";
import { createSlug } from "@/utils/slug"; // Importamos la utilidad
import { mapProductToImage } from '@/utils/ProductUtils';
import ImageLinkCard from "./ImageLinkCard";
import ProductCard from "./ProductCard";

// --- Tipos ---

// Props del componente tarjeta (usa el tipo exportado)
type ProductCardProps = ProductoType & {
  imageSrc: string;
  href: string;
  displayPrice: string;
};

// --- Utilidad de Mapeo de Imagenes (Usa el Slug) ---

// Usaremos la función centralizada `mapProductToImage` importada desde utils

// --- Formato de Precio (para usar dentro de ProductCard) ---

const formatPrice = (priceStr: string | number | undefined): string => {
  // 1. Convertir a número, usando 0 como fallback
  const priceNum = parseFloat(String(priceStr || 0));

  // 2. Si es 0 o NaN, retorna un mensaje
  if (isNaN(priceNum) || priceNum === 0) {
    return "Precio no disponible";
  }

  // 3. Formato de moneda
  return priceNum.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
};

// --- Componente de Tarjeta (ProductCard) ---

// --- Componente de Sección Destacada (FeaturedProductsSection) ---

const FeaturedProductsSection: React.FC = () => {
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
  const response = await getProductos();
  setProductos(response.data);
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
  const displayedProducts = productos.slice(0, 4).map((p) => {
    // Preferir valor_final (precio final) si viene en la relación `precios`,
    // luego valor_unitario y por último campos en el producto mismo.
  const priceValue = (p as any).precios?.[0]?.valor_final ?? (p as any).precios?.[0]?.valor_unitario ?? (p as any).precio ?? (p as any).precio_costo;
    const displayPrice = formatPrice(priceValue);

    return {
      ...p,
      imageSrc: mapProductToImage(p.nombre, p.id),
      // 🛑 La URL de producto es por ID, no requiere slugging del nombre
      href: `/producto/${p.id}`,
      displayPrice: displayPrice,
    };
  });

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
            Nuestros Productos
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestros productos más vendidos y recomendados.
          </p>
        </div>

        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                nombre={product.nombre}
                displayPrice={product.displayPrice}
                imageSrc={product.imageSrc}
                href={product.href}
                stock={Number((product as any).stock) || 0}
                categoria={(product as any).categoria?.nombre || (product as any).categoria || undefined}
                discountPercent={Number((product as any).precios?.[0]?.descuento_porcentaje ?? (product as any).precios?.[0]?.descuento ?? 0) || undefined}
                salesCount={Number((product as any).ventas ?? (product as any).sales ?? 0) || undefined}
              />
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
              href="users/categorias"
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

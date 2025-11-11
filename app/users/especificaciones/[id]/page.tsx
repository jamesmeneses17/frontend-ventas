// /app/users/especificaciones/[id]/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import PublicLayout from "../../../../components/layout/PublicLayout";
import Link from "next/link";
import {
  Zap,
  Tag,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  ChevronRight,
  Calculator,
  MapPin,
  Phone,
} from "lucide-react";
import { getProductoById, Producto } from "@/components/services/productosService";
import { mapProductToImage } from '@/utils/ProductUtils';

// ----------------------------------------------------------------------
// COMPONENTES AUXILIARES
// ----------------------------------------------------------------------

const Breadcrumb = ({
  productName,
  categoryName,
}: {
  productName: string;
  categoryName?: string;
}) => (
  <nav className="flex mb-4 text-sm" aria-label="Breadcrumb">
    <ol role="list" className="flex items-center space-x-2 text-gray-500">
      <li>
        <Link href="/" className="hover:text-[#2e9fdb]">
          Inicio
        </Link>
      </li>
      <li className="flex items-center">
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <Link href="/users/productos" className="ml-2 hover:text-[#2e9fdb]">
          {categoryName ?? "Productos"}
        </Link>
      </li>
      <li className="flex items-center">
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="ml-2 font-medium text-gray-700 truncate max-w-xs">
          {productName}
        </span>
      </li>
    </ol>
  </nav>
);

const QuickInfo = ({
  stock,
  referencia,
  descuento,
}: {
  stock: number;
  referencia: string;
  descuento?: number;
}) => {
  const stockState =
    stock > 10
      ? { icon: CheckCircle, label: "Disponible", color: "text-green-600" }
      : stock > 0
      ? { icon: Clock, label: `Últimas ${stock} unidades`, color: "text-yellow-600" }
      : { icon: XCircle, label: "Agotado", color: "text-red-600" };

  return (
    <div className="space-y-2 text-sm text-gray-600 border-t border-b py-3 my-4">
      <div className="flex items-center space-x-2">
        {(() => {
          const Icon = stockState.icon;
          return <Icon className={`w-5 h-5 ${stockState.color}`} />;
        })()}
        <span className={`font-semibold ${stockState.color}`}>
          {stockState.label}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Package className="w-5 h-5 text-gray-400" />
        <span>
          Referencia:{" "}
          <span className="font-semibold text-gray-800">
            {referencia ?? "N/A"}
          </span>
        </span>
      </div>
      {descuento && descuento > 0 && (
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-red-600" />
          <span className="font-bold text-red-600">
            ¡{descuento}% de Descuento!
          </span>
        </div>
      )}
    </div>
  );
};

const QuotationForm = () => (
  <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl shadow-lg sticky top-8">
    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
      <Calculator className="w-6 h-6 mr-2 text-[#2e9fdb]" />
      Solicita tu Cotización
    </h3>
    <p className="text-gray-600 mb-4">
      ¿Tienes preguntas sobre este producto o necesitas una solución personalizada?
    </p>

    <form className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre Completo
        </label>
        <input
          type="text"
          id="name"
          placeholder="Tu nombre"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2e9fdb] focus:ring-[#2e9fdb] p-2 border"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono/WhatsApp
        </label>
        <input
          type="tel"
          id="phone"
          placeholder="+57 3XX XXX XX XX"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2e9fdb] focus:ring-[#2e9fdb] p-2 border"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Mensaje (Opcional)
        </label>
        <textarea
          id="message"
          rows={3}
          placeholder="Quiero cotizar 10 unidades..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2e9fdb] focus:ring-[#2e9fdb] p-2 border"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent shadow-sm 
          text-lg font-medium rounded-lg text-white 
          bg-[#e75e55] hover:bg-[#c9453c] focus:outline-none 
          focus:ring-2 focus:ring-offset-2 focus:ring-[#e75e55] 
          transition duration-150 ease-in-out"
      >
        <Zap className="w-5 h-5 mr-2" />
        Solicitar Cotización Rápida
      </button>
    </form>

    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
      <p className="flex items-center">
        <MapPin className="w-4 h-4 mr-2" /> Atendemos a toda Colombia.
      </p>
      <p className="flex items-center">
        <Phone className="w-4 h-4 mr-2" /> Contacto: +57 320 000 0000
      </p>
    </div>
  </div>
);

// ----------------------------------------------------------------------
// CONTENIDO PRINCIPAL
// ----------------------------------------------------------------------

function ProductDetailPageContent({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = parseInt(productId, 10);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const p = await getProductoById(id);
        setProduct(p);
      } catch (err) {
        console.error("Error al cargar producto id=", id, err);
        setError("No fue posible cargar el producto.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="text-center py-20 text-gray-500">
          Cargando detalles del producto...
        </div>
      </PublicLayout>
    );
  }

  if (error || !product) {
    return (
      <PublicLayout>
        <div className="text-center py-20 text-red-600">
          {error ?? "Producto no encontrado."}
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb productName={product.nombre} categoryName={product.categoria?.nombre} />

          <div className="lg:grid lg:grid-cols-3 lg:gap-x-12">
            {/* Columna izquierda (2/3): detalles */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
                {product.nombre}
              </h1>
              <p className="text-xl text-[#e75e55] font-bold mb-4">
                {product.precio ? `$ ${product.precio}` : "Consultar Precio"}
              </p>

              <QuickInfo
                stock={product.stock ?? 0}
                referencia={product.codigo ?? "N/A"}
                descuento={(product as any).descuento ?? 0}
              />

              <div className="mt-6 mb-8 rounded-xl overflow-hidden shadow-2xl">
                {(() => {
                  const possibleImage =
                    (product as any).ficha_tecnica_url ||
                    (product as any).image ||
                    (product as any).imagen ||
                    (product as any).imagenes?.[0]?.url ||
                    (product as any).images?.[0]?.url ||
                    mapProductToImage(product.nombre, product.id) ||
                    "/images/placeholder.webp";

                  return (
                    <img
                      src={possibleImage}
                      alt={product.nombre}
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.onerror = null;
                        img.src = "/images/placeholder.webp";
                      }}
                    />
                  );
                })()}
              </div>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b pb-2">
                  Descripción General
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {(product as any).descripcion ?? product.descripcion}
                </p>
              </section>

              {(product as any).ficha_tecnica && (
                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                    Especificaciones Técnicas
                  </h2>
                  <div className="bg-gray-50 rounded-lg overflow-hidden shadow-inner">
                    <dl className="divide-y divide-gray-200">
                      {Object.entries((product as any).ficha_tecnica).map(([key, value], index) => (
                        <div
                          key={index}
                          className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4"
                        >
                          <dt className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/_/g, " ")}
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-semibold">
                            {String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </section>
              )}
            </div>

            {/* Columna derecha */}
            <div className="lg:col-span-1 mt-10 lg:mt-0">
              <QuotationForm />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

// ----------------------------------------------------------------------
// EXPORT DEFAULT
// ----------------------------------------------------------------------

export default function ProductByIdPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20 text-gray-500">
          Cargando detalle del producto...
        </div>
      }
    >
      <ProductDetailPageContent productId={params.id} />
    </Suspense>
  );
}

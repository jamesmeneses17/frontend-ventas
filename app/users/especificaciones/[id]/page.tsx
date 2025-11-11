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
import { mapProductToImage } from '@/utils/ProductUtils'; // Asumo que esta función existe

// ----------------------------------------------------------------------
// COMPONENTES AUXILIARES
// ----------------------------------------------------------------------

// 1. Cabecera de Migas de Pan (Breadcrumb)
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

// 2. Información Rápida (Stock, Referencia, etc.)
const QuickInfo = ({
  stock,
  referencia,
  descuento,
  categoryName,
  categoryId,
}: {
  stock: number;
  referencia: string;
  descuento?: number;
  categoryName?: string | null;
  categoryId?: number | null;
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
      {categoryName && (
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-gray-400" />
          <span>
            Categoría: {" "}
            {categoryId ? (
              <Link href={`/users/productos?categoriaId=${categoryId}`} className="font-semibold text-gray-800 hover:text-[#2e9fdb]">
                {categoryName}
              </Link>
            ) : (
              <span className="font-semibold text-gray-800">{categoryName}</span>
            )}
          </span>
        </div>
      )}
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



// 4. Especificaciones Técnicas (Extraído para reutilizar en columna derecha)
const SpecificationsTable = ({ fichaTecnica }: { fichaTecnica: Record<string, any> }) => (
    <section className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
            Ficha Técnica
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <dl className="divide-y divide-gray-200">
            {Object.entries(fichaTecnica).map(([key, value], index) => (
                <div
                key={index}
                className="px-4 py-2 sm:grid sm:grid-cols-2 sm:gap-4 text-sm"
                >
                <dt className="font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, " ")}
                </dt>
                <dd className="mt-1 text-gray-900 sm:col-span-1 sm:mt-0 font-semibold">
                    {String(value)}
                </dd>
                </div>
            ))}
            </dl>
        </div>
    </section>
);


// ----------------------------------------------------------------------
// CONTENIDO PRINCIPAL
// ----------------------------------------------------------------------

function ProductDetailPageContent({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = parseInt(productId, 10);

  // NOTE: Se recomienda que usemos un hook personalizado para manejar la carga de datos
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Usamos el servicio de productos real (asumido)
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

  // Lógica para obtener la URL de la imagen
  const imageUrl =
    (product as any).ficha_tecnica_url ||
    (product as any).image ||
    (product as any).imagen ||
    (product as any).imagenes?.[0]?.url ||
    (product as any).images?.[0]?.url ||
    mapProductToImage(product.nombre, product.id) ||
    "/images/placeholder.webp";

  // Desestructuración de campos
  const { nombre, precio, stock, codigo, categoria } = product;
  const descripcion = (product as any).descripcion_larga ?? (product as any).descripcion ?? "Sin descripción disponible.";
  const descuento = (product as any).descuento ?? 0;
  const fichaTecnica = (product as any).ficha_tecnica;


  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          
          <Breadcrumb productName={nombre} categoryName={categoria?.nombre} />

          {/* AJUSTE CLAVE: Cambiamos de lg:grid-cols-3 a lg:grid-cols-2 */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
            
            {/* Columna 1 (1/2): Imagen Principal */}
            <div className="lg:col-span-1 mb-8 lg:mb-0">
                <div className="rounded-xl overflow-hidden shadow-2xl sticky top-4">
                    <img
                        src={imageUrl}
                        alt={nombre}
                        className="w-full h-auto object-cover max-h-[600px] lg:max-h-full" // Ajuste de altura máxima
                        onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            img.onerror = null;
                            img.src = "/images/placeholder.webp";
                        }}
                    />
                </div>
            </div>

            {/* Columna 2 (1/2): Título, Info, Descripción y Especificaciones */}
            <div className="lg:col-span-1 mt-8 lg:mt-0">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
                    {nombre}
                </h1>
                <p className="text-xl text-[#e75e55] font-bold mb-4">
                    {precio ? `$ ${precio}` : "Consultar Precio"}
                </p>

                <QuickInfo
                    stock={stock ?? 0}
          referencia={codigo ?? "N/A"}
          descuento={descuento}
          categoryName={categoria?.nombre}
          categoryId={categoria?.id}
                />

                {/* Sección de Descripción General */}
                <section className="mt-8 mb-10">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b pb-2">
                        Descripción General
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {descripcion}
                    </p>
                </section>

                {/* Especificaciones Técnicas (ahora agrupadas con el resto de detalles) */}
                {fichaTecnica && Object.keys(fichaTecnica).length > 0 && (
                    <SpecificationsTable fichaTecnica={fichaTecnica} />
                )}
                
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
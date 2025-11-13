"use client";

import React, { useEffect, useState, Suspense } from "react";
import PublicLayout from "../../../../components/layout/PublicLayout";
import Link from "next/link";
import {
  Tag,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  ChevronRight,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import { getProductoById, Producto } from "@/components/services/productosService";
import { mapProductToImage } from "@/utils/ProductUtils";
import { useCart } from "../../../../components/hooks/CartContext";

// ----------------------------------------------------------------------
// COMPONENTES AUXILIARES
// ----------------------------------------------------------------------

// 🧭 1. Breadcrumb
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

// 📦 2. Información rápida
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
            Categoría:{" "}
            {categoryId ? (
              <Link
                href={`/users/productos?categoriaId=${categoryId}`}
                className="font-semibold text-gray-800 hover:text-[#2e9fdb]"
              >
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

// ⚙️ 3. Especificaciones Técnicas
const SpecificationsTable = ({
  fichaTecnica,
}: {
  fichaTecnica: Record<string, any>;
}) => (
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
  const [quantity, setQuantity] = useState(1);
  const id = parseInt(productId, 10);


  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Validar id antes de llamar al servicio
        if (Number.isNaN(id) || id <= 0) {
          throw new Error(`ID de producto inválido: ${String(id)}`);
        }

        const p = await getProductoById(id);
        setProduct(p);
      } catch (err) {
        console.error("Error al cargar producto id=", id, err);
        // Mostrar mensaje más específico si el id es inválido
        if (err instanceof Error && /ID de producto inválido/.test(err.message)) {
          setError(err.message);
        } else {
          setError("No fue posible cargar el producto. Revisa la conexión al backend o la existencia del producto.");
        }
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

   const imageUrl =
    (product as any).image ||
    (product as any).imagen ||
    (product as any).imagenes?.[0]?.url ||
    mapProductToImage(product.nombre, product.id) ||
    "/images/placeholder.webp";

  const { nombre, precio, stock, codigo, categoria } = product;
  const descripcion =
    (product as any).descripcion_larga ??
    (product as any).descripcion ??
    "Sin descripción disponible.";
  const descuento = (product as any).descuento ?? 0;
  const fichaTecnica = (product as any).ficha_tecnica;
  // Asegurarnos de trabajar con valores numéricos
  const precioNum = Number(precio) || 0;
  const descuentoNum = Number(descuento) || 0;
  const precioFinal = descuentoNum > 0 ? precioNum * (1 - descuentoNum / 100) : precioNum;
  const subtotalNum = precioFinal * Number(quantity || 0);
  const subtotalDisplay = subtotalNum.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });

  // Producto mapeado listo para agregar al carrito (sin quantity)
  const productToAddBase = product ? {
    id: product.id,
    nombre: product.nombre,
    precio: precioNum,
    descuento: descuentoNum,
    imageUrl: imageUrl,
    stock: stock || 0,
    moneda: 'COP',
  } : null;

  // Botón que usa el contexto del carrito. Debe renderizarse DENTRO del CartProvider.
  const AddToCartButton = ({ disabled }: { disabled: boolean }) => {
    const { addToCart } = useCart();
    const handle = () => {
      if (!productToAddBase) return;
      if (quantity > 0 && productToAddBase.stock > 0) {
        addToCart(productToAddBase, quantity);
        console.log(`🛒 ${quantity} unidad(es) de "${productToAddBase.nombre}" agregadas al carrito.`);
        setQuantity(1);
      } else {
        console.warn('No se puede agregar al carrito: producto agotado o cantidad inválida.');
      }
    };
    return (
      <button
        onClick={handle}
        disabled={disabled}
        className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-300 ${
          disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2e9fdb] hover:bg-[#2388c5]'
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
        <span>Agregar al Carrito</span>
      </button>
    );
  };

  return (
    <PublicLayout>
      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb productName={nombre} categoryName={categoria?.nombre} />

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
            {/* 🖼️ Imagen */}
            <div className="lg:col-span-1 mb-8 lg:mb-0">
              <div className="rounded-xl overflow-hidden shadow-2xl sticky top-4">
                <img
                  src={imageUrl}
                  alt={nombre}
                  className="w-full h-auto object-cover max-h-[600px]"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.onerror = null;
                    img.src = "/images/placeholder.webp";
                  }}
                />
              </div>
            </div>

            {/* 📄 Detalles */}
            <div className="lg:col-span-1 mt-8 lg:mt-0">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
                {nombre}
              </h1>
              <p className="text-xl text-[#e75e55] font-bold mb-4">
                {precio ? `$ ${precioFinal.toLocaleString()}` : "Consultar Precio"}
                {descuento > 0 && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    ${precio.toLocaleString()}
                  </span>
                )}
              </p>

              <QuickInfo
                stock={stock ?? 0}
                referencia={codigo ?? "N/A"}
                descuento={descuento}
                categoryName={categoria?.nombre}
                categoryId={categoria?.id}
              />

              {/* 🧮 Selector de Cantidad + Subtotal + Botón */}
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center space-x-4 mb-4">
                  <label htmlFor="quantity" className="text-sm font-semibold text-gray-700">
                    Cantidad:
                  </label>
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      aria-label="Disminuir cantidad"
                      onClick={() => {
                        setQuantity((prev) => {
                          const next = Number(prev || 1) - 1;
                          return Math.max(1, next);
                        });
                      }}
                      disabled={quantity <= 1}
                      className="px-3 py-2 bg-white hover:bg-gray-100 disabled:opacity-50"
                    >
                      −
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      step={1}
                      min={1}
                      max={stock ?? 99}
                      value={quantity}
                      onChange={(e) => {
                        const v = parseInt(e.target.value as string, 10);
                        const sanitized = Number.isNaN(v) ? 1 : v;
                        // Respetar rango entre 1 y stock (si stock definido)
                        if (typeof stock === "number") {
                          setQuantity(Math.max(1, Math.min(sanitized, stock)));
                        } else {
                          setQuantity(Math.max(1, sanitized));
                        }
                      }}
                      className="w-20 text-center border-l border-r p-2 focus:ring-[#2e9fdb] focus:border-[#2e9fdb]"
                    />
                    <button
                      type="button"
                      aria-label="Aumentar cantidad"
                      onClick={() => {
                        setQuantity((prev) => {
                          const next = Number(prev || 1) + 1;
                          if (typeof stock === "number") return Math.min(next, stock);
                          return next;
                        });
                      }}
                      disabled={typeof stock === "number" && quantity >= stock}
                      className="px-3 py-2 bg-white hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-lg font-bold text-gray-800 mb-4">
                  Subtotal: {" "}
                  <span className="text-[#2e9fdb]">{subtotalDisplay}</span>
                </div>

                <AddToCartButton disabled={stock === 0} />
              </div>

              {/* 🧾 Descripción */}
              <section className="mt-10 mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-3 border-b pb-2">
                  Descripción General
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {descripcion}
                </p>
              </section>

              {/* ⚙️ Ficha técnica */}
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

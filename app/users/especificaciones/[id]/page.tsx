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
  Truck,
  ShieldCheck,
  Award,
} from "lucide-react";
import { getProductoById, Producto } from "@/components/services/productosService";
import Image from 'next/image';
import { mapProductToImage, isImageUrl } from "@/utils/ProductUtils";
import { formatCurrency } from '@/utils/formatters';
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
    stock > 0
      ? { icon: CheckCircle, label: `Disponible: ${stock}`, color: "text-green-600" }
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
          Codigo:{" "}
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

// ----------------------------------------------------------------------
// CONTENIDO PRINCIPAL
// ----------------------------------------------------------------------

function ProductDetailPageContent({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const id = parseInt(productId, 10);

  // Estado para la galería de imágenes
  const [selectedImage, setSelectedImage] = useState<string>("/images/imagen.webp");
  const [imagenesProducto, setImagenesProducto] = useState<string[]>([]);
  // Estado para el zoom tipo lupa
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [zoomStyle, setZoomStyle] = useState({});


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

  useEffect(() => {
    if (!product) return;
    
    console.log('[EspecificacionesPage] Producto cargado:', product);
    
    // Construir array de imágenes del producto
    const imagenes: string[] = [];
    
    // Si tiene array de imagenes (nuevo backend)
    if ((product as any).imagenes && Array.isArray((product as any).imagenes)) {
      console.log('[EspecificacionesPage] Imágenes del array:', (product as any).imagenes);
      (product as any).imagenes.forEach((img: any) => {
        if (img.url_imagen) {
          imagenes.push(img.url_imagen);
          console.log('[EspecificacionesPage] Imagen agregada:', img.url_imagen);
        }
      });
    }
    
    // Fallback a imagen_url antigua si no hay imagenes
    const candidate = (product as any).imagen_url || (product as any).image || (product as any).imagen;
    if (candidate && !imagenes.includes(candidate)) {
      console.log('[EspecificacionesPage] Usando imagen_url fallback:', candidate);
      imagenes.push(candidate);
    }
    
    // Si no hay ninguna imagen, usar placeholder
    if (imagenes.length === 0) {
      const fallbackImage = mapProductToImage(product.nombre, product.id) || "/images/imagen.webp";
      console.log('[EspecificacionesPage] Usando placeholder:', fallbackImage);
      imagenes.push(fallbackImage);
    }
    
    console.log('[EspecificacionesPage] Array de imágenes final:', imagenes);
    setImagenesProducto(imagenes);
    setSelectedImage(imagenes[0]);
  }, [product]);

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


  const { nombre, precio, stock, codigo } = product;
  const categoria = (product as any).categoria ?? { id: 0, nombre: "Sin categoría" };
  const descripcion =
    (product as any).descripcion_larga ??
    (product as any).descripcion ??
    "Sin descripción disponible.";
  // Priorizar promocion_porcentaje como en useProductListLogic
  const descuento = (product as any).promocion_porcentaje ?? (product as any).descuento ?? 0;
  const fichaTecnica = (product as any).ficha_tecnica;
  // Asegurarnos de trabajar con valores numéricos
  const precioNum = Number(precio) || 0;
  const descuentoNum = Number(descuento) || 0;
  const precioFinal = descuentoNum > 0 ? precioNum * (1 - descuentoNum / 100) : precioNum;
  const subtotalNum = precioFinal * Number(quantity || 0);
  const subtotalDisplay = formatCurrency(subtotalNum, 'COP');

  // Producto mapeado listo para agregar al carrito (sin quantity)
  const productToAddBase = product ? {
    id: product.id,
    nombre: product.nombre,
    precio: precioNum,
    descuento: descuentoNum,
    codigo: codigo ?? (product as any).codigo ?? '',
    imageUrl: selectedImage,
    stock: stock || 0,
    moneda: 'COP',
  } : null;

  // Botón que usa el contexto del carrito. Debe renderizarse DENTRO del CartProvider.
  const AddToCartButton = ({ disabled }: { disabled: boolean }) => {
    const { addToCart } = useCart();
    const handle = () => {
      if (!productToAddBase) return;
      if (quantity <= 0) {
        alert('Cantidad inválida.');
        return;
      }

      // Si no hay stock, impedir agregar
      if (productToAddBase.stock <= 0) {
        alert('Producto agotado. No es posible agregar al carrito.');
        return;
      }

      // Si la cantidad excede el stock, ajustar y avisar
      if (quantity > productToAddBase.stock) {
        alert(`La cantidad solicitada (${quantity}) excede el stock disponible (${productToAddBase.stock}). Se ajustará a la cantidad máxima disponible.`);
        addToCart(productToAddBase, productToAddBase.stock);
        console.log(`🛒 ${productToAddBase.stock} unidad(es) de "${productToAddBase.nombre}" agregadas al carrito (ajustado por stock).`);
        setQuantity(1);
        return;
      }

      // Agregar cantidad válida
      addToCart(productToAddBase, quantity);
      console.log(`🛒 ${quantity} unidad(es) de "${productToAddBase.nombre}" agregadas al carrito.`);
      setQuantity(1);
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

  // Resolver posibles ubicaciones del URL de la ficha técnica en el objeto product
  const resolveFichaUrl = (p: any): string | undefined => {
    if (!p) return undefined;
    const candidates = [
      p.ficha_tecnica_url,
      p.ficha_tecnica?.url,
      p.ficha_tecnica?.file,
      p.ficha_tecnica,
      p.fichaTecnicaUrl,
      p.fichaTecnica?.url,
      p.ficha_tecnica_url_web,
    ];
    for (const c of candidates) {
      if (!c) continue;
      const s = String(c).trim();
      // simple check para url o ruta relativa
      if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) return s;
      // si parece terminar en pdf o docx también lo aceptamos
      if (/\.pdf$|\.docx$|\.doc$|\.xlsx$/i.test(s)) return s;
    }
    return undefined;
  };

  // 🧾 Acciones relacionadas con la ficha técnica (ver / descargar)
  const FichaActions = ({ url, productId }: { url?: string; productId?: number }) => {
    const hasUrl = !!url;
    const safeUrl = hasUrl ? String(url) : undefined;
    const isPdf = hasUrl && safeUrl!.toLowerCase().endsWith(".pdf");
    // extraer nombre de archivo para el atributo download si es posible
    let filename: string | undefined;
    if (hasUrl) {
      try {
        const parts = safeUrl!.split("/");
        const last = parts[parts.length - 1];
        if (last) filename = decodeURIComponent(last.split("?")[0]);
      } catch (e) {
        filename = undefined;
      }
    }

    return (
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-3 sm:space-y-0">
        {productId ? (
          <Link
            href={`/users/especificaciones/${productId}/ficha`}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg text-sm font-semibold text-[#2e9fdb] bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v14" stroke="#2e9fdb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 9l7-7 7 7" stroke="#2e9fdb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Ver Ficha Técnica</span>
          </Link>
        ) : (
          <a
            href={hasUrl ? safeUrl : '#'}
            target={hasUrl ? '_blank' : undefined}
            rel={hasUrl ? 'noopener noreferrer' : undefined}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg text-sm font-semibold text-[#2e9fdb] bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v14" stroke="#2e9fdb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 9l7-7 7 7" stroke="#2e9fdb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Ver Ficha Técnica</span>
          </a>
        )}

        {hasUrl ? (
          <a
            href={safeUrl}
            download={filename ?? undefined}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2e9fdb] hover:bg-[#2388c5]"
            rel="noopener noreferrer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 10l5 5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Descargar Ficha</span>
          </a>
        ) : null}
      </div>
    );
  };

  // ✨ Pequeña fila con íconos de características (envío, garantía, calidad)
  const ProductExtras = () => (
    <div className="mt-6 grid grid-cols-3 gap-3 text-sm text-gray-600">
      <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
        <Truck className="w-6 h-6 text-[#2e9fdb]" />
        <div>
          <div className="font-semibold text-gray-800">Envío Nacional</div>
          <div className="text-xs">A todo Colombia</div>
        </div>
      </div>
      <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
        <ShieldCheck className="w-6 h-6 text-[#2e9fdb]" />
        <div>
          <div className="font-semibold text-gray-800">Garantía</div>
          <div className="text-xs">Producto certificado</div>
        </div>
      </div>
      <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
        <Award className="w-6 h-6 text-[#2e9fdb]" />
        <div>
          <div className="font-semibold text-gray-800">Calidad</div>
          <div className="text-xs">100% Original</div>
        </div>
      </div>
    </div>
  );

  return (
    <PublicLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-8">
          <Breadcrumb productName={nombre} categoryName={categoria?.nombre} />

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              {/* 🖼️ GALERÍA DE IMÁGENES - LADO IZQUIERDO */}
              <div className="p-6 lg:p-8 flex flex-col">
                <div className="flex gap-4">
                  {/* Miniaturas Verticales */}
                  {imagenesProducto.length > 1 && (
                    <div className="flex flex-col gap-2 order-first">
                      {imagenesProducto.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(img)}
                          className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden transition-all duration-200 hover:border-[#2e9fdb] flex-shrink-0 ${
                            selectedImage === img 
                              ? 'border-[#2e9fdb] ring-2 ring-[#2e9fdb]/30' 
                              : 'border-gray-200'
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${nombre} - Vista ${index + 1}`}
                            fill
                            className="object-contain p-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/imagen.webp';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Imagen Principal */}
                  <div
                    className="relative flex-1 h-80 bg-white rounded-xl border-2 border-gray-100 overflow-hidden group"
                    style={{ cursor: zoomActive ? 'zoom-out' : 'zoom-in' }}
                    onMouseMove={e => {
                      if (!zoomActive) return;
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      setZoomPosition({ x, y });
                      setZoomStyle({
                        transform: `scale(2)`,
                        transformOrigin: `${x}% ${y}%`,
                        transition: 'transform 0.2s',
                        zIndex: 10,
                      });
                    }}
                    onMouseEnter={e => {
                      setZoomActive(true);
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      setZoomPosition({ x, y });
                      setZoomStyle({
                        transform: `scale(2)`,
                        transformOrigin: `${x}% ${y}%`,
                        transition: 'transform 0.2s',
                        zIndex: 10,
                      });
                    }}
                    onMouseLeave={() => {
                      setZoomActive(false);
                      setZoomStyle({ transform: 'scale(1)', transition: 'transform 0.2s' });
                    }}
                  >
                    <Image
                      src={selectedImage}
                      alt={nombre}
                      fill
                      className="object-contain p-4 transition-transform duration-200"
                      style={zoomActive ? zoomStyle : { transform: 'scale(1)', transition: 'transform 0.2s' }}
                      onError={() => setSelectedImage('/images/imagen.webp')}
                    />
                    {descuento > 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        -{descuentoNum}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Características Rápidas - Horizontal */}
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
                    <Truck className="w-5 h-5 text-[#2e9fdb] mb-1" />
                    <div className="text-xs font-semibold text-gray-800 text-center">Envío Nacional</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-green-600 mb-1" />
                    <div className="text-xs font-semibold text-gray-800 text-center">Garantía</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600 mb-1" />
                    <div className="text-xs font-semibold text-gray-800 text-center">100% Original</div>
                  </div>
                </div>
              </div>

              {/* 📄 INFORMACIÓN DEL PRODUCTO - LADO DERECHO */}
              <div className="p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white">
                {/* Título y Precio */}
                <div className="mb-6">
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                    {nombre}
                  </h1>
                  
                  {/* Precio */}
                  <div className="mb-6">
                    {precio ? (
                      <div className="space-y-2">
                        {descuento > 0 && (
                          <div className="flex items-center gap-3">
                            <p className="text-xl text-gray-500 line-through">
                              ${Number(precio).toLocaleString('es-CO')}
                            </p>
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                              ¡Ahorra {descuentoNum}%!
                            </span>
                          </div>
                        )}
                        <p className="text-4xl font-extrabold text-[#008000] flex items-baseline gap-2">
                          ${Number(precioFinal).toLocaleString('es-CO')}
                          <span className="text-lg font-normal text-gray-500">COP</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-2xl font-semibold text-gray-600">Cotizar</p>
                    )}
                  </div>

                  <QuickInfo
                    stock={stock ?? 0}
                    referencia={codigo ?? "N/A"}
                    descuento={0}
                    categoryName={categoria?.nombre}
                    categoryId={categoria?.id}
                  />
                </div>

             

                {/* Selector de Cantidad */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Cantidad:
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
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
                        className="px-4 py-3 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                      >
                        −
                      </button>
                      <input
                        id="quantity"
                        type="number"
                        step={1}
                        min={1}
                        value={quantity}
                        onChange={(e) => {
                          const v = parseInt(e.target.value as string, 10);
                          const sanitized = Number.isNaN(v) ? 1 : v;
                          if (sanitized < 1) {
                            setQuantity(1);
                          } else {
                            setQuantity(sanitized);
                          }
                        }}
                        className="w-20 text-center border-l-2 border-r-2 border-gray-300 py-3 text-lg font-semibold focus:ring-2 focus:ring-[#2e9fdb] focus:border-[#2e9fdb]"
                      />
                      <button
                        type="button"
                        aria-label="Aumentar cantidad"
                        onClick={() => {
                          setQuantity((prev) => {
                            const next = Number(prev || 1) + 1;
                            return next;
                          });
                        }}
                        className="px-4 py-3 bg-white hover:bg-gray-100 font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-sm text-gray-600">Subtotal:</div>
                      <div className="text-2xl font-bold text-[#2e9fdb]">{subtotalDisplay}</div>
                    </div>
                  </div>
                </div>

                {/* Botón Agregar al Carrito */}
                <div className="mb-6">
                  <AddToCartButton disabled={stock === 0} />
                </div>

                {/* Acciones de Ficha Técnica */}
                <div className="border-t pt-6">
                  <FichaActions url={resolveFichaUrl(product)} productId={product?.id} />
                </div>
              </div>
            </div>

            {/* SECCIONES ADICIONALES - ANCHO COMPLETO */}
            <div className="border-t bg-white">
              <div className="p-6 lg:p-8">
                {/* 🧾 Descripción Completa */}
                <section className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#2e9fdb] rounded"></span>
                    Descripción Detallada
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {descripcion}
                    </p>
                  </div>
                </section>

                {/* ⚙️ Ficha Técnica */}
                {fichaTecnica && Object.keys(fichaTecnica).length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-[#2e9fdb] rounded"></span>
                      Especificaciones Técnicas
                    </h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                      <dl className="divide-y divide-gray-200">
                        {Object.entries(fichaTecnica).map(([key, value], index) => (
                          <div
                            key={index}
                            className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-white transition-colors"
                          >
                            <dt className="text-sm font-semibold text-gray-700 capitalize">
                              {key.replace(/_/g, " ")}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                              {String(value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </section>
                )}
              </div>
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

"use client";

import React, { useEffect, useState, useRef } from "react";
import PublicLayout from "../../../../../components/layout/PublicLayout";
import { getProductoById, Producto } from "@/components/services/productosService";
import Link from "next/link";
import { formatCurrency } from '@/utils/formatters';
// No usar PdfViewer aquí para evitar que `pdfjs-dist` sea incluido
// en el bundle del servidor (evita error de 'canvas').

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
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) return s;
    if (/\.pdf$|\.docx$|\.doc$|\.xlsx$/i.test(s)) return s;
  }
  return undefined;
};

export default function FichaPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const id = parseInt(params.id, 10);
        if (Number.isNaN(id)) throw new Error("ID inválido");
        const p = await getProductoById(id);
        setProduct(p);
      } catch (err: any) {
        console.error(err);
        setError("No fue posible cargar la ficha técnica.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);
  const fichaUrl = resolveFichaUrl(product as any);

  // Para Drive generamos dos URLs: preview (vista) y download (descarga).
  const getDrivePreviewAndDownload = (u?: string | undefined) => {
    if (!u) return { preview: undefined, download: undefined };
    try {
      const url = new URL(u);
      const host = url.hostname.toLowerCase();
      if (host.includes('drive.google.com')) {
        const pathParts = url.pathname.split('/').filter(Boolean);
        const idFromPath = (() => {
          const idx = pathParts.indexOf('d');
          if (idx >= 0 && pathParts.length > idx + 1) return pathParts[idx + 1];
          return null;
        })();
        const id = idFromPath ?? url.searchParams.get('id');
        if (id) {
          return {
            preview: `https://drive.google.com/file/d/${id}/preview`,
            download: `https://drive.google.com/uc?export=download&id=${id}`,
          };
        }
      }
    } catch (e) {
      // ignore
    }
    return { preview: u, download: u };
  };
  const { preview: fichaPreviewUrl, download: fichaDownloadUrl } = getDrivePreviewAndDownload(fichaUrl);
  const nombre = product?.nombre ?? 'Ficha';

  // Abrir la ficha en nueva pestaña automáticamente (solo en cliente)
  const openedRef = useRef(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  useEffect(() => {
    if (!fichaUrl) return;
    if (openedRef.current) return;
    openedRef.current = true;
    try {
      const finalUrl = fichaPreviewUrl ?? fichaUrl;
      const w = window.open(finalUrl, '_blank', 'noopener,noreferrer');
      if (!w) {
        // Popup bloqueado: no redirigimos la pestaña actual. Mostramos un aviso para que
        // el usuario abra el enlace manualmente (click es un gesto válido para abrir nueva pestaña).
        console.warn('Popup fue bloqueado por el navegador. Mostrando botón para abrir en nueva pestaña.');
        setPopupBlocked(true);
      }
    } catch (err) {
      console.error('No se pudo abrir la ficha en nueva pestaña:', err);
      setPopupBlocked(true);
    }
  }, [fichaUrl]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="py-20 text-center text-gray-500">Cargando ficha técnica...</div>
      </PublicLayout>
    );
  }
  if (error || !product) {
    return (
      <PublicLayout>
        <div className="py-20 text-center text-red-600">{error ?? 'Ficha no encontrada.'}</div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link href={`/users/especificaciones/${product.id}`} className="text-sm text-[#2e9fdb]">← Volver al producto</Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">Ficha Técnica — {nombre}</h1>

        {fichaUrl ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="p-8 text-center">
              <p className="mb-4 text-gray-700">Abriendo la ficha técnica en una nueva pestaña...</p>
              <p className="mb-4 text-sm text-gray-500">Si el archivo no se abre automáticamente, usa los enlaces de abajo.</p>
              <div className="flex justify-center gap-3">
                {popupBlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      const final = fichaPreviewUrl ?? fichaUrl;
                      try {
                        window.open(final, '_blank', 'noopener,noreferrer');
                      } catch (e) {
                        // Como fallback, navegar en la misma pestaña (muy raro al hacer click)
                        window.location.href = final as string;
                      }
                    }}
                    className="text-sm text-[#2e9fdb] underline"
                  >
                    Abrir en nueva pestaña
                  </button>
                ) : (
                  <a href={fichaPreviewUrl ?? fichaUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#2e9fdb]">Abrir en nueva pestaña</a>
                )}
                <a href={fichaDownloadUrl ?? fichaUrl} target="_blank" rel="noopener noreferrer" className="text-sm bg-[#2e9fdb] text-white px-3 py-2 rounded" download>
                  Descargar
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white border rounded">
            <p className="text-gray-700">No hay ficha técnica disponible para este producto.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

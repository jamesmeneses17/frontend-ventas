"use client";

import React, { useEffect, useRef, useState } from "react";

interface PdfViewerProps {
  url: string;
  fileName?: string;
}

export default function PdfViewer({ url, fileName }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfjsRef = useRef<any>(null);
  const [pdf, setPdf] = useState<any | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cargar pdfjs dinámicamente en el cliente para evitar que Next lo resuelva en build (evita 'canvas')
    let cancelled = false;
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
        if (cancelled) return;
        pdfjsRef.current = pdfjsLib;
        try {
          // @ts-ignore
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;
        } catch (e) {
          console.warn("No se pudo establecer workerSrc de pdfjs:", e);
        }
      } catch (err) {
        console.warn("No se pudo cargar pdfjs en cliente:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      setPdf(null);
      try {
        // Asegurarse de que pdfjs esté cargado (import dinámico si aún no lo está)
        let pdfjsLib = pdfjsRef.current;
        if (!pdfjsLib) {
          pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
          pdfjsRef.current = pdfjsLib;
          try {
            // @ts-ignore
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;
          } catch (e) {
            console.warn("No se pudo establecer workerSrc de pdfjs:", e);
          }
        }

        const loadingTask = pdfjsLib.getDocument(url);
        const loadedPdf = await loadingTask.promise;
        if (cancelled) return;
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages || 0);
        setPageNumber(1);
      } catch (err: any) {
        console.error("Error cargando PDF:", err);
        setError("No fue posible cargar el PDF.");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;
      try {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const renderContext = {
          canvasContext: context as any,
          viewport,
        };
        const renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err) {
        console.error("Error renderizando página:", err);
        setError("Error renderizando PDF.");
      }
    };
    renderPage();
  }, [pdf, pageNumber, scale]);

  const goPrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const goNext = () => setPageNumber((p) => Math.min(numPages || p, p + 1));

  const zoomIn = () => setScale((s) => Math.min(3, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.25));

  return (
    <div className="bg-white border rounded">
      <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} disabled={pageNumber <= 1} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Anterior</button>
          <button onClick={goNext} disabled={pageNumber >= (numPages || 1)} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Siguiente</button>
          <span className="text-sm text-gray-700">Página {pageNumber} / {numPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={zoomOut} className="px-3 py-1 bg-gray-100 rounded">-</button>
          <span className="text-sm">Zoom {(scale * 100).toFixed(0)}%</span>
          <button onClick={zoomIn} className="px-3 py-1 bg-gray-100 rounded">+</button>
          <a href={url} download={fileName ?? undefined} className="ml-3 px-3 py-1 bg-[#2e9fdb] text-white rounded">Descargar</a>
        </div>
      </div>

      <div className="p-2 flex justify-center">
        {loading ? (
          <div className="text-gray-500 py-12">Cargando PDF...</div>
        ) : error ? (
          <div className="text-red-600 py-6">{error}</div>
        ) : (
          <canvas ref={canvasRef} className="shadow-sm" />
        )}
      </div>
    </div>
  );
}

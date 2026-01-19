"use client";

import React, { useState, useEffect, useRef } from "react";
import { getProductos } from "@/components/services/productosService";
import { CubeIcon } from "@heroicons/react/24/solid";
import { formatCurrency } from "@/utils/formatters";

interface ProductAutocompleteProps {
  placeholder?: string;
  onSelect: (product: any) => void;
  maxResults?: number;
  disabled?: boolean;
}

export default function ProductAutocomplete({
  placeholder = "Buscar producto...",
  onSelect,
  maxResults = 8,
  disabled = false,
}: ProductAutocompleteProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    getProductos(1, maxResults, "", search)
      .then((resp) => setResults(resp.data || []))
      .finally(() => setLoading(false));
  }, [search, maxResults]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        className="form-input w-full"
        placeholder={placeholder}
        value={search}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => setIsFocused(true)}
        disabled={disabled}
      />
      {isFocused && search.length > 1 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg shadow-2xl bg-white ring-1 ring-gray-200 max-h-64 overflow-auto" style={{ minWidth: 260, maxWidth: 400 }}>
          <div className="py-1">
            {loading && (
              <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Buscando...
              </div>
            )}
            {!loading && results.length > 0 && results.map((item) => (
              <div
                key={item.id}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150 cursor-pointer"
                style={{ minWidth: 260, maxWidth: 400 }}
                onClick={() => {
                  setIsFocused(false);
                  setSearch(item.nombre);
                  onSelect(item);
                }}
              >
                <CubeIcon className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                <span className="whitespace-normal break-words flex-1 pr-2" style={{ maxWidth: 220 }}>{item.nombre}</span>
                <div className="flex flex-col items-end">
                  {item.precio_con_descuento && item.precio_con_descuento < item.precio ? (
                    <>
                      <span className="text-xs text-gray-400 line-through">
                        {formatCurrency(item.precio, "$")}
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(item.precio_con_descuento, "$")}
                      </span>
                    </>
                  ) : (
                    item.precio !== undefined && (
                      <span className="text-sm font-semibold text-gray-800">
                        {formatCurrency(item.precio, "$")}
                      </span>
                    )
                  )}
                </div>
              </div>
            ))}
            {!loading && results.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">No se encontraron productos.</div>
            )}
            {!loading && search.length < 2 && isFocused && (
              <div className="px-4 py-3 text-sm text-gray-500">Ingresa al menos 2 caracteres para buscar.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

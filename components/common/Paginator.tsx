"use client";

import React from "react";

interface PaginatorProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
}

// Opciones de tamaño de página
const PAGE_SIZE_OPTIONS = [5, 10, 15, 25]; // Mantenemos 3 porque lo tenías en tu código

const Paginator: React.FC<PaginatorProps> = ({
  total,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  
  if (total <= 0) return null;

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(Number(e.target.value));
  };

  return (
    // Estructura flex para alinear el selector y los botones
    <div className="flex items-center space-x-3"> 

      {/* Selector de Tamaño de Página */}
      <div className="flex items-center space-x-1 text-sm text-gray-700">
          <label htmlFor="pageSizeSelect">Elementos por pagina:</label>
          <select
              id="pageSizeSelect"
              value={pageSize}
              onChange={handleSizeChange}
              className="border border-gray-300 rounded-md py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
              {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                      {size}
                  </option>
              ))}
          </select>
      </div>
      
      {/* Botones de Navegación (Solo si hay más de una página) */}
      {totalPages > 1 && (
        <div className="flex space-x-2">
            <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
                Anterior
            </button>
            
            <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-4 py-2 bg-white text-gray-700 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
                Siguiente
            </button>
        </div>
      )}
    </div>
  );
};

export default Paginator;
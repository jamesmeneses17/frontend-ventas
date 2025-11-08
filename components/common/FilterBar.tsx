"use client";

import React from "react";
import SearchInput from "./form/SearchInput";
import ActionButton from "./ActionButton";
import { Upload } from "lucide-react";

// Definición de tipos para las opciones del filtro Select
interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  // Propiedades para la búsqueda
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;

  // Propiedades para el filtro Select (Estado de Stock)
  selectOptions: FilterOption[];
  selectFilterValue: string;
  onSelectFilterChange: (value: string) => void;

  // Propiedades para el botón de acción (e.g., Importar)
  onActionButtonClick?: () => void;
  actionButtonLabel?: string;
}

export default function FilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  selectOptions = [],
  selectFilterValue,
  onSelectFilterChange,
  onActionButtonClick,
  actionButtonLabel,
}: FilterBarProps) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      {/* 1. Buscador */}
      <div className="w-full max-w-md">
        <SearchInput
          searchTerm={searchTerm}
          placeholder={searchPlaceholder}
          onSearchChange={onSearchChange}
        />
      </div>

      {/* 2. Filtro Select (Estado de Stock) */}
      <div className="flex-shrink-0">
        <select
          value={selectFilterValue}
          onChange={(e) => onSelectFilterChange(e.target.value)}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
        >
          {(selectOptions || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Botón de Acción Opcional (e.g., Importar Datos) */}
      {onActionButtonClick && actionButtonLabel && (
        <ActionButton
          icon={<Upload className="w-5 h-5 mr-1" />}
          label={actionButtonLabel}
          onClick={onActionButtonClick}
          color="primary" // Ajusta el color según tu diseño
          className="flex-shrink-0"
        />
      )}
    </div>
  );
}
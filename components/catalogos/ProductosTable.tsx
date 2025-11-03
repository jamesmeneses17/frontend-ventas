// components/catalogos/ProductosTable.tsx
"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Producto } from "../services/productosService";
import { Trash, Pencil } from "lucide-react"; // Usaremos iconos de lucide para ser más modernos

interface Props {
  data: Producto[];
  loading?: boolean;
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
}

export default function ProductosTable({ data, loading, onEdit, onDelete }: Props) {
  
  // Función para obtener la clase de color para el estado (similar a tu ejemplo)
  const getEstadoClasses = (estadoNombre: string) => {
    switch (estadoNombre) {
      case "Disponible":
        return "bg-green-100 text-green-800";
      case "Stock Bajo":
        return "bg-yellow-100 text-yellow-800";
      case "Agotado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    { key: "codigo", label: "Código" },
    { key: "nombre", label: "Nombre" },
    // Muestra el nombre de la categoría del objeto anidado
    { key: "categoria", label: "Categoría", render: (row: Producto) => row.categoria?.nombre || 'N/A' },
    { key: "stock", label: "Stock" },
    { 
      key: "precio", 
      label: "Precio", 
      render: (row: Producto) => (
        <span className="font-semibold">
          {row.precio ? `$${row.precio.toFixed(2)}` : 'N/A'}
          {/* Se puede añadir un label de "Promo" si la lógica lo requiere */}
        </span>
      ),
    },
    { 
      key: "estado", 
      label: "Estado",
      render: (row: Producto) => (
        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${getEstadoClasses(row.estado?.nombre)}`}>
          {row.estado?.nombre || 'Desconocido'}
        </span>
      ),
    },
  ];

  return (
    <CrudTable
      columns={columns}
      data={data}
      loading={loading}
      renderRowActions={(row: Producto) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButton
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => onEdit(row)}
            title="Editar Producto"
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            onClick={() => onDelete(row.id)}
            color="danger"
            title="Eliminar Producto"
          />
        </div>
      )}
    />
  );
}
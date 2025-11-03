// components/catalogos/ProductosTable.tsx
"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Producto, Categoria, Estado } from "../services/productosService"; // ✅ Asegúrate de importar Categoria y Estado
import { Trash, Pencil } from "lucide-react";

// Interfaz actualizada para aceptar las listas de lookup (Cat. y Estado)
interface Props {
  data: Producto[];
  loading?: boolean;
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
  // ✅ Props necesarias para el lookup
  allCategorias: Categoria[]; 
  allEstados: Estado[];
}

// 💡 FUNCIÓN HELPER para buscar el nombre por ID
const lookupNombre = (id: number | undefined, lookupList: { id: number; nombre: string }[]): string => {
  if (id === undefined || id === null) return 'N/A';
  const item = lookupList.find(item => item.id === id);
  return item ? item.nombre : 'Desconocido';
};


export default function ProductosTable({ data, loading, onEdit, onDelete, allCategorias, allEstados }: Props) {
  
  // Función para obtener la clase de color para el estado
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
    // ✅ COLUMNA CATEGORÍA CORREGIDA: Usa el ID del producto para buscar el nombre en la lista de categorías.
    { 
      key: "categoriaId", 
      label: "Categoría", 
      render: (row: Producto) => lookupNombre(row.categoriaId, allCategorias)
    },
    { key: "stock", label: "Stock" },
    { 
      key: "precio", 
      label: "Precio", 
      render: (row: Producto) => (
        <span className="font-semibold">
          {row.precio !== undefined ? `$${row.precio.toFixed(2)}` : 'N/A'}
        </span>
      ),
    },
    // ✅ COLUMNA ESTADO CORREGIDA: Usa el ID del producto para buscar el nombre en la lista de estados.
    { 
      key: "estadoId", 
      label: "Estado",
      render: (row: Producto) => {
        const estadoNombre = lookupNombre(row.estadoId, allEstados);
        return (
          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${getEstadoClasses(estadoNombre)}`}>
            {estadoNombre}
          </span>
        );
      },
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
            label="Editar Producto"
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            onClick={() => onDelete(row.id)}
            color="danger"
            label="Eliminar Producto"
          />
        </div>
      )}
    />
  );
}
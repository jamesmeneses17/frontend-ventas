// components/catalogos/ProductosTable.tsx
"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Producto, Categoria, Estado } from "../services/productosService"; // ✅ Asegúrate de importar Categoria y Estado
import { Trash, Pencil } from "lucide-react";

// Interfaz (Simplificada al no necesitar las listas de lookup)
interface Props {
    data: Producto[];
    categorias: Categoria[];
    estados: Estado[];
    loading?: boolean;
    onEdit: (producto: Producto) => void;
    onDelete: (id: number) => void;
}

// 🛑 ELIMINAMOS la función lookupNombre() si no vamos a usar listas externas.
// Los nombres vendrán directamente de row.categoria.nombre

export default function ProductosTable({ data, categorias, estados, loading, onEdit, onDelete }: Props) {
  
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
    
    // ✅ CORRECCIÓN: Accede directamente al objeto 'categoria' cargado por TypeORM
        {
            key: "categoria",
            label: "Categoría",
            render: (row: Producto) => {
                const categoria = categorias.find(c => c.id === row.categoriaId);
                return categoria?.nombre || 'N/A';
            }
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
    
    // ✅ CORRECCIÓN: Accede directamente al objeto 'estado' cargado por TypeORM
        {
            key: "estado",
            label: "Estado",
            render: (row: Producto) => {
                // Prioridad: mostrar el nombre del estado desde el objeto estado si existe
                let estadoNombre = row.estado?.nombre;
                if (!estadoNombre) {
                  const estado = estados.find(e => e.id === row.estadoId);
                  estadoNombre = estado?.nombre;
                }
                estadoNombre = estadoNombre || 'Desconocido';
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
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            onClick={() => onDelete(row.id)}
            color="danger"
          />
        </div>
      )}
    />
  );
}
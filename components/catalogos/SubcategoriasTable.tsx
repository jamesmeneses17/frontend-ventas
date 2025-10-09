"use client";

import React from "react";
import CrudTable from "../common/CrudTable"; 
import ActionButton from "../common/ActionButton";

import { Subcategoria } from "../services/subcategoriasService"; 

interface Props {
  // 💡 Usamos la interfaz Subcategoria
  data: Subcategoria[]; 
  loading?: boolean;
  onEdit: (subcategoria: Subcategoria) => void;
  onDelete: (id: number) => void;
}

export default function SubcategoriasTable({ data, loading, onEdit, onDelete }: Props) {
  // 💡 Definición de Columnas para Subcategoría
  const columns = [
    // { key: "id", label: "ID" }, // Opcional si quieres mostrar el ID
    { key: "nombre", label: "Nombre" },
    
    // 🔑 CLAVE: Nueva Columna para mostrar la Categoría Padre
    { 
      key: "categoria", 
      label: "Categoría",
      // Accedemos a la relación: row.categoria.nombre
      render: (row: Subcategoria) => ( 
        <span className="font-medium text-gray-700">
          {row.categoria.nombre}
        </span>
      ),
    },

    { 
      key: "estado", 
      label: "Estado",
      // Accedemos a la relación de estado: row.estado.id
      render: (row: Subcategoria) => ( 
        <span 
          className={row.estado.id === 1 ? "text-green-600 font-medium" : "text-red-600 font-medium"}
        >
          {row.estado.nombre}
        </span>
      ),
    },
  ];

  return (
    <CrudTable
      columns={columns}
      data={data}
      loading={loading}
      // 💡 Aseguramos que la función de acciones trabaje con Subcategoria
      renderRowActions={(row: Subcategoria) => ( 
        <div className="flex items-center justify-end gap-2">
          {/* Botón Editar */}
          <ActionButton
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            }
            onClick={() => onEdit(row)}
          />
          {/* Botón Eliminar */}
          <ActionButton
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            }
            onClick={() => onDelete(row.id)}
            color="danger"
          />
        </div>
      )}
    />
  );
}
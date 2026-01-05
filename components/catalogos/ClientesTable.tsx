"use client";

import React from "react";
// Importamos CrudTable y ActionButton
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Cliente } from "../services/clientesServices";
// Importamos la interfaz Cliente del servicio

interface Props {
  data: Cliente[];
  loading?: boolean;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

export default function ClientesTable({ data, loading, onEdit, onDelete }: Props) {

  // Definición de las columnas para la tabla de clientes
  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "numero_documento", label: "Documento" },
    {
      key: "tipo_contacto",
      label: "Tipo Contacto",
      render: (item: Cliente) => {
        const tipo = item.tipoContacto?.nombre || "N/A";
        let colorClass = "bg-gray-100 text-gray-800";
        switch (tipo.toLowerCase()) {
          case 'cliente':
            // Verde esmeralda: Confianza y éxito
            colorClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";
            break;

          case 'proveedor':
            // Azul Indigo: Profesionalismo y seriedad
            colorClass = "bg-indigo-100 text-indigo-700 border border-indigo-200";
            break;

          case 'persona natural':
            // Violeta suave: Diferenciación clara
            colorClass = "bg-purple-100 text-purple-700 border border-purple-200";
            break;

          case 'empresa':
            // Ámbar/Dorado: Valor comercial alto
            colorClass = "bg-amber-100 text-amber-700 border border-amber-200";
            break;

          default:
            // Gris Slate: Neutral para tipos desconocidos
            colorClass = "bg-slate-100 text-slate-600 border border-slate-200";
        }

        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
            {tipo}
          </span>
        );
      }
    },
    { key: "telefono", label: "Teléfono" },
    { key: "correo", label: "Correo" },
    // Si tu Cliente incluye el nombre del tipo de documento (ej: tipoDocumento.nombre), 
    // podrías agregarlo aquí con una función `render`.
    /*
    { 
      key: "tipo_documento", 
      label: "Tipo Doc.", 
      render: (row: Cliente) => (
        <span>{row.tipoDocumento?.nombre || 'N/A'}</span>
      ),
    },
    */
  ];

  return (
    <CrudTable
      columns={columns}
      data={data}
      loading={loading}
      // Reutilizamos la misma lógica de renderizado de acciones
      renderRowActions={(row: Cliente) => (
        <div className="flex items-center justify-end gap-2">
          {/* Botón de Editar */}
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
          {/* Botón de Eliminar */}
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
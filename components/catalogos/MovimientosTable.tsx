// components/catalogos/MovimientosTable.tsx

"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Trash, Pencil, Tag, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { MovimientoCaja } from "../services/cajaService";

// Define los tipos (Asegúrate de que esta ruta es correcta para tus servicios)

interface Props {
  data: MovimientoCaja[];
  loading?: boolean;
  onEdit: (movimiento: MovimientoCaja) => void;
  onDelete: (id: number) => void;
}

export default function MovimientosTable({
  data,
  loading,
  onEdit,
  onDelete,
}: Props) {

  // ✅ Estilo según el tipo de movimiento
  const getTipoMovimientoClasses = (tipo?: string) => {
    if (!tipo) return "bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold";
    const upper = tipo.toUpperCase();
    switch (upper) {
      case "INGRESO":
      case "VENTA":
      case "INGRESO POR VENTA":
        return "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold";
      case "EGRESO":
        return "bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold";
      case "GASTO":
        return "bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold";
      default:
        return "bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold";
    }
  };

  // ✅ Columnas de la tabla (Refleja el Excel de Ingresos/Egresos)
  const columns = [
    {
      key: "fecha",
      label: "Fecha",
      render: (row: MovimientoCaja) => formatDate(row.fecha)
    },
    {
      key: "tipo_movimiento",
      label: "Tipo",
      render: (row: MovimientoCaja) => {
        let nombreTipo = row.tipoMovimiento?.nombre || "N/A";
        if (nombreTipo.toUpperCase() === 'VENTA') {
          nombreTipo = 'Ingreso por Venta';
        } else if (nombreTipo.toUpperCase() === 'EGRESO') {
          nombreTipo = 'Egreso por Compra';
        }

        return (
          <span className={getTipoMovimientoClasses(row.tipoMovimiento?.nombre)}>
            {nombreTipo}
          </span>
        )
      }
    },
    {
      key: "concepto",
      label: "Descripción / Concepto",
      // Aquí simulamos que el campo es 'concepto' o 'descripcion'
      render: (row: MovimientoCaja) => row.concepto || "N/A"
    },
    {
      key: "monto",
      label: "Monto",
      render: (row: MovimientoCaja) => {
        const nombreTipo = row.tipoMovimiento?.nombre?.toUpperCase() || "";
        const isNegative = nombreTipo !== 'INGRESO' && nombreTipo !== 'VENTA';
        return (
          <span className={`font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(row.monto)}
          </span>
        );
      }
    },
    // Podrías añadir una columna para Referencia (Venta ID, Compra ID)
    // { key: "referencia", label: "Referencia Doc" },
  ];

  return (
    <CrudTable
      columns={columns}
      data={data}
      loading={loading}
      renderRowActions={(row: MovimientoCaja) => (
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
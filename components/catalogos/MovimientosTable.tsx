"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Trash, Pencil, ShoppingCart, ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { MovimientoCaja } from "../services/cajaService";

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

  // ✅ Estilo profesional con bordes y tipografía mejorada
  const getTipoMovimientoClasses = (tipo?: string) => {
    if (!tipo) return "bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";

    const upper = tipo.toUpperCase();
    switch (upper) {
      case "INGRESO":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
      case "VENTA":
      case "INGRESO POR VENTA":
        // Verde azulado para diferenciar ventas de otros ingresos
        return "bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
      case "EGRESO":
      case "GASTO":
        return "bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
      case "EGRESO POR COMPRA":
        // Indigo para identificar rápidamente salidas por inventario
        return "bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
    }
  };

  const columns = [
    {
      key: "fecha",
      label: "Fecha",
      render: (row: MovimientoCaja) => (
        <span className="text-gray-600 font-medium">{formatDate(row.fecha)}</span>
      )
    },
    {
      key: "tipo_movimiento",
      label: "Tipo",
      render: (row: MovimientoCaja) => {
        let nombreTipo = row.tipoMovimiento?.nombre || "N/A";

        // Normalización de nombres para la vista profesional
        if (nombreTipo.toUpperCase() === 'VENTA') {
          nombreTipo = 'Ingreso por Venta';
        }

        return (
          <div className="flex items-center gap-2">
            <span className={getTipoMovimientoClasses(row.tipoMovimiento?.nombre)}>
              {nombreTipo}
            </span>
          </div>
        );
      }
    },
    {
      key: "concepto",
      label: "Descripción / Concepto",
      render: (row: MovimientoCaja) => (
        <div className="max-w-[240px] md:max-w-xs break-words whitespace-normal text-gray-700 italic text-sm" title={row.concepto}>
          {row.concepto ? (
            row.concepto.split('\n').map((line, i) => {
              const trimmed = line.trim();
              if (trimmed.startsWith('Cant:')) {
                return <div key={i} className="font-bold text-gray-900 mt-1 not-italic">{line}</div>;
              }
              if (trimmed.startsWith('Cod:')) {
                const firstDashIndex = line.indexOf(' - ');
                if (firstDashIndex !== -1) {
                  const codePart = line.substring(0, firstDashIndex);
                  const restPart = line.substring(firstDashIndex + 3); // Skip " - "
                  return (
                    <div key={i} className="mb-1">
                      <div className="font-bold text-gray-900 not-italic">{codePart}</div>
                      <div className="text-gray-600 pl-2 border-l-2 border-gray-200">{restPart}</div>
                    </div>
                  );
                }
              }
              return <div key={i}>{line}</div>
            })
          ) : (
            "Sin descripción"
          )}
        </div>
      )
    },
    {
      key: "monto",
      label: "Monto",
      render: (row: MovimientoCaja) => {
        const nombreTipo = row.tipoMovimiento?.nombre?.toUpperCase() || "";
        // Definición de lógica de flujo de caja positivo
        const isPositive = nombreTipo === 'INGRESO' || nombreTipo === 'VENTA' || nombreTipo === 'INGRESO POR VENTA';

        return (
          <div className={`flex items-center gap-1 font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span>{isPositive ? '+' : '-'}</span>
            <span>{formatCurrency(row.monto)}</span>
          </div>
        );
      }
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <CrudTable
        columns={columns}
        data={data}
        loading={loading}
        renderRowActions={(row: MovimientoCaja) => (
          <div className="flex items-center justify-end gap-1">
            <ActionButton
              icon={<Pencil className="w-3.5 h-3.5" />}
              onClick={() => onEdit(row)}
              className="hover:bg-blue-50 text-blue-600"
            />
            <ActionButton
              icon={<Trash className="w-3.5 h-3.5" />}
              onClick={() => onDelete(row.id)}
              color="danger"
              className="hover:bg-red-50 text-red-600"
            />
          </div>
        )}
      />
    </div>
  );
}
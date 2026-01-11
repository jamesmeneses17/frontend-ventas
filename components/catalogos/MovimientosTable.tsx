"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Trash, Pencil, ShoppingCart, ArrowDownCircle, ArrowUpCircle, Wallet, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { MovimientoCaja } from "../services/cajaService";

interface Props {
  data: MovimientoCaja[];
  loading?: boolean;
  onEdit: (movimiento: MovimientoCaja) => void;
  onDelete: (id: number) => void;
  onView: (movimiento: MovimientoCaja) => void;
}

export default function MovimientosTable({
  data,
  loading,
  onEdit,
  onDelete,
  onView,
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
        <div className="max-w-[240px] md:max-w-xs text-sm text-gray-700">
          <div className="line-clamp-2 break-words" title={row.concepto}>
            {(() => {
              const concepto = row.concepto || "Sin descripción";

              // Detectar formato de Compra con lista de productos
              // Patrón general para ID
              const matchId = concepto.match(/Compra (?:ID|Ref): (\d+)/i);

              // Si parece ser una compra con items listados
              if (matchId && concepto.includes("Productos:")) {
                const idCompra = matchId[1];

                // Intentar sumar cantidades si existen en el formato "(Cant: N)"
                let totalUnidades = 0;

                // Polyfill simple si matchAll no es robusto o prefiero regex loop
                const regexCant = /Cant:\s*(\d+)/g;
                let m;
                while ((m = regexCant.exec(concepto)) !== null) {
                  totalUnidades += parseInt(m[1], 10);
                }

                // Si detectamos cantidades explícitas
                if (totalUnidades > 0) {
                  return (
                    <span className="italic text-gray-600">
                      Compra #{idCompra} - Total unidades: {totalUnidades}
                    </span>
                  );
                }

                // Fallback: contar por comas si no hay formato de cantidad explícito
                const parteProductos = concepto.split("Productos:")[1] || "";
                const itemsCount = parteProductos.split(',').filter(s => s.trim() !== '').length; // Filter empty strings
                return (
                  <span className="italic text-gray-600">
                    Compra #{idCompra} - Varios items ({itemsCount})
                  </span>
                );
              }

              // Default
              return concepto;
            })()}
          </div>
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
              icon={<Wallet className="w-3.5 h-3.5" />} // Using Wallet or Eye
              // Let's use Eye as requested generally, but importing it
              // Need to import Eye if not present
              onClick={() => onView(row)}
              color="primary"
              className="hover:bg-blue-50 text-blue-600"
            />
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
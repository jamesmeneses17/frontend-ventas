"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Compra } from "../services/comprasService";
import { Trash, Pencil } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  data: Compra[];
  loading?: boolean;
  onEdit: (c: Compra) => void;
  onDelete: (id: number) => void;
}

export default function ComprasTable({
  data = [],
  loading = false,
  onEdit,
  onDelete,
}: Props) {
  
  // ========================
  // COLUMNAS TABLA (Se mantienen)
  // ========================
  const columns = [
    {
      key: "codigo",
      label: "Código",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium",
      render: (row: Compra) =>
        row.producto?.codigo ?? `#${row.producto_id}`,
    },
    {
      key: "fecha",
      label: "Fecha",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Compra) => {
        if (!row.fecha) return "-";
        try {
          const d = new Date(row.fecha);
          return `${d.getDate()} - ${d.toLocaleString("es-CO", {
            month: "long",
          })}.${d.getFullYear()}`;
        } catch {
          return String(row.fecha);
        }
      },
    },
    {
      key: "producto",
      label: "Producto",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Compra) =>
        row.producto?.nombre ?? `#${row.producto_id}`,
    },
    {
      key: "categoria",
      label: "Categoría",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Compra) =>
        row.categoria?.nombre ??
        row.producto?.categoria?.nombre ??
        (row.categoria_id ? `#${row.categoria_id}` : "-"),
    },
    {
      key: "cantidad",
      label: "Cantidad",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium",
    },
    {
      key: "costo_unitario",
      label: "Costo Unitario",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Compra) => formatCurrency(row.costo_unitario ?? 0),
    },
    {
      key: "total",
      label: "Total",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-bold text-blue-600",
      render: (row: Compra) =>
        formatCurrency(
          (row.cantidad ?? 0) * (row.costo_unitario ?? 0)
        ),
    },
  ];

  return (
    // 👈 Se eliminó el div con estilos (shadow-md, p-4, etc.) para que la tabla use el padding del contenedor padre
    <div>
      {/* =============================
          TABLA
      ============================== */}
      <CrudTable
        columns={columns}
        data={data}
        loading={loading}
        tableClass="min-w-full divide-y divide-gray-200"
        headerClass="bg-gray-50 border-b"
        rowClass="hover:bg-gray-50 transition"
        renderRowActions={(row: Compra) => (
          <div className="flex items-center justify-end gap-2 px-4">
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
    </div>
  );
}
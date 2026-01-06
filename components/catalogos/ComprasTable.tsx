"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Compra } from "../services/comprasService";
import { Trash, Pencil, Eye } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  data: Compra[];
  loading?: boolean;
  onEdit: (c: Compra) => void;
  onDelete: (id: number) => void;
  onView: (c: Compra) => void;
}

export default function ComprasTable({
  data = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
}: Props) {

  // ========================
  // COLUMNAS TABLA (Refactorizado para parecer vista de producto)
  // ========================
  const columns = [
    {
      key: "fecha",
      label: "Fecha",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Compra) => {
        if (!row.fecha) return "-";
        const fechaStr = String(row.fecha);
        const match = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          const [_, year, month, day] = match;
          const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
          const mesNombre = meses[parseInt(month, 10) - 1] || month;
          return `${day}/${mesNombre}/${year}`;
        }
        return fechaStr;
      },
    },
    {
      key: "producto",
      label: "Producto",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium text-gray-800",
      render: (row: Compra) => {
        if (row.detalles && row.detalles.length === 1) {
          return row.detalles[0].producto?.nombre || "Producto Desconocido";
        }
        return `Varios Productos (${row.detalles?.length || 0})`;
      },
    },
    {
      key: "proveedor",
      label: "Proveedor",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-gray-600",
      render: (row: Compra) => row.cliente?.nombre || "S/N",
    },
    {
      key: "cantidad",
      label: "Cantidad",
      headerClass: "px-4 py-3 text-center text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-center",
      render: (row: Compra) => {
        const totalQty = row.detalles?.reduce((acc, det) => acc + Number(det.cantidad), 0) || 0;
        return totalQty;
      },
    },
    {
      key: "total",
      label: "Total",
      headerClass: "px-4 py-3 text-right text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-right font-bold text-blue-600",
      render: (row: Compra) => formatCurrency(row.total),
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
              icon={<Eye className="w-4 h-4" />}
              onClick={() => onView(row)}
              color="primary"
            />
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
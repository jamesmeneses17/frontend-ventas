"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Venta } from "../services/ventasService";
import { Trash, Pencil } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  data: Venta[];
  loading?: boolean;
  onEdit: (v: Venta) => void;
  onDelete: (id: number) => void;
}

export default function VentasTable({
  data = [],
  loading = false,
  onEdit,
  onDelete,
}: Props) {

  // Ordenar ventas por fecha descendente
  const sortedData = React.useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      const dateA = new Date(a.fecha || 0).getTime();
      const dateB = new Date(b.fecha || 0).getTime();
      return dateB - dateA;
    });
  }, [data]);

  // ========================
  // COLUMNAS TABLA
  // ========================
  const columns = [
    {
      key: "id",
      label: "ID",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-bold text-gray-500",
      render: (row: Venta) => `#${row.id}`,
    },
    {
      key: "fecha",
      label: "Fecha",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Venta) => {
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
      key: "cliente",
      label: "Cliente",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium text-blue-800",
      render: (row: Venta) => row.cliente?.nombre || "Cliente General",
    },
    {
      key: "producto",
      label: "Producto(s)",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium text-gray-800",
      render: (row: Venta) => {
        const detalles = row.detalles || [];
        if (detalles.length === 0) return <span className="text-gray-400">Sin items</span>;

        if (detalles.length === 1) {
          const prodName = detalles[0].producto?.nombre ?? detalles[0].producto?.codigo ?? "Producto";
          return prodName;
        }

        return (
          <div className="flex flex-col">
            <span>Varios Productos ({detalles.length})</span>
            <span className="text-xs text-gray-400">Ver detalles para más info</span>
          </div>
        );
      },
    },
    {
      key: "cantidad",
      label: "Cant.",
      headerClass: "px-4 py-3 text-center text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-center",
      render: (row: Venta) => {
        const totalQty = row.detalles?.reduce((acc, d) => acc + Number(d.cantidad), 0) || 0;
        return totalQty;
      }
    },
    {
      key: "total",
      label: "Total Venta",
      headerClass: "px-4 py-3 text-right text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-right font-bold text-green-600",
      render: (row: Venta) => formatCurrency(row.total || 0),
    },
  ];

  return (
    <CrudTable
      columns={columns}
      data={sortedData}
      loading={loading}
      tableClass="min-w-full divide-y divide-gray-200"
      headerClass="bg-gray-50 border-b"
      rowClass="hover:bg-gray-50 transition"
      renderRowActions={(row: Venta) => (
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
  );
}

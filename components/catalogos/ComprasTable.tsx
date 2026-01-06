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
      key: "id",
      label: "N° Factura",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium text-gray-900",
      render: (row: Compra) => `FAC-${row.id}`,
    },
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
      key: "proveedor",
      label: "Proveedor",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium",
      render: (row: Compra) => row.cliente?.nombre || "S/N",
    },
    {
      key: "items",
      label: "Productos",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-gray-600",
      render: (row: Compra) => `${row.detalles?.length || 0} ítems`,
    },
    {
      key: "total",
      label: "Monto Total",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-bold text-blue-600",
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
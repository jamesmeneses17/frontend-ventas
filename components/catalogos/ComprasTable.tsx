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

export default function ComprasTable({ data = [], loading = false, onEdit, onDelete }: Props) {
  const columns = [
    {
      key: "fecha",
      label: "Fecha",
      render: (row: Compra) => (row.fecha ? new Date(row.fecha).toLocaleDateString() : "-"),
    },
    {
      key: "producto",
      label: "Producto",
      render: (row: Compra) => row.producto?.nombre ?? `#${row.producto_id}`,
    },
    {
      key: "categoria",
      label: "Categoría",
      render: (row: Compra) => row.categoria?.nombre ?? `#${row.categoria_id}`,
    },
    { key: "cantidad", label: "Cantidad" },
    {
      key: "costo_unitario",
      label: "Costo Unitario",
      render: (row: Compra) => formatCurrency(row.costo_unitario ?? 0),
    },
    {
      key: "total",
      label: "Total",
      render: (row: Compra) => formatCurrency((row.cantidad ?? 0) * (row.costo_unitario ?? 0)),
    },
  ];

  return (
    <CrudTable
      columns={columns}
      data={data}
      loading={loading}
      renderRowActions={(row: Compra) => (
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

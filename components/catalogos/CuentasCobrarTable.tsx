"use client";
import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Pencil, Trash, DollarSign } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  data: any[];
  loading?: boolean;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  onOpenPagos: (id: number) => void;
}

export default function CuentasCobrarTable({ data, loading, onEdit, onDelete, onOpenPagos }: Props) {
  const columns = [
    { key: "cliente", label: "Cliente", render: (r:any) => r.cliente || "N/A" },
    { key: "articulo", label: "Artículo", render: (r:any) => r.articulo || "-" },
    { key: "valor_credito", label: "Valor", render: (r:any) => formatCurrency(Number(r.valor_credito || 0)) },
    { key: "fecha_inicial", label: "Fecha Inicial", render: (r:any) => r.fecha_inicial ?? "-" },
    { key: "fecha_final", label: "Fecha Final", render: (r:any) => r.fecha_final ?? "-" },
    { key: "saldo_pendiente", label: "Saldo", render: (r:any) => formatCurrency(Number(r.saldo_pendiente || 0)) },
    { key: "estado", label: "Estado", render: (r:any) => (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${r.estado==="PAGADO" ? "bg-green-500 text-white" : r.estado==="PENDIENTE" ? "bg-yellow-400 text-black" : "bg-gray-200"}`}>{r.estado ?? "PENDIENTE"}</span>
      )
    },
  ];

  return (
    <CrudTable
      columns={columns}
      data={data}
      loading={loading}
      renderRowActions={(row:any) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButton icon={<DollarSign className="w-4 h-4" />} onClick={() => onOpenPagos(row.id)} />
          <ActionButton icon={<Pencil className="w-4 h-4" />} onClick={() => onEdit(row)} />
          {row.id && Number(row.id) > 0 && (
            <ActionButton icon={<Trash className="w-4 h-4" />} onClick={() => onDelete(row.id)} color="danger" />
          )}
        </div>
      )}
    />
  );
}

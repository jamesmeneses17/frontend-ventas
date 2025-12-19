"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Eye, ShieldCheck } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  data: any[];
  loading: boolean;
  onView: (pedido: any) => void;
}

export default function PedidosTable({ data, loading, onView }: Props) {
  
  const columns = [
    { key: "codigo_pedido", label: "Código Pedido" },
    { 
      key: "fecha", 
      label: "Fecha",
      render: (row: any) => (
        <span className="text-gray-600">
          {new Date(row.fecha).toLocaleString('es-CO')}
        </span>
      )
    },
    {
      key: "total",
      label: "Total Pedido",
      render: (row: any) => (
        <span className="font-bold text-gray-900">{formatCurrency(row.total)}</span>
      )
    },
    {
      key: "hash_verificacion",
      label: "Hash de Seguridad",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <code className="bg-gray-100 px-2 py-1 rounded text-emerald-700 font-mono font-bold">
            {row.hash_verificacion}
          </code>
        </div>
      )
    },
    {
      key: "estado",
      label: "Estado",
      render: (row: any) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          row.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
        }`}>
          {row.estado}
        </span>
      )
    }
  ];

  return (
    <CrudTable 
      data={data}
      loading={loading}
      columns={columns}
      renderRowActions={(row: any) => (
        <ActionButton 
          icon={<Eye className="w-4 h-4" />}
          label="Validar"
          onClick={() => onView(row)}
          color="primary"
        />
      )}
    />
  );
}
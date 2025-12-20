"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Trash, Pencil, Eye } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

/* =======================
   TIPOS
======================= */
export interface DetalleCredito {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Credito {
  id: number;
  numero_factura?: string;
  cliente_id: number;
  saldo_pendiente: number;
  fecha_inicial: string;
  fecha_final?: string;
  estado: "PENDIENTE" | "PAGADO";
  detalles?: DetalleCredito[];
}

interface Props {
  data: Credito[];
  loading?: boolean;
  onEdit: (credito: Credito) => void;
  onDelete: (id: number) => void;
  onOpenPagos: (creditoId: number) => void;
  onView?: (credito: Credito) => void; // ✅ AGREGA ESTA
}


/* =======================
   COMPONENTE
======================= */
export default function CreditosTable({
  data,
  loading,
  onEdit,
  onDelete,
  onView,
}: Props) {
  /* =======================
     HELPERS
  ======================= */
  const getEstadoClasses = (estado: string) => {
    switch (estado) {
      case "PAGADO":
        return "bg-[#00c951] text-white px-3 py-1 rounded-full text-sm font-semibold";
      case "PENDIENTE":
        return "bg-[#f0b100] text-white px-3 py-1 rounded-full text-sm font-semibold";
      default:
        return "bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold";
    }
  };

 /* =======================
     COLUMNAS ACTUALIZADAS
======================= */
const columns = [
  {
    key: "numero_factura",
    label: "Factura",
    render: (row: Credito) => (
      <span className="font-medium text-gray-900">
        {row.numero_factura || "—"}
      </span>
    ),
  },
  {
    key: "cliente",
    label: "Cliente",
    headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
    cellClass: "px-4 py-2",
    render: (row: any) => 
      row.cliente?.nombre ?? (row.cliente_id ? `ID: ${row.cliente_id}` : "-"),
  },
  {
    key: "fecha_inicial",
    label: "Fecha Inicial",
    render: (row: Credito) => (
      <span className="text-sm text-gray-600">
        {row.fecha_inicial}
      </span>
    ),
  },
  {
    key: "fecha_final",
    label: "Fecha Final",
    render: (row: Credito) => (
      <span className={`text-sm ${row.fecha_final ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
        {row.fecha_final || "—"}
      </span>
    ),
  },
  {
    key: "total_credito",
    label: "Total Crédito",
    render: (row: Credito) => {
      // Cálculo basado en los detalles del backend
      const totalOriginal = row.detalles?.reduce((acc, det) => acc + Number(det.subtotal), 0) || 0;
      return (
        <span className="font-medium text-gray-600">
          {formatCurrency(totalOriginal)}
        </span>
      );
    },
  },
  {
    key: "saldo_pendiente",
    label: "Saldo Pendiente",
    render: (row: Credito) => (
      <span className="font-bold text-red-600">
        {formatCurrency(row.saldo_pendiente)}
      </span>
    ),
  },
  {
    key: "estado",
    label: "Estado",
    render: (row: Credito) => (
      <span className={`inline-flex items-center ${getEstadoClasses(row.estado)}`}>
        {row.estado}
      </span>
    ),
  },
];

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="w-full">
      <CrudTable
        columns={columns}
        data={data}
        loading={loading}
        renderRowActions={(row: Credito) => (
          <div className="flex items-center justify-end gap-2">
            {onView && (
              <ActionButton
                icon={<Eye className="w-4 h-4" />}
                onClick={() => onView(row)}
              />
            )}
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

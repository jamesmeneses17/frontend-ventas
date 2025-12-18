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
     COLUMNAS
  ======================= */
  const columns = [
    {
      key: "id",
      label: "#",
    },
    {
      key: "numero_factura",
      label: "Factura",
      render: (row: Credito) => (
        <span className="font-medium">
          {row.numero_factura || "—"}
        </span>
      ),
    },
    {
      key: "cliente_id",
      label: "Cliente ID",
    },
    {
      key: "fecha_inicial",
      label: "Fecha",
      render: (row: Credito) => (
        <span className="text-sm text-gray-700">
          {row.fecha_inicial}
        </span>
      ),
    },
    {
      key: "saldo_pendiente",
      label: "Saldo Pendiente",
      render: (row: Credito) => (
        <span className="font-semibold text-gray-800">
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

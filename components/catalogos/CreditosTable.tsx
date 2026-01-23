"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Trash, Pencil, Eye, Banknote, MoreVertical } from "lucide-react";
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
  onView?: (credito: Credito) => void;
}

/* =======================
   COMPONENTE RowActions (Fixed Position)
======================= */
interface RowActionsProps {
  row: Credito;
  onEdit: (credito: Credito) => void;
  onDelete: (id: number) => void;
  onView?: (credito: Credito) => void;
}

const RowActions = ({ row, onEdit, onDelete, onView }: RowActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cerrar al hacer resize o scroll (simple)
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => setIsOpen(false);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 110; // Approx height with 3 items
      const spaceBelow = window.innerHeight - rect.bottom;

      let top = rect.bottom + window.scrollY + 5;
      // Si no hay espacio abajo, abrir hacia arriba
      if (spaceBelow < menuHeight) {
        top = rect.top + window.scrollY - menuHeight - 5;
      }

      setDropdownPos({
        top,
        left: rect.right + window.scrollX - 160 // 160px width
      });
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none"
        title="Más opciones"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && dropdownPos && createPortal(
        <>
          {/* Backdrop invisible para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
          />
          <div
            className="fixed bg-white border border-gray-200 rounded-md shadow-xl z-[9999] w-40"
            style={{ top: dropdownPos.top - window.scrollY, left: dropdownPos.left - window.scrollX }}
          >
            <ul className="py-1 text-sm text-gray-700">
              {onView && (
                <li>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      onView(row);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> Ver Detalle
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onEdit(row);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" /> Editar
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onDelete(row.id);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"
                >
                  <Trash className="w-4 h-4" /> Eliminar
                </button>
              </li>
            </ul>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

/* =======================
   COMPONENTE PRINCIPAL
======================= */
export default function CreditosTable({
  data,
  loading,
  onEdit,
  onDelete,
  onView,
  onOpenPagos,
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

  const compactHeader = "px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider";
  const compactCell = "px-4 py-2 whitespace-nowrap text-sm text-gray-900";

  /* =======================
      COLUMNAS
   ======================= */
  const columns = [
    {
      key: "numero_factura",
      label: "Factura",
      headerClass: compactHeader,
      cellClass: compactCell,
      render: (row: Credito) => (
        <div
          onClick={() => onView && onView(row)}
          className={`font-medium text-gray-900 ${onView ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''}`}
        >
          {row.numero_factura || "—"}
        </div>
      ),
    },
    {
      key: "cliente",
      label: "Cliente",
      headerClass: compactHeader,
      cellClass: compactCell,
      render: (row: any) => (
        <div
          onClick={() => onView && onView(row)}
          className={`${onView ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''}`}
        >
          {row.cliente?.nombre ?? (row.cliente_id ? `ID: ${row.cliente_id}` : "-")}
        </div>
      ),
    },
    {
      key: "fecha_inicial",
      label: "Fecha Inicial",
      headerClass: compactHeader,
      cellClass: compactCell,
      render: (row: Credito) => (
        <span className="text-sm text-gray-600">
          {row.fecha_inicial}
        </span>
      ),
    },
    {
      key: "fecha_final",
      label: "Fecha Final",
      headerClass: compactHeader,
      cellClass: compactCell,
      render: (row: Credito) => (
        <span className={`text-sm ${row.fecha_final ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
          {row.fecha_final || "—"}
        </span>
      ),
    },
    {
      key: "total_credito",
      label: "Total Crédito",
      headerClass: compactHeader,
      cellClass: compactCell,
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
      headerClass: compactHeader,
      cellClass: compactCell,
      render: (row: Credito) => (
        <span className="font-bold text-red-600">
          {formatCurrency(row.saldo_pendiente)}
        </span>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      headerClass: compactHeader,
      cellClass: compactCell,
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
        onRowClick={(row) => onView && onView(row)}
        renderRowActions={(row: Credito) => (
          <div className="flex items-center justify-end gap-2">

            {/* 1. Acción Principal: Registrar Pago */}
            <ActionButton
              icon={<Banknote className="w-4 h-4" />}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onOpenPagos(row.id);
              }}
              className="text-green-600 bg-green-50 hover:bg-green-100 border-green-200"
              title="Registrar Abono"
              label="Abonar"
            />

            {/* 2. Menú Desplegable para el resto */}
            <RowActions
              row={row}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          </div>
        )}
      />
    </div>
  );
}

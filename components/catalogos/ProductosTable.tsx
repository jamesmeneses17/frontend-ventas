"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Producto, Categoria, Estado } from "../services/productosService";
import { Trash, Pencil } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  data: Producto[];
  categorias: Categoria[];
  estados: Estado[];
  loading?: boolean;
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
}

export default function ProductosTable({
  data,
  categorias,
  estados,
  loading,
  onEdit,
  onDelete,
}: Props) {
  // ✅ Estilo según el estado de venta (catálogo)
  const getEstadoVentaClasses = (estadoStock: string) => {
    switch (estadoStock) {
      case "Agotado":
        return "bg-[#fe293f] text-white px-3 py-1 rounded-full text-sm font-semibold";
      case "Stock Bajo":
        return "bg-[#f0b100] text-white px-3 py-1 rounded-full text-sm font-semibold";
      case "Disponible":
        return "bg-[#00c951] text-white px-3 py-1 rounded-full text-sm font-semibold";
      default:
        return "bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold";
    }
  };

  // ✅ Columnas de la tabla
  const columns = [
    { key: "codigo", label: "Código" },
    { key: "nombre", label: "Nombre" },
    {
      key: "categoria",
      label: "Categoría",
      render: (row: Producto) => {
        const categoria = categorias.find((c) => c.id === row.categoriaId);
        return categoria?.nombre || "N/A";
      },
    },
    {
      key: "compras",
      label: "Compras",
      render: (row: Producto) => <span className="text-sm text-gray-700">{typeof row.compras !== 'undefined' ? row.compras : 0}</span>
    },
    {
      key: "ventas",
      label: "Ventas",
      render: (row: Producto) => <span className="text-sm text-gray-700">{typeof row.ventas !== 'undefined' ? row.ventas : 0}</span>
    },
    { key: "stock", label: "Stock" },
    
    {
      key: "precio",
      label: "COSTO UNITARIO",
      render: (row: Producto) => (
        <span className="font-semibold">
          {row.precio !== undefined ? formatCurrency(row.precio) : "N/A"}
        </span>
      ),
    },
       { key: "precio_venta", label: "PRECIO VENTA" },
          { key: "Utilidad", label: "UTILIDAD PRO PRODUCTO" },
             { key: "Valor ", label: "VALOR INVENTARIO" },

    // ✅ SOLO una columna para el estado dinámico del producto
    {
      key: "estado_stock",
      label: "Estado de Venta",
      render: (row: Producto) => (
        <span
          className={`inline-flex items-center ${getEstadoVentaClasses(
            row.estado_stock || "Disponible"
          )}`}
        >
          {row.estado_stock || "Disponible"}
        </span>
      ),
    },
  ];

  return (
    <CrudTable
      columns={columns}
      data={data}
      loading={loading}
      renderRowActions={(row: Producto) => (
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

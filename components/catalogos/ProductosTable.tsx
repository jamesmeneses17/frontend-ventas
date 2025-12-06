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
  totalItems?: number; // <-- IMPORTANTE: para el paginador
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
}

export default function ProductosTable({
  data,
  categorias,
  estados,
  loading,
  totalItems = 0,
  onEdit,
  onDelete,
}: Props) {
  // Estado visual de productos
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

  // Columnas de la tabla (idéntico a tu versión)
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
      render: (row: Producto) =>
        <span className="text-sm text-gray-700">{row.compras ?? 0}</span>,
    },
    {
      key: "ventas",
      label: "Ventas",
      render: (row: Producto) =>
        <span className="text-sm text-gray-700">{row.ventas ?? 0}</span>,
    },
    { key: "stock", label: "Stock" },

    {
      key: "costo_unitario",
      label: "Costo Unitario",
      render: (row: Producto) => {
        const costo = Number((row as any).precio_costo ?? 0);
        return <span className="font-semibold">{formatCurrency(costo)}</span>;
      },
    },
    {
      key: "precio_venta",
      label: "Precio Venta",
      render: (row: Producto) => {
        const precioVenta = Number(
          (row as any).precio_venta ??
            (row as any).precioVenta ??
            row.precio ??
            0
        );
        return <span className="font-semibold">{formatCurrency(precioVenta)}</span>;
      },
    },
    {
      key: "utilidad",
      label: "Utilidad / Producto",
      render: (row: Producto) => {
        const costo = Number((row as any).precio_costo ?? 0);
        const pv = Number(
          (row as any).precio_venta ??
            (row as any).precioVenta ??
            row.precio ??
            0
        );
        const utilidad = pv - costo;

        return (
          <span className={`font-semibold ${utilidad < 0 ? "text-red-600" : "text-green-600"}`}>
            {formatCurrency(utilidad)}
          </span>
        );
      },
    },
    {
      key: "valor_inventario",
      label: "Valor Inventario",
      render: (row: Producto) => {
        const costo = Number((row as any).precio_costo ?? 0);
        const stock = Number(row.stock ?? 0);
        return <span className="text-sm text-gray-700">{formatCurrency(costo * stock)}</span>;
      },
    },
    {
      key: "estado_stock",
      label: "Estado de Venta",
      render: (row: Producto) => (
        <span className={`inline-flex items-center ${getEstadoVentaClasses(row.estado_stock || "Disponible")}`}>
          {row.estado_stock || "Disponible"}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full">
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

      {/* FOOTER EXACTO DEL MOLDE */}
      {!loading && (
        <p className="text-sm text-gray-600 mt-4">
          Mostrando {data.length} de {totalItems} productos
        </p>
      )}

      {loading && (
        <p className="text-sm text-gray-600 mt-4">Cargando...</p>
      )}
    </div>
  );
}

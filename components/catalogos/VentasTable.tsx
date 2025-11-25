"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Venta } from "../services/ventasService";
import { getProductoById, Producto } from "../services/productosService";
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
  const [productMap, setProductMap] = React.useState<Record<number, Producto | null>>({});

  React.useEffect(() => {
    // Buscar productIds que no estén en cache
    const ids = Array.from(
      new Set(
        (data || [])
          .map((d) => Number(d.productoId ?? 0))
          .filter((id) => id > 0 && !(id in productMap))
      )
    );

    if (ids.length === 0) return;

    let mounted = true;

    Promise.all(
      ids.map((id) =>
        getProductoById(id)
          .then((p) => ({ id, p }))
          .catch(() => ({ id, p: null }))
      )
    ).then((results) => {
      if (!mounted) return;
      setProductMap((prev) => {
        const copy = { ...prev };
        results.forEach((r) => {
          copy[r.id] = r.p;
        });
        return copy;
      });
    });

    return () => {
      mounted = false;
    };
  }, [data, productMap]);
  
  // ========================
  // COLUMNAS TABLA (ADAPTADAS)
  // ========================
  const columns = [
    {
      key: "codigo",
      label: "CODIGO",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium",
      render: (row: Venta) => {
        const prod = row.producto ?? productMap[row.productoId];
        return prod?.codigo ?? `#${row.productoId}`;
      },
    },
    {
      key: "fecha",
      label: "FECHA",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Venta) => {
        if (!row.fecha) return "-";
        try {
          const d = new Date(row.fecha);
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();
          return `${day}/${month}/${year}`;
        } catch {
          return String(row.fecha);
        }
      },
    },
    
  
    {
      key: "producto",
      label: "PRODUCTO",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Venta) => {
        const prod = row.producto ?? productMap[row.productoId];
        return prod?.nombre ?? `#${row.productoId}`;
      },
    },
    {
      key: "categoria",
      label: "CATEGORIA",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Venta) => {
        const prod = row.producto ?? productMap[row.productoId];
        return prod?.categoria?.nombre ?? "-";
      },
    },
    {
      key: "cantidad",
      label: "CANTIDAD",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium",
    },
    {
      key: "precio_venta",
      label: "PRECIO DE VENTA",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Venta) => formatCurrency(row.precio_venta ?? 0),
    },
    {
      key: "costo_unitario",
      label: "COSTO UNITARIO",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Venta) => formatCurrency(row.costo_unitario ?? 0),
    },
    {
      key: "total_venta",
      label: "TOTAL VENTA",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-bold text-green-600",
      render: (row: Venta) =>
        formatCurrency((row.cantidad ?? 0) * (row.precio_venta ?? 0)),
    },
    {
      key: "utilidad",
      label: "UTILIDAD",
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-semibold text-indigo-700",
      render: (row: Venta) => {
        const cantidad = Number(row.cantidad ?? 0);
        const precio = Number(row.precio_venta ?? 0);
        const costo = Number(row.costo_unitario ?? 0);
        const utilidad = (precio - costo) * cantidad;
        return formatCurrency(utilidad);
      },
    },
  ];

  return (
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
    </div>
  );
}

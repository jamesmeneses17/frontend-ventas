"use client";

import React, { useState, useMemo } from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Venta } from "../services/ventasService";
import { Trash, Pencil, Eye } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import TableColumnFilter from "../common/TableColumnFilter";

interface Props {
  data: Venta[];
  allData?: Venta[];
  loading?: boolean;
  onEdit: (v: Venta) => void;
  onDelete: (id: number) => void;
  onView: (v: Venta) => void;
}

export default function VentasTable({
  data = [],
  allData = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
}: Props) {

  // ========================
  // ESTADO DE FILTROS LOCALES
  // ========================
  const [columnFilters, setColumnFilters] = useState<{
    fecha: string[];
    cliente: string[];
    producto: string[];
  }>({
    fecha: [],
    cliente: [],
    producto: [],
  });

  // ========================
  // HELPERS DE EXTRACCIÓN
  // ========================
  const extractValue = (row: Venta, key: "fecha" | "cliente" | "producto") => {
    if (key === "fecha") {
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
    }
    if (key === "cliente") {
      return row.cliente?.nombre || "Cliente General";
    }
    if (key === "producto") {
      const detalles = row.detalles || [];
      if (detalles.length === 0) return "Sin items";
      if (detalles.length === 1) {
        return detalles[0].producto?.nombre ?? detalles[0].producto?.codigo ?? "Producto";
      }
      return `Varios Productos (${detalles.length})`;
    }
    return "";
  };

  // Función para chequear si una fila pasa un filtro específico
  const checkFilter = (row: Venta, key: "fecha" | "cliente" | "producto", selectedValues: string[]) => {
    if (selectedValues.length === 0) return true;
    const val = extractValue(row, key);
    return selectedValues.includes(val);
  };

  // ========================
  // DETERMINAR DATOS A USAR PARA OPCIONES
  // ========================
  const dataForOptions = (allData && allData.length > 0) ? allData : data;

  // ========================
  // OPCIONES CASCADA
  // ========================
  const options = useMemo(() => {
    const getOptionsFor = (targetKey: "fecha" | "cliente" | "producto") => {
      const uniqueValues = new Set<string>();

      dataForOptions.forEach(row => {
        let pass = true;
        if (targetKey !== "fecha" && !checkFilter(row, "fecha", columnFilters.fecha)) pass = false;
        if (targetKey !== "cliente" && !checkFilter(row, "cliente", columnFilters.cliente)) pass = false;
        if (targetKey !== "producto" && !checkFilter(row, "producto", columnFilters.producto)) pass = false;

        if (pass) {
          uniqueValues.add(extractValue(row, targetKey));
        }
      });
      return Array.from(uniqueValues).sort();
    };

    return {
      fecha: getOptionsFor("fecha"),
      cliente: getOptionsFor("cliente"),
      producto: getOptionsFor("producto"),
    };
  }, [dataForOptions, columnFilters]);

  // ========================
  // FILTRAR DATA FINAL
  // ========================
  const filteredData = useMemo(() => {
    const source = (allData && allData.length > 0) ? allData : data;
    return source.filter(row => {
      if (!checkFilter(row, "fecha", columnFilters.fecha)) return false;
      if (!checkFilter(row, "cliente", columnFilters.cliente)) return false;
      if (!checkFilter(row, "producto", columnFilters.producto)) return false;
      return true;
    });
  }, [data, allData, columnFilters]);

  // Decidir qué mostramos
  const hasActiveFilters = columnFilters.fecha.length > 0 || columnFilters.cliente.length > 0 || columnFilters.producto.length > 0;

  // Ordenar siempre por fecha descendente
  const finalDisplayData = useMemo(() => {
    const d = hasActiveFilters ? filteredData : data;
    return [...d].sort((a, b) => {
      const dateA = new Date(a.fecha || 0).getTime();
      const dateB = new Date(b.fecha || 0).getTime();
      return dateB - dateA;
    });
  }, [hasActiveFilters, filteredData, data]);

  // Manejador de cambio de filtro
  const handleFilterChange = (key: keyof typeof columnFilters, selected: string[]) => {
    setColumnFilters(prev => ({ ...prev, [key]: selected }));
  };

  // ========================
  // COLUMNAS TABLA
  // ========================
  const columns = [
    {
      key: "fecha",
      label: (
        <TableColumnFilter
          title="Fecha"
          options={options.fecha}
          selected={columnFilters.fecha}
          onChange={(sel) => handleFilterChange("fecha", sel)}
        />
      ),
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2",
      render: (row: Venta) => extractValue(row, "fecha"),
    },
    {
      key: "cliente",
      label: (
        <TableColumnFilter
          title="Cliente"
          options={options.cliente}
          selected={columnFilters.cliente}
          onChange={(sel) => handleFilterChange("cliente", sel)}
        />
      ),
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium text-blue-800",
      render: (row: Venta) => extractValue(row, "cliente"),
    },
    {
      key: "producto",
      label: (
        <TableColumnFilter
          title="Producto(s)"
          options={options.producto}
          selected={columnFilters.producto}
          onChange={(sel) => handleFilterChange("producto", sel)}
        />
      ),
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium text-gray-800",
      render: (row: Venta) => {
        const detalles = row.detalles || [];
        if (detalles.length === 0) return <span className="text-gray-400">Sin items</span>;

        if (detalles.length === 1) {
          const prodName = detalles[0].producto?.nombre ?? detalles[0].producto?.codigo ?? "Producto";
          return prodName;
        }

        return (
          <div className="flex flex-col">
            <span>Varios Productos ({detalles.length})</span>
            <span className="text-xs text-gray-400">Ver detalles para más info</span>
          </div>
        );
      },
    },
    {
      key: "cantidad",
      label: "Cant.",
      headerClass: "px-4 py-3 text-center text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-center",
      render: (row: Venta) => {
        const totalQty = row.detalles?.reduce((acc, d) => acc + Number(d.cantidad), 0) || 0;
        return totalQty;
      }
    },
    {
      key: "total",
      label: "Total Venta",
      headerClass: "px-4 py-3 text-right text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-right font-bold text-green-600",
      render: (row: Venta) => formatCurrency(row.total || 0),
    },
    {
      key: "utilidad",
      label: "Total de Utilidad",
      headerClass: "px-4 py-3 text-right text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-right font-bold text-green-600",
      render: (row: Venta) => {
        const detalles = row.detalles || [];
        const utilidadVenta = detalles.reduce((u: number, d: any) => {
          const precioVenta = Number(d.precio_venta ?? 0);
          const costoUnit = Number(d.producto?.precio_costo ?? 0);
          const cantidad = Number(d.cantidad ?? 0);
          return u + (precioVenta - costoUnit) * cantidad;
        }, 0);
        return formatCurrency(utilidadVenta);
      },
    },
  ];

  return (
    <CrudTable
      columns={columns}
      data={finalDisplayData}
      loading={loading}
      tableClass="min-w-full divide-y divide-gray-200"
      headerClass="bg-gray-50 border-b"
      rowClass="hover:bg-gray-50 transition"
      renderRowActions={(row: Venta) => (
        <div className="flex items-center justify-end gap-2 px-4">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            onClick={() => onView(row)}
            color="primary"
          />
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

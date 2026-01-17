"use client";

import React, { useState, useMemo } from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Compra } from "../services/comprasService";
import { Trash, Pencil, Eye } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import TableColumnFilter from "../common/TableColumnFilter";

interface Props {
  data: Compra[];
  allData?: Compra[]; // 👈 Dataset completo opcional para filtros
  loading?: boolean;
  onEdit: (c: Compra) => void;
  onDelete: (id: number) => void;
  onView: (c: Compra) => void;
}

export default function ComprasTable({
  data = [],
  allData = [], // 👈 Default empty
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
    producto: string[];
    proveedor: string[];
  }>({
    fecha: [],
    producto: [],
    proveedor: [],
  });

  // ========================
  // HELPERS DE EXTRACCIÓN
  // ========================
  const extractValue = (row: Compra, key: "fecha" | "producto" | "proveedor") => {
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
    if (key === "producto") {
      if (row.detalles && row.detalles.length === 1) {
        return row.detalles[0].producto?.nombre || "Producto Desconocido";
      }
      return `Varios Productos (${row.detalles?.length || 0})`;
    }
    if (key === "proveedor") {
      return row.cliente?.nombre || "S/N";
    }
    return "";
  };

  // Función para chequear si una fila pasa un filtro específico
  const checkFilter = (row: Compra, key: "fecha" | "producto" | "proveedor", selectedValues: string[]) => {
    if (selectedValues.length === 0) return true;
    const val = extractValue(row, key);
    return selectedValues.includes(val);
  };

  // ========================
  // DETERMINAR DATOS A USAR PARA OPCIONES
  // ========================
  // Si nos pasan allData, usamos eso para generar las opciones, si no, usamos la data de la página
  const dataForOptions = (allData && allData.length > 0) ? allData : data;

  // ========================
  // OPCIONES CASCADA (Dependen de los otros filtros activos)
  // ========================
  const options = useMemo(() => {
    // Helper para obtener opciones de una columna asumiendo que los demas filtros aplican
    const getOptionsFor = (targetKey: "fecha" | "producto" | "proveedor") => {
      const uniqueValues = new Set<string>();

      dataForOptions.forEach(row => {
        // Verificar si pasa todos los filtros EXCEPTO el targetKey
        let pass = true;
        if (targetKey !== "fecha" && !checkFilter(row, "fecha", columnFilters.fecha)) pass = false;
        if (targetKey !== "producto" && !checkFilter(row, "producto", columnFilters.producto)) pass = false;
        if (targetKey !== "proveedor" && !checkFilter(row, "proveedor", columnFilters.proveedor)) pass = false;

        if (pass) {
          uniqueValues.add(extractValue(row, targetKey));
        }
      });
      return Array.from(uniqueValues).sort();
    };

    return {
      fecha: getOptionsFor("fecha"),
      producto: getOptionsFor("producto"),
      proveedor: getOptionsFor("proveedor"),
    };
  }, [dataForOptions, columnFilters]);

  // ========================
  // FILTRAR DATA FINAL
  // ========================
  const filteredData = useMemo(() => {
    // Si hay filtros activos, aplicamos sobre allData (o data si no hay allData)
    // Si NO hay filtros activos, este resultado no se usará preferiblemente, pero lo calculamos igual
    const source = (allData && allData.length > 0) ? allData : data;

    return source.filter(row => {
      if (!checkFilter(row, "fecha", columnFilters.fecha)) return false;
      if (!checkFilter(row, "producto", columnFilters.producto)) return false;
      if (!checkFilter(row, "proveedor", columnFilters.proveedor)) return false;
      return true;
    });
  }, [data, allData, columnFilters]);

  // Decidir qué mostramos:
  // 1. Si hay filtros activos -> mostramos filteredData (resultado de filtrar sobre TODO)
  // 2. Si NO hay filtros -> mostramos data (la página actual)
  const hasActiveFilters = columnFilters.fecha.length > 0 || columnFilters.producto.length > 0 || columnFilters.proveedor.length > 0;

  const displayData = hasActiveFilters ? filteredData : data;

  // Manejador de cambio de filtro
  const handleFilterChange = (key: keyof typeof columnFilters, selected: string[]) => {
    setColumnFilters(prev => ({ ...prev, [key]: selected }));
  };

  // ========================
  // COLUMNAS TABLA (Refactorizado para parecer vista de producto)
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
      render: (row: Compra) => {
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
      },
    },
    {
      key: "producto",
      label: (
        <TableColumnFilter
          title="Producto"
          options={options.producto}
          selected={columnFilters.producto}
          onChange={(sel) => handleFilterChange("producto", sel)}
        />
      ),
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 font-medium text-gray-800",
      render: (row: Compra) => {
        if (row.detalles && row.detalles.length === 1) {
          return row.detalles[0].producto?.nombre || "Producto Desconocido";
        }
        return `Varios Productos (${row.detalles?.length || 0})`;
      },
    },
    {
      key: "proveedor",
      label: (
        <TableColumnFilter
          title="Proveedor"
          options={options.proveedor}
          selected={columnFilters.proveedor}
          onChange={(sel) => handleFilterChange("proveedor", sel)}
        />
      ),
      headerClass: "px-4 py-3 text-left text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-gray-600",
      render: (row: Compra) => row.cliente?.nombre || "S/N",
    },
    {
      key: "cantidad",
      label: "Cantidad",
      headerClass: "px-4 py-3 text-center text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-center",
      render: (row: Compra) => {
        const totalQty = row.detalles?.reduce((acc, det) => acc + Number(det.cantidad), 0) || 0;
        return totalQty;
      },
    },
    {
      key: "total",
      label: "Total",
      headerClass: "px-4 py-3 text-right text-sm font-semibold text-gray-700",
      cellClass: "px-4 py-2 text-right font-bold text-blue-600",
      render: (row: Compra) => formatCurrency(row.total),
    },
  ];

  return (
    // 👈 Se eliminó el div con estilos (shadow-md, p-4, etc.) para que la tabla use el padding del contenedor padre
    <div>
      {/* =============================
          TABLA
      ============================== */}
      <CrudTable
        columns={columns}
        data={displayData}
        loading={loading}
        tableClass="min-w-full divide-y divide-gray-200"
        headerClass="bg-gray-50 border-b"
        rowClass="hover:bg-gray-50 transition"
        renderRowActions={(row: Compra) => (
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
    </div>
  );
}
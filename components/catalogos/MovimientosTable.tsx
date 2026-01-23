import React, { useState, useMemo } from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Trash, Pencil, Wallet } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { MovimientoCaja } from "../services/cajaService";
import TableColumnFilter from "../common/TableColumnFilter";

interface Props {
  data: MovimientoCaja[];
  allData?: MovimientoCaja[];
  loading?: boolean;
  onEdit: (movimiento: MovimientoCaja) => void;
  onDelete: (id: number) => void;
  onView: (movimiento: MovimientoCaja) => void;
}

export default function MovimientosTable({
  data,
  allData = [],
  loading,
  onEdit,
  onDelete,
  onView,
}: Props) {
  // ✅ Estilo profesional con bordes y tipografía mejorada
  const getTipoMovimientoClasses = (tipo?: string) => {
    if (!tipo) return "bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";

    const upper = tipo.toUpperCase();
    switch (upper) {
      case "INGRESO":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
      case "VENTA":
      case "INGRESO POR VENTA":
        return "bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
      case "EGRESO":
      case "GASTO":
        return "bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
      case "EGRESO POR COMPRA":
        return "bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
      case "INGRESOS POR ABONOS":
        return "bg-cyan-100 text-cyan-700 border border-cyan-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider";
    }
  };

  // ========================
  // FILTERS STATE
  // ========================
  const [columnFilters, setColumnFilters] = useState<{
    fecha: string[];
    tipo: string[];
  }>({
    fecha: [],
    tipo: [],
  });

  const extractValue = (row: MovimientoCaja, key: "fecha" | "tipo") => {
    if (key === "fecha") return row.fecha ? formatDate(row.fecha) : "";
    if (key === "tipo") {
      let nombre = row.tipoMovimiento?.nombre || "N/A";
      if (nombre.toUpperCase() === 'VENTA') nombre = 'Ingreso por Venta';
      return nombre;
    }
    return "";
  };

  const checkFilter = (row: MovimientoCaja, key: "fecha" | "tipo", selectedValues: string[]) => {
    if (selectedValues.length === 0) return true;
    return selectedValues.includes(extractValue(row, key));
  };

  const dataForOptions = (allData && allData.length > 0) ? allData : data;

  const options = useMemo(() => {
    const getOptionsFor = (targetKey: "fecha" | "tipo") => {
      const uniqueValues = new Set<string>();
      dataForOptions.forEach(row => {
        let pass = true;
        if (targetKey !== "fecha" && !checkFilter(row, "fecha", columnFilters.fecha)) pass = false;
        if (targetKey !== "tipo" && !checkFilter(row, "tipo", columnFilters.tipo)) pass = false;

        if (pass) uniqueValues.add(extractValue(row, targetKey));
      });
      return Array.from(uniqueValues).sort();
    };
    return {
      fecha: getOptionsFor("fecha"),
      tipo: getOptionsFor("tipo"),
    };
  }, [dataForOptions, columnFilters]);

  // Filtrar data
  const filteredData = useMemo(() => {
    const source = (allData && allData.length > 0) ? allData : data;
    return source.filter(row => {
      if (!checkFilter(row, "fecha", columnFilters.fecha)) return false;
      if (!checkFilter(row, "tipo", columnFilters.tipo)) return false;
      return true;
    });
  }, [data, allData, columnFilters]);

  const hasActiveFilters = columnFilters.fecha.length > 0 || columnFilters.tipo.length > 0;
  // Sort by date desc when filtering
  const displayData = useMemo(() => {
    const d = hasActiveFilters ? filteredData : data;
    // Ensure sorting if filtered (data from page is usually sorted but allData might not be strictly sorted or we want to ensure it)
    if (hasActiveFilters) {
      return [...d].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }
    return d;
  }, [hasActiveFilters, filteredData, data]);


  const handleFilterChange = (key: "fecha" | "tipo", selected: string[]) => {
    setColumnFilters(prev => ({ ...prev, [key]: selected }));
  };

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
      render: (row: MovimientoCaja) => (
        <span className="text-gray-600 font-medium">{formatDate(row.fecha)}</span>
      )
    },
    {
      key: "tipo_movimiento",
      label: (
        <TableColumnFilter
          title="Tipo"
          options={options.tipo}
          selected={columnFilters.tipo}
          onChange={(sel) => handleFilterChange("tipo", sel)}
        />
      ),
      render: (row: MovimientoCaja) => {
        let nombreTipo = row.tipoMovimiento?.nombre || "N/A";
        if (nombreTipo.toUpperCase() === 'VENTA') {
          nombreTipo = 'Ingreso por Venta';
        }
        return (
          <div className="flex items-center gap-2">
            <span className={getTipoMovimientoClasses(row.tipoMovimiento?.nombre)}>
              {nombreTipo}
            </span>
          </div>
        );
      }
    },
    {
      key: "concepto",
      label: "Descripción / Concepto",
      render: (row: MovimientoCaja) => (
        <div className="max-w-[240px] md:max-w-xs text-sm text-gray-700">
          <div className="line-clamp-2 break-words" title={row.concepto}>
            {(() => {
              const concepto = row.concepto || "Sin descripción";
              const matchId = concepto.match(/Compra (?:ID|Ref): (\d+)/i);
              if (matchId && concepto.includes("Productos:")) {
                const idCompra = matchId[1];
                let totalUnidades = 0;
                const regexCant = /Cant:\s*(\d+)/g;
                let m;
                // eslint-disable-next-line no-cond-assign
                while ((m = regexCant.exec(concepto)) !== null) {
                  totalUnidades += parseInt(m[1], 10);
                }
                if (totalUnidades > 0) {
                  return (
                    <span className="italic text-gray-600">
                      Compra #{idCompra} - Total unidades: {totalUnidades}
                    </span>
                  );
                }
                const parteProductos = concepto.split("Productos:")[1] || "";
                const itemsCount = parteProductos.split(',').filter(s => s.trim() !== '').length;
                return (
                  <span className="italic text-gray-600">
                    Compra #{idCompra} - Varios items ({itemsCount})
                  </span>
                );
              }
              return concepto;
            })()}
          </div>
        </div>
      )
    },
    {
      key: "monto",
      label: "Monto",
      render: (row: MovimientoCaja) => {
        const nombreTipo = row.tipoMovimiento?.nombre?.toUpperCase() || "";
        const isPositive = nombreTipo === 'INGRESO' || nombreTipo === 'VENTA' || nombreTipo === 'INGRESO POR VENTA' || nombreTipo === 'INGRESOS POR ABONOS';

        return (
          <div className={`flex items-center gap-1 font-mono font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span>{isPositive ? '+' : '-'}</span>
            <span>{formatCurrency(row.monto)}</span>
          </div>
        );
      }
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <CrudTable
        columns={columns}
        data={displayData}
        loading={loading}
        renderRowActions={(row: MovimientoCaja) => (
          <div className="flex items-center justify-end gap-1">
            <ActionButton
              icon={<Wallet className="w-3.5 h-3.5" />} // Using Wallet or Eye
              // Let's use Eye as requested generally, but importing it
              // Need to import Eye if not present
              onClick={() => onView(row)}
              color="primary"
              className="hover:bg-blue-50 text-blue-600"
            />
            <ActionButton
              icon={<Pencil className="w-3.5 h-3.5" />}
              onClick={() => onEdit(row)}
              className="hover:bg-blue-50 text-blue-600"
            />
            <ActionButton
              icon={<Trash className="w-3.5 h-3.5" />}
              onClick={() => onDelete(row.id)}
              color="danger"
              className="hover:bg-red-50 text-red-600"
            />
          </div>
        )}
      />
    </div>
  );
}
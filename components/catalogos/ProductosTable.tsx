import React, { useState, useMemo } from "react";
import Image from "next/image";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { ProductoInventario, Categoria, Estado } from "../services/productosService";
import { Subcategoria } from "../services/subcategoriasService";
import { Trash, Pencil } from "lucide-react";
import { isImageUrl } from "../../utils/ProductUtils";
import { formatCurrency } from "../../utils/formatters";
import TableColumnFilter from "../common/TableColumnFilter";

interface Props {
  data: ProductoInventario[];
  allData?: ProductoInventario[];
  categorias: Categoria[];
  subcategorias?: Subcategoria[];
  estados: Estado[];
  loading?: boolean;
  totalItems?: number;
  onEdit: (producto: ProductoInventario) => void;
  onDelete: (id: number) => void;
}
export default function ProductosTable({
  data,
  allData = [],
  categorias,
  subcategorias = [],
  estados,
  loading,
  totalItems = 0,
  onEdit,
  onDelete,
}: Props) {
  // ... (Helpers remain same, extracting for filters) ...
  const getCategoriaFromSubcategoria = (subcategoriaId: number | undefined) => {
    if (!subcategoriaId || subcategoriaId === 0) return "";
    const subcategoria = subcategorias.find((s) => s.id === subcategoriaId);
    if (!subcategoria) return "";
    const categoriaId = subcategoria.categoria_id || (subcategoria as any).categoriaPrincipalId;
    const categoria = categorias.find((c) => c.id === categoriaId);
    return categoria?.nombre || "";
  };

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

  // ========================
  // FILTERS STATE
  // ========================
  const [columnFilters, setColumnFilters] = useState<{
    codigo: string[];
    nombre: string[];
  }>({
    codigo: [],
    nombre: [],
  });

  const extractValue = (row: ProductoInventario, key: "codigo" | "nombre") => {
    if (key === "codigo") return row.codigo || "";
    if (key === "nombre") return row.nombre || "";
    return "";
  };

  const checkFilter = (row: ProductoInventario, key: "codigo" | "nombre", selectedValues: string[]) => {
    if (selectedValues.length === 0) return true;
    return selectedValues.includes(extractValue(row, key));
  };

  const dataForOptions = (allData && allData.length > 0) ? allData : data;

  const options = useMemo(() => {
    const getOptionsFor = (targetKey: "codigo" | "nombre") => {
      const uniqueValues = new Set<string>();
      dataForOptions.forEach(row => {
        let pass = true;
        // Cascading logic between code and name (though usually 1-1)
        if (targetKey !== "codigo" && !checkFilter(row, "codigo", columnFilters.codigo)) pass = false;
        if (targetKey !== "nombre" && !checkFilter(row, "nombre", columnFilters.nombre)) pass = false;

        if (pass) uniqueValues.add(extractValue(row, targetKey));
      });
      return Array.from(uniqueValues).sort();
    };
    return {
      codigo: getOptionsFor("codigo"),
      nombre: getOptionsFor("nombre"),
    };
  }, [dataForOptions, columnFilters]);

  // Filtrar data
  const filteredData = useMemo(() => {
    const source = (allData && allData.length > 0) ? allData : data;
    return source.filter(row => {
      if (!checkFilter(row, "codigo", columnFilters.codigo)) return false;
      if (!checkFilter(row, "nombre", columnFilters.nombre)) return false;
      return true;
    });
  }, [data, allData, columnFilters]);

  const hasActiveFilters = columnFilters.codigo.length > 0 || columnFilters.nombre.length > 0;
  const displayData = hasActiveFilters ? filteredData : data;

  const handleFilterChange = (key: "codigo" | "nombre", selected: string[]) => {
    setColumnFilters(prev => ({ ...prev, [key]: selected }));
  };

  // ✅ DEFINICIÓN DE COLUMNAS SIMPLIFICADA PARA 'CONTROL DE INVENTARIO'
  const columns = [
    {
      key: "codigo",
      label: (
        <TableColumnFilter
          title="Código"
          options={options.codigo}
          selected={columnFilters.codigo}
          onChange={(sel) => handleFilterChange("codigo", sel)}
        />
      ),
      render: (row: ProductoInventario) => row.codigo
    },
    {
      key: "nombre",
      label: (
        <TableColumnFilter
          title="Nombre"
          options={options.nombre}
          selected={columnFilters.nombre}
          onChange={(sel) => handleFilterChange("nombre", sel)}
        />
      ),
      // Se muestra completo en hover con title y se permite salto de línea.
      render: (row: ProductoInventario) => (
        <div
          className="px-6 py-4 text-sm text-gray-900 max-w-xs break-words whitespace-normal"
          title={row.nombre}
        >
          {row.nombre}
        </div>
      ),
      cellClass: "px-0 py-0", // padding interno viene en el render
    },

    // Eliminamos Subcategoría, Imagen y Ficha Técnica para simplificar la vista de Inventario.

    {
      key: "compras",
      label: "Compras",
      render: (row: ProductoInventario) => (
        <span className="text-sm text-gray-700">{row.compras ?? 0}</span>
      ),
    },
    {
      key: "ventas",
      label: "Ventas",
      render: (row: ProductoInventario) => (
        <span className="text-sm text-gray-700">{row.ventas ?? 0}</span>
      ),
    },
    { key: "stock", label: "Stock" },
    {
      key: "costo_unitario",
      label: "Costo Unitario",
      render: (row: ProductoInventario) => (
        <span className="font-semibold">{formatCurrency(row.precio_costo ?? 0)}</span>
      ),
    },
    {
      key: "promocion_porcentaje",
      label: "Promoción %",
      render: (row: ProductoInventario) => (
        <span className={`font-semibold ${row.promocion_porcentaje > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
          {row.promocion_porcentaje > 0 ? `${row.promocion_porcentaje}%` : '-'}
        </span>
      ),
    },
    {
      key: "precio_con_descuento",
      label: "Precio Venta",
      render: (row: ProductoInventario) => (
        <span className={`font-semibold ${row.promocion_porcentaje > 0 ? 'text-green-600' : 'text-gray-700'}`}>
          {formatCurrency(row.precio_con_descuento ?? 0)}
        </span>
      ),
    },
    {
      key: "utilidad",
      label: "Utilidad / Producto",
      render: (row: ProductoInventario) => (
        <span className={`font-semibold ${row.utilidad < 0 ? "text-red-600" : "text-green-600"}`}>
          {formatCurrency(row.utilidad ?? 0)}
        </span>
      ),
    },
    {
      key: "valor_inventario",
      label: "Valor Inventario",
      render: (row: ProductoInventario) => (
        <span className="text-sm text-gray-700">
          {formatCurrency(row.valor_inventario ?? 0)}
        </span>
      ),
    },
    {
      key: "estado_stock",
      label: "Estado de Venta",
      render: (row: ProductoInventario) => (
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
    <div className="w-full">
      <CrudTable
        columns={columns}
        data={displayData}
        loading={loading}
        renderRowActions={(row: ProductoInventario) => (
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

      {/* 🛑 ELIMINAMOS EL RESUMEN DEL FOOTER DE ESTA TABLA */}
      {/* {!loading && (
         <p className="text-sm text-gray-600 mt-4">
           Mostrando {data.length} de {totalItems} productos
         </p>
       )}
       {loading && <p className="text-sm text-gray-600 mt-4">Cargando...</p>}
      */}
    </div>
  );
}

// ------------------------------------------------------
// 🔵 Subcomponente RowFiles (Necesario si lo usas en la tabla, aunque la hemos quitado en 'columns')
// ------------------------------------------------------
function RowFiles({
  producto,
  uploadAsFicha,
}: {
  producto: ProductoInventario;
  uploadAsFicha?: boolean;
}) {
  const [preview, setPreview] = React.useState<string | null>(
    producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0].url_imagen : null
  );

  React.useEffect(() => {
    setPreview(producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0].url_imagen : null);
  }, [producto.imagenes]);

  return (
    <div className="flex items-center gap-2">
      {!uploadAsFicha ? (
        preview ? (
          isImageUrl(preview) ? (
            <a href={preview} target="_blank" rel="noreferrer">
              <Image
                src={preview}
                alt={`Imagen producto ${producto.nombre || producto.id}`}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded border cursor-pointer"
              />
            </a>
          ) : (
            <a href={preview} target="_blank" rel="noreferrer" className="text-sm text-gray-700">
              Ver archivo
            </a>
          )
        ) : (
          <div className="w-12 h-12 flex flex-col items-center justify-center bg-gray-100 text-gray-400 rounded border text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                ry="2"
                strokeWidth="1.5"
              ></rect>
              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5"></circle>
              <path
                d="M21 15l-5-5-9 9"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span className="mt-0.5">Sin Imagen</span>
          </div>
        )
      ) : producto.ficha_tecnica_url ? (
        <a
          href={producto.ficha_tecnica_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-gray-700"
        >
          Ver PDF
        </a>
      ) : (
        <span className="text-sm text-gray-500">Sin Ficha</span>
      )}
    </div>
  );
}
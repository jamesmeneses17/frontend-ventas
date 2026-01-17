import React, { useState, useMemo } from "react";
import Image from 'next/image';
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Producto, Categoria, Estado } from "../services/productosService";
import { Subcategoria } from "../services/subcategoriasService";
import { Trash, Pencil } from "lucide-react";
import TableColumnFilter from "../common/TableColumnFilter";

interface Props {
  data: Producto[];
  allData?: Producto[];
  categorias: Categoria[];
  subcategorias?: Subcategoria[];
  estados: Estado[];
  loading?: boolean;
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
}

export default function ListaTable({
  data,
  allData = [],
  categorias,
  subcategorias = [],
  estados,
  loading,
  onEdit,
  onDelete,
}: Props) {

  // ========================
  // HELPERS (Reused for extraction)
  // ========================
  const getCategoriaFromSubcategoria = (subcategoriaId: number | undefined): string => {
    if (!subcategoriaId || subcategoriaId === 0) return "";
    const subcategoria = subcategorias.find((s) => s.id === subcategoriaId);
    if (!subcategoria) return "";
    const categoriaId = subcategoria.categoria_id || (subcategoria as any).categoriaId || (subcategoria as any).categoriaPrincipalId;
    if (!categoriaId) return "";
    const categoria = categorias.find((c) => c.id === categoriaId);
    return categoria?.nombre || "";
  };

  const getNombreSubcategoria = (subcategoriaId: number | undefined): string => {
    if (!subcategoriaId || subcategoriaId === 0) return "";
    const subcategoria = subcategorias.find((s) => s.id === subcategoriaId);
    return subcategoria?.nombre || "";
  };

  const extractValue = (row: Producto, key: "codigo" | "nombre" | "categoria" | "subcategoria") => {
    if (key === "codigo") return row.codigo || "-";
    if (key === "nombre") return row.nombre || "-";
    if (key === "categoria") {
      const subId = (row as any).subcategoriaId ?? (row as any).subcategoria_id;
      if (subId && subId !== 0) {
        const catName = getCategoriaFromSubcategoria(subId);
        if (catName) return catName;
      }
      const catId = (row as any).categoriaId ?? (row as any).categoria_id;
      if (catId) {
        const c = categorias.find(cat => cat.id === catId);
        if (c?.nombre) return c.nombre;
      }
      return "Sin categoría";
    }
    if (key === "subcategoria") {
      const subId = (row as any).subcategoriaId ?? (row as any).subcategoria_id;
      if (subId && subId > 0) {
        const subName = getNombreSubcategoria(subId);
        if (subName) return subName;
      }
      return "Sin subcategoría";
    }
    return "";
  };

  // ========================
  // FILTROS
  // ========================
  const [columnFilters, setColumnFilters] = useState<{
    codigo: string[];
    nombre: string[];
    categoria: string[];
    subcategoria: string[];
  }>({
    codigo: [],
    nombre: [],
    categoria: [],
    subcategoria: [],
  });

  const checkFilter = (row: Producto, key: keyof typeof columnFilters, selectedValues: string[]) => {
    if (selectedValues.length === 0) return true;
    const val = extractValue(row, key);
    return selectedValues.includes(val);
  };

  const dataForOptions = (allData && allData.length > 0) ? allData : data;

  const options = useMemo(() => {
    const getOptionsFor = (targetKey: keyof typeof columnFilters) => {
      const uniqueValues = new Set<string>();
      dataForOptions.forEach(row => {
        let pass = true;
        Object.keys(columnFilters).forEach(k => {
          if (k !== targetKey && !checkFilter(row, k as any, columnFilters[k as keyof typeof columnFilters])) {
            pass = false;
          }
        });
        if (pass) uniqueValues.add(extractValue(row, targetKey));
      });
      return Array.from(uniqueValues).sort();
    };

    return {
      codigo: getOptionsFor("codigo"),
      nombre: getOptionsFor("nombre"),
      categoria: getOptionsFor("categoria"),
      subcategoria: getOptionsFor("subcategoria"),
    };
  }, [dataForOptions, columnFilters]);

  // Filtrar data
  const filteredData = useMemo(() => {
    const source = (allData && allData.length > 0) ? allData : data;
    return source.filter(row => {
      if (!checkFilter(row, "codigo", columnFilters.codigo)) return false;
      if (!checkFilter(row, "nombre", columnFilters.nombre)) return false;
      if (!checkFilter(row, "categoria", columnFilters.categoria)) return false;
      if (!checkFilter(row, "subcategoria", columnFilters.subcategoria)) return false;
      return true;
    });
  }, [data, allData, columnFilters]);

  const hasActiveFilters = Object.values(columnFilters).some(f => f.length > 0);
  const displayData = hasActiveFilters ? filteredData : data;

  const handleFilterChange = (key: keyof typeof columnFilters, selected: string[]) => {
    setColumnFilters(prev => ({ ...prev, [key]: selected }));
  };

  // ========================
  // COLUMNAS
  // ========================
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
      render: (row: Producto) => extractValue(row, "codigo")
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
      cellClass: "px-6 py-4 text-sm text-gray-900 max-w-xs break-words whitespace-normal",
      render: (row: Producto) => extractValue(row, "nombre")
    },
    {
      key: "categoria",
      label: (
        <TableColumnFilter
          title="Categoría"
          options={options.categoria}
          selected={columnFilters.categoria}
          onChange={(sel) => handleFilterChange("categoria", sel)}
        />
      ),
      render: (row: Producto) => extractValue(row, "categoria"),
    },
    {
      key: "subcategoria",
      label: (
        <TableColumnFilter
          title="Subcategoría"
          options={options.subcategoria}
          selected={columnFilters.subcategoria}
          onChange={(sel) => handleFilterChange("subcategoria", sel)}
        />
      ),
      render: (row: Producto) => extractValue(row, "subcategoria"),
    },
    {
      key: "imagen",
      label: "Imagen",
      render: (row: Producto) => <RowFiles producto={row} />,
    },
    {
      key: "ficha",
      label: "Ficha Técnica",
      render: (row: Producto) => <RowFiles producto={row} uploadAsFicha />,
    },
    {
      key: "activo",
      label: "Activo",
      render: (row: Producto) =>
        row.activo === true ? (
          <span className="text-green-600 font-semibold">Sí</span>
        ) : (
          <span className="text-red-500 font-semibold">No</span>
        ),
    },
  ];

  return (
    <CrudTable
      columns={columns}
      data={displayData}
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

// Subcomponente que maneja input y subida por fila (imagen o ficha)
function RowFiles({ producto, uploadAsFicha }: { producto: Producto; uploadAsFicha?: boolean }) {
  // ✅ Usar la primera imagen del array imagenes
  const primeraImagen = producto.imagenes?.[0]?.url_imagen || null;
  const [preview, setPreview] = React.useState<string | null>(primeraImagen);

  React.useEffect(() => {
    const nuevaImagen = producto.imagenes?.[0]?.url_imagen || null;
    setPreview(nuevaImagen);
  }, [producto.imagenes]);

  return (
    <div className="flex items-center gap-2">
      {!uploadAsFicha ? (
        preview ? (
          <a href={preview} target="_blank" rel="noreferrer">
            <Image
              src={preview}
              alt={`Imagen producto ${producto.nombre || producto.id}`}
              width={48}
              height={48}
              className="w-12 h-12 object-cover rounded border cursor-pointer"
              unoptimized
            />
          </a>
        ) : (
          <div className="w-12 h-12 flex flex-col items-center justify-center bg-gray-100 text-gray-400 rounded border text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="1.5"></rect>
              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5"></circle>
              <path d="M21 15l-5-5-9 9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className="mt-0.5">Sin Imagen</span>
          </div>
        )
      ) : (
        producto.ficha_tecnica_url ? (
          <a href={producto.ficha_tecnica_url} target="_blank" rel="noreferrer" className="text-sm text-gray-700">Ver PDF</a>
        ) : (
          <span className="text-sm text-gray-500">Sin Ficha</span>
        )
      )}
    </div>
  );
}

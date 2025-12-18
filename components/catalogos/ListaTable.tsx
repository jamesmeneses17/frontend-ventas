"use client";

import React from "react";
import Image from 'next/image';
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Producto, Categoria, Estado } from "../services/productosService";
import { Subcategoria } from "../services/subcategoriasService";
import { isImageUrl } from "../../utils/ProductUtils";
import { Trash, Pencil } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  data: Producto[];
  categorias: Categoria[];
  subcategorias?: Subcategoria[];
  estados: Estado[];
  loading?: boolean;
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
}

export default function ListaTable({
  data,
  categorias,
  subcategorias = [],
  estados,
  loading,
  onEdit,
  onDelete,
}: Props) {
  // Debug
  React.useEffect(() => {
    if (data.length > 0) {
      console.log("[ListaTable] Debug data:", {
        dataLength: data.length,
        subcategoriasLength: subcategorias.length,
        subcategorias: subcategorias.map(s => ({ id: s.id, nombre: s.nombre, categoria_id: s.categoria_id })),
        firstProducto: data[0] ? {
          codigo: (data[0] as any).codigo,
          nombre: (data[0] as any).nombre,
          subcategoria_id: (data[0] as any).subcategoria_id || (data[0] as any).subcategoriaId,
          categoria_id: (data[0] as any).categoria_id || (data[0] as any).categoriaId,
          allKeys: Object.keys(data[0]),
          fullObject: data[0],
        } : null,
      });
    }
  }, [data, subcategorias]);
  // ✅ Helper para obtener el nombre de la categoría padre de una subcategoría
  const getCategoriaFromSubcategoria = (subcategoriaId: number | undefined): string => {
    if (!subcategoriaId || subcategoriaId === 0) return "";
    
    const subcategoria = subcategorias.find((s) => s.id === subcategoriaId);
    if (!subcategoria) {
      console.warn("[ListaTable] Subcategoría no encontrada:", subcategoriaId, "Disponibles:", subcategorias.map(s => s.id));
      return "";
    }
    
    // Intentar obtener categoria_id de varias formas
    const categoriaId = subcategoria.categoria_id || (subcategoria as any).categoriaId || (subcategoria as any).categoriaPrincipalId;
    if (!categoriaId) {
      console.warn("[ListaTable] categoria_id no encontrado en subcategoría:", subcategoria);
      return "";
    }
    
    const categoria = categorias.find((c) => c.id === categoriaId);
    if (!categoria) {
      console.warn("[ListaTable] Categoría no encontrada:", categoriaId, "Disponibles:", categorias.map(c => c.id));
      return "";
    }
    
    return categoria.nombre || "";
  };

  // ✅ Helper para obtener el nombre de la subcategoría
  const getNombreSubcategoria = (subcategoriaId: number | undefined): string => {
    if (!subcategoriaId || subcategoriaId === 0) return "";
    
    const subcategoria = subcategorias.find((s) => s.id === subcategoriaId);
    return subcategoria?.nombre || "";
  };
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
    { 
      key: "nombre", 
      label: "Nombre",
      cellClass: "px-6 py-4 text-sm text-gray-900 max-w-xs break-words whitespace-normal"
    },
    {
      key: "categoria",
      label: "Categoría",
      render: (row: Producto) => {
        const subcategoriaId = (row as any).subcategoriaId ?? (row as any).subcategoria_id;
        
        // Si tiene subcategoría, obtener la categoría padre
        if (subcategoriaId && subcategoriaId !== 0) {
          const categoriaNombre = getCategoriaFromSubcategoria(subcategoriaId);
          if (categoriaNombre) return categoriaNombre;
        }
        
        // Si no tiene subcategoría, buscar la categoría directamente
        const categoriaId = (row as any).categoriaId ?? (row as any).categoria_id;
        if (categoriaId) {
          const categoria = categorias.find((c) => c.id === categoriaId);
          if (categoria?.nombre) return categoria.nombre;
        }
        
        return "Sin categoría";
      },
    },
    {
      key: "subcategoria",
      label: "Subcategoría",
      render: (row: Producto) => {
        const subcategoriaId = (row as any).subcategoriaId ?? (row as any).subcategoria_id;
        
        // Si tiene subcategoría válida (mayor a 0), mostrar el nombre
        if (subcategoriaId && subcategoriaId > 0) {
          const nombreSubcategoria = getNombreSubcategoria(subcategoriaId);
          if (nombreSubcategoria) return nombreSubcategoria;
        }
        
        return "Sin subcategoría";
      },
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

"use client";

import React from "react";
import Image from 'next/image';
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Producto, Categoria, Estado } from "../services/productosService";
import { isImageUrl } from "../../utils/ProductUtils";
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

export default function ListaTable({
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
      key: "imagen",
      label: "Imagen",
      render: (row: Producto) => <RowFiles producto={row} />,
    },
    {
      key: "ficha",
      label: "Ficha Técnica",
      render: (row: Producto) => <RowFiles producto={row} uploadAsFicha />,
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
  const [preview, setPreview] = React.useState<string | null>(producto.imagen_url || null);

  React.useEffect(() => {
    setPreview(producto.imagen_url || null);
  }, [producto.imagen_url]);

  return (
    <div className="flex items-center gap-2">
      {!uploadAsFicha ? (
        preview ? (
            isImageUrl(preview) ? (
            <a href={preview} target="_blank" rel="noreferrer">
              <Image src={preview} alt={`Imagen producto ${producto.nombre || producto.id}`} width={48} height={48} className="w-12 h-12 object-cover rounded border cursor-pointer" />
            </a>
          ) : (
            <a href={preview} target="_blank" rel="noreferrer" className="text-sm text-gray-700">Ver archivo</a>
          )
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

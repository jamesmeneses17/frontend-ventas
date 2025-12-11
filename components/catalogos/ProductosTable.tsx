"use client";

import React from "react";
import Image from "next/image";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Producto, Categoria, Estado } from "../services/productosService";
import { Subcategoria } from "../services/subcategoriasService";
import { Trash, Pencil } from "lucide-react";
import { isImageUrl } from "../../utils/ProductUtils";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  data: Producto[];
  categorias: Categoria[];
  subcategorias?: Subcategoria[];
  estados: Estado[];
  loading?: boolean;
  totalItems?: number; // Lo mantenemos pero no lo usaremos en el footer de este componente
  onEdit: (producto: Producto) => void;
  onDelete: (id: number) => void;
}

export default function ProductosTable({
  data,
  categorias,
  subcategorias = [],
  estados,
  loading,
  totalItems = 0,
  onEdit,
  onDelete,
}: Props) {
  // ... (Helpers de categorías y estados omitidos por ser idénticos y funcionales) ...
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

  // ✅ DEFINICIÓN DE COLUMNAS SIMPLIFICADA PARA 'CONTROL DE INVENTARIO'
  const columns = [
    { key: "codigo", label: "Código" },
    {
      key: "nombre",
      label: "Nombre",
      // Se muestra completo en hover con title y se permite salto de línea.
      render: (row: Producto) => (
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
      render: (row: Producto) => (
        <span className="text-sm text-gray-700">{row.compras ?? 0}</span>
      ),
    },
    {
      key: "ventas",
      label: "Ventas",
      render: (row: Producto) => (
        <span className="text-sm text-gray-700">{row.ventas ?? 0}</span>
      ),
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
          (row as any).precio_venta ?? (row as any).precioVenta ?? row.precio ?? 0
        );
        return (
          <span className="font-semibold">
            {formatCurrency(precioVenta)}
          </span>
        );
      },
    },
    {
      key: "promocion_porcentaje",
      label: "Promoción %",
      render: (row: Producto) => {
        const promocion = Number((row as any).promocion_porcentaje ?? 0);
        return (
          <span className={`font-semibold ${promocion > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
            {promocion > 0 ? `${promocion}%` : '-'}
          </span>
        );
      },
    },
    {
      key: "precio_con_descuento",
      label: "Precio con Descuento",
      render: (row: Producto) => {
        const precioVenta = Number(
          (row as any).precio_venta ?? (row as any).precioVenta ?? row.precio ?? 0
        );
        const promocion = Number((row as any).promocion_porcentaje ?? 0);
        
        let precioFinal = precioVenta;
        if (promocion > 0) {
          precioFinal = precioVenta - (precioVenta * promocion / 100);
        }
        
        return (
          <span className={`font-semibold ${promocion > 0 ? 'text-green-600' : 'text-gray-700'}`}>
            {formatCurrency(precioFinal)}
          </span>
        );
      },
    },
    /*{
      key: "utilidad",
      label: "Utilidad / Producto",
      render: (row: Producto) => {
        const costo = Number((row as any).precio_costo ?? 0);
        const pv = Number(
          (row as any).precio_venta ?? (row as any).precioVenta ?? row.precio ?? 0
        );
        const utilidad = pv - costo;

        return (
          <span
            className={`font-semibold ${
              utilidad < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatCurrency(utilidad)}
          </span>
        );
      },
    },
    */
 {
      key: "utilidad",
      label: "Utilidad / Producto",
      render: (row: Producto) => {
        const costo = Number((row as any).precio_costo ?? 0);
        const pv = Number(
          (row as any).precio_venta ?? (row as any).precioVenta ?? row.precio ?? 0
        );
        const promo = Number((row as any).promocion_porcentaje ?? 0);
        const precioConDescuento = promo > 0 ? pv - (pv * promo) / 100 : pv;
        const utilidad = precioConDescuento - costo;

        return (
          <span
            className={`font-semibold ${
              utilidad < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
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
        return (
          <span className="text-sm text-gray-700">
            {formatCurrency(costo * stock)}
          </span>
        );
      },
    },
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
  producto: Producto;
  uploadAsFicha?: boolean;
}) {
  const [preview, setPreview] = React.useState<string | null>(
    producto.imagen_url || null
  );

  React.useEffect(() => {
    setPreview(producto.imagen_url || null);
  }, [producto.imagen_url]);

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
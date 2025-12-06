// components/catalogos/SubcategoriasTable.tsx

"use client";

import React, { useEffect, useState } from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Subcategoria } from "../services/subcategoriasService"; 
import { Categoria, getCategorias } from "../services/categoriasService";
import { Trash, Pencil } from "lucide-react";

// ⚠️ No necesitamos importar Categoria/Estado aquí, ya que el servicio 
// Subcategorias se encarga de traer el 'categoria_nombre' para la tabla.

interface Props {
  data: Subcategoria[];
  loading?: boolean;
  categorias?: Categoria[];
  onEdit: (subcategoria: Subcategoria) => void;
  onDelete: (id: number) => void;
}

export default function SubcategoriasTable({
  data,
  loading,
  categorias,
  onEdit,
  onDelete,
}: Props) {

  const [parentNames, setParentNames] = useState<Record<number, string>>({});

  // Build a map of categoria_id -> nombre to avoid showing N/A when the API no trae categoria_nombre.
  useEffect(() => {
    let mounted = true;

    const buildFromProp = () => {
      if (!categorias || categorias.length === 0) return false;
      const map = categorias.reduce<Record<number, string>>((acc, cat) => {
        acc[cat.id] = cat.nombre;
        return acc;
      }, {});
      if (mounted) setParentNames(map);
      return true;
    };

    const already = buildFromProp();
    if (already) return () => { mounted = false; };

    (async () => {
      try {
        const listResponse: any = await getCategorias(true, 1, 1000, '');
        if (!mounted) return;
        // Extraer array de la respuesta paginada
        const list = Array.isArray(listResponse?.data) 
          ? listResponse.data as Categoria[]
          : (listResponse as Categoria[] || []);
        const map = list.reduce<Record<number, string>>((acc, cat) => {
          acc[cat.id] = cat.nombre;
          return acc;
        }, {});
        setParentNames(map);
      } catch (err) {
        // Si falla, dejamos el fallback de categoria_nombre/N/A
        console.debug("No se pudieron cargar categorías para mapear nombres de padres", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [categorias]);
  
  // ✅ Columnas de la tabla para Subcategorías
  const columns = [
    { key: "nombre", label: "Subcategoría" },
    {
      key: "categoria_nombre",
      label: "Categoría Padre",
      // Asumimos que el backend trae este campo vía JOIN
      render: (row: Subcategoria) => (
        <span className="font-semibold text-blue-600">
          {row.categoria_nombre || parentNames[row.categoria_id] || "N/A"}
        </span>
      ),
    },
   
  ];

  return (
    <CrudTable
      columns={columns}
      data={data}
      loading={loading}
      renderRowActions={(row: Subcategoria) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButton
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => onEdit(row)}
            aria-label={`Editar ${row.nombre}`}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            onClick={() => onDelete(row.id)}
            color="danger"
            aria-label={`Eliminar ${row.nombre}`}
          />
        </div>
      )}
    />
  );
}
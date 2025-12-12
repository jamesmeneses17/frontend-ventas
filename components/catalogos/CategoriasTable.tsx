"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { Categoria } from "../services/categoriasService";
import { getCategoriaById } from "../services/categoriasService";
import { getCategoriaPrincipalById } from "../services/categoriasPrincipalesService";
import { isImageUrl } from "../../utils/ProductUtils";
interface Props {
  data: Categoria[];
  loading?: boolean;
  totalItems?: number;
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
}

export default function CategoriasTable({ data, loading, totalItems = 0, onEdit, onDelete }: Props) {
  const [parentMap, setParentMap] = useState<Record<number, string>>({});

  useEffect(() => {
    // recopilar ids de padres que no están en el `data` y no en el cache
    const missingIds = Array.from(
      new Set(
        data
          .map((d) => d.categoriaPrincipalId)
          .filter((id): id is number => typeof id === "number" && id > 0 && !(id in parentMap))
      )
    );

    if (missingIds.length === 0) return;

    let cancelled = false;

    (async () => {
      const results: Record<number, string> = {};
      await Promise.all(
        missingIds.map(async (id) => {
          try {
            // Intentar obtener primero como categoria (por compatibilidad),
            // si no existe, pedir a categorias-principales
            let name: string | undefined;
            try {
              const cat = await getCategoriaById(id);
              name = cat?.nombre;
            } catch {
              // ignorar
            }
            if (!name) {
              try {
                const catP = await getCategoriaPrincipalById(id);
                name = catP?.nombre;
              } catch {
                // ignorar
              }
            }
            if (!cancelled) results[id] = name ?? "-";
          } catch (err) {
            if (!cancelled) results[id] = "-";
          }
        })
      );
      if (!cancelled) setParentMap((prev) => ({ ...prev, ...results }));
    })();

    return () => {
      cancelled = true;
    };
  }, [data, parentMap]);

  const columns = [
    {
      key: "imagen",
      label: "Imagen",
      render: (row: Categoria) => {
        return (
          <div className="w-12 h-12 relative">
            {row.imagen_url ? (
              <Image
                src={row.imagen_url}
                alt={row.nombre}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded border"
                unoptimized
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                Sin imagen
              </div>
            )}
          </div>
        );
      },
    },
    { key: "nombre", label: "Nombre" },
    {
      key: "activo",
      label: "Activo",
      render: (row: Categoria) => {
        const isActivo = Number((row as any).activo ?? 1) === 1;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isActivo 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isActivo ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <CrudTable
        columns={columns}
        data={data}
        loading={loading}
        renderRowActions={(row: Categoria) => (
          <div className="flex items-center justify-end gap-2">
            <ActionButton
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              }
              onClick={() => onEdit(row)}
            />
            <ActionButton
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              }
              onClick={() => onDelete(row.id)}
              color="danger"
            />
          </div>
        )}
      />

      {!loading && (
        <p className="text-sm text-gray-600 mt-4">
          Mostrando {data.length} de {totalItems || data.length} resultados
        </p>
      )}

      {loading && (
        <p className="text-sm text-gray-600 mt-4">Cargando...</p>
      )}
    </div>
  );
}
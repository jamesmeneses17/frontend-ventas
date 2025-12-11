// components/catalogos/CategoriaPrincipalTable.tsx

"use client";

import React from "react";
import Image from "next/image";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { CategoriaPrincipal } from "../services/categoriasPrincipalesService";
import { Trash, Pencil, CheckCircle, XCircle } from "lucide-react";
import { isImageUrl } from "../../utils/ProductUtils";

interface Props {
    data: CategoriaPrincipal[];
    loading?: boolean;
    onEdit: (categoria: CategoriaPrincipal) => void;
    onDelete: (id: number) => void; // Para la acción de eliminar/desactivar
}

export default function CategoriaPrincipalTable({
    data,
    loading,
    onEdit,
    onDelete,
}: Props) {
    
    // Definición de las columnas de la tabla
    const columns = [
        {
            key: "imagen",
            label: "Imagen",
            render: (row: CategoriaPrincipal) => {
                console.log('[CategoriaPrincipalTable] Categoría:', row.nombre, 'imagen_url:', row.imagen_url, 'isImageUrl:', isImageUrl(row.imagen_url));
                return (
                    <div className="w-12 h-12 relative">
                        {row.imagen_url && isImageUrl(row.imagen_url) ? (
                            <Image 
                                src={row.imagen_url} 
                                alt={row.nombre} 
                                width={48} 
                                height={48} 
                                className="w-12 h-12 object-cover rounded border" 
                            />
                        ) : row.imagen_url ? (
                            <div className="w-12 h-12 bg-yellow-100 rounded border flex items-center justify-center text-xs text-yellow-700">
                                URL inválida
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                                Sin imagen
                            </div>
                        )}
                    </div>
                );
            },
        },
        { 
            key: "nombre", 
            label: "Nombre de la Categoría",
            render: (row: CategoriaPrincipal) => <span className="font-medium text-gray-800">{row.nombre}</span>
        },
        {
            key: "activo",
            label: "Activo",
            render: (row: CategoriaPrincipal) => {
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
            }
        }
    ];

    return (
        <CrudTable
            columns={columns}
            data={data}
            loading={loading}
            // Definición de las acciones que se pueden realizar en cada fila
            renderRowActions={(row: CategoriaPrincipal) => (
                <div className="flex items-center justify-end gap-2">
                    <ActionButton
                        icon={<Pencil className="w-4 h-4" />}
                        onClick={() => onEdit(row)}
                        color="primary"
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
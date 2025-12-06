// components/catalogos/CategoriaPrincipalTable.tsx

"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { CategoriaPrincipal } from "../services/categoriasPrincipalesService";
import { Trash, Pencil, CheckCircle, XCircle } from "lucide-react";

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
            key: "nombre", 
            label: "Nombre de la Categoría",
            render: (row: CategoriaPrincipal) => <span className="font-medium text-gray-800">{row.nombre}</span>
        },
       
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
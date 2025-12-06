// src/components/configuracion-web/InformacionEmpresaTable.tsx
// NOTA: Este componente está diseñado solo para mantener la estructura.
// La entidad InformacionEmpresa solo tiene un registro y NO usa tabla.

"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { InformacionEmpresa } from "../../types/configuracion";
import { Trash, Pencil } from "lucide-react";

interface Props {
    data: InformacionEmpresa[];
    loading?: boolean;
    onEdit: (item: InformacionEmpresa) => void;
    onDelete: (id: number) => void;
}

export default function InformacionEmpresaTable({
    data,
    loading,
    onEdit,
    onDelete,
}: Props) {
    
    // Definimos las columnas que usaríamos si fueran varios registros
    const columns = [
        { key: "nombreEmpresa", label: "Empresa" },
        { key: "emailInfo", label: "Email Contacto" },
        { key: "telefonoFijo", label: "Teléfono" },
        { key: "updatedAt", label: "Última Actualización" },
    ];

    return (
        <CrudTable
            columns={columns}
            data={data}
            loading={loading}
            renderRowActions={(row: InformacionEmpresa) => (
                <div className="flex items-center justify-end gap-2">
                    {/* En la práctica, solo habría un botón de "Editar" en la página principal */}
                    <ActionButton
                        icon={<Pencil className="w-4 h-4" />}
                        onClick={() => onEdit(row)}
                        label="Editar"
                    />
                </div>
            )}
        />
    );
}
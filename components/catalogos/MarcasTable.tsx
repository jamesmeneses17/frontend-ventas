"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";

interface Marca {
  id: number;
  nombre: string;
  descripcion: string;
  estado: "Activo" | "Inactivo";
}

interface Props {
  data: Marca[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function MarcasTable({ data, onEdit, onDelete }: Props) {
  const columns = [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "estado", label: "Estado" },
  ];

  return (
    <CrudTable
      columns={columns}
      data={data}
      renderRowActions={(row: Marca) => (
        <div className="flex gap-2">
          <ActionButton
            icon="edit"
            label="Editar"
            onClick={() => onEdit(row.id)}
          />
          <ActionButton
            icon="delete"
            label="Eliminar"
            onClick={() => onDelete(row.id)}
            color="danger"
          />
        </div>
      )}
    />
  );
}

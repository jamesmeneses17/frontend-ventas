"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";

interface Subcategoria {
  id: number;
  nombre: string;
  categoria: string;
  estado: "Activo" | "Inactivo";
}

interface Props {
  data: Subcategoria[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function SubcategoriasTable({ data, onEdit, onDelete }: Props) {
  const columns = [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "categoria", label: "Categoría" },
    { key: "estado", label: "Estado" },
  ];

  return (
    <CrudTable
      columns={columns}
      data={data}
      renderRowActions={(row: Subcategoria) => (
        <div className="flex gap-2">
          <ActionButton icon="edit" label="Editar" onClick={() => onEdit(row.id)} />
          <ActionButton icon="delete" label="Eliminar" onClick={() => onDelete(row.id)} color="danger" />
        </div>
      )}
    />
  );
}

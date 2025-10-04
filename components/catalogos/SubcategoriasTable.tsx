"use client";

import React, { useState } from "react";
import FormInput from "../../components/common/form/FormInput";
import FormSelect from "../../components/common/form/FormSelect";

interface Props {
  initialData?: {
    nombre: string;
    categoria: string;
    estado: "Activo" | "Inactivo";
  };
  categoriasOptions: { label: string; value: string }[];
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function SubcategoriasForm({
  initialData,
  categoriasOptions,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState(
    initialData || { nombre: "", categoria: "", estado: "Activo" }
  );

  const handleChange = (field: string, value: any) => {
    setValues({ ...values, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Nombre"
        name="nombre"
        value={values.nombre}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("nombre", e.target.value)}
      />
      <FormSelect
        label="Categoría"
        name="categoria"
        value={values.categoria}
        options={categoriasOptions}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("categoria", e.target.value)}
      />
      <FormSelect
        label="Estado"
        name="estado"
        value={values.estado}
        options={[
          { label: "Activo", value: "Activo" },
          { label: "Inactivo", value: "Inactivo" },
        ]}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("estado", e.target.value)}
      />
      <div className="flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-md">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">
          Guardar
        </button>
      </div>
    </form>
  );
}

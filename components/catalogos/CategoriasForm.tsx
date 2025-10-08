"use client";

import React, { useState } from "react";
import FormInput from "../common/form/FormInput";

interface Props {
  initialData?: {
    nombre: string;
    //descripcion?: string;
    //estado: "Activo" | "Inactivo";
  };
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export default function CategoriasForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState(
    initialData || { nombre: "", descripcion: "", estado: "Activo" }
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
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleChange("nombre", e.target.value)
        }
      />

      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

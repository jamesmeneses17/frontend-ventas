"use client";

import React, { useState } from "react";
import FormInput from "../common/form/FormInput";

interface Props {
  initialData?: {
    nombre: string;
    estadoId?: number;
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
    initialData || { nombre: "", estadoId: 1 }
  );

  const handleChange = (field: string, value: any) => {
    if (field === "estadoId") {

      setValues({ ...values, [field]: Number(value) });
    } else {
      setValues({ ...values, [field]: value });
    }
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

      <div>
        <label
          htmlFor="estadoId"
          className="block text-sm font-medium text-gray-700"
        >
          Estado
        </label>
        <select
          id="estadoId"
          name="estadoId"
          value={values.estadoId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("estadoId", e.target.value)
          }
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value={1}>Activo</option>
          <option value={2}>Inactivo</option>
        </select>
      </div>

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

"use client";

import React, { useState } from "react";
import FormInput from "../../components/common/form/FormInput";
import FormTextArea from "../../components/common/form/FormTextArea";
import FormSelect from "../../components/common/form/FormSelect";
import FormSwitch from "../../components/common/form/FormSwitch";

interface Props {
  initialData?: {
    nombre: string;
    descripcion?: string;
    estado: "Activo" | "Inactivo";
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
      <FormTextArea
        label="Descripción"
        name="descripcion"
        value={values.descripcion || ""}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          handleChange("descripcion", e.target.value)
        }
      />
      <FormSelect
        label="Estado"
        name="estado"
        value={values.estado}
        options={[
          { label: "Activo", value: "Activo" },
          { label: "Inactivo", value: "Inactivo" },
        ]}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          handleChange("estado", e.target.value)
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

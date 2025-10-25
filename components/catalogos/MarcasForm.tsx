// MarcasForm.tsx (Versión Final)

"use client";

import React, { useState } from "react";
import Alert from "@/components/ui/Alert";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import {
  createMarca,
  updateMarca,
  CreateMarcaData,
  UpdateMarcaData,
} from "../services/marcasService";

// 1. INTERFACES
interface MarcaFormData {
  nombre: string;
  estadoId: number;
}

interface Props {
  initialData?: {
    id?: number;
    nombre: string;
    estadoId: number;
  }; // La función que el componente padre usa para manejar el éxito (y cerrar el modal)
  onSuccess?: (marca: any) => void;
  onCancel?: () => void;
}

// Función de extracción de errores
const extractErrorMessage = (err: any): string => {
  const respData = err?.response?.data;

  if (typeof respData === "string") return respData;

  if (respData?.message) {
    if (Array.isArray(respData.message)) return respData.message.join(" | ");
    if (typeof respData.message === "object")
      return Object.values(respData.message).join(" | ");
    return respData.message;
  }

  const status = err?.response?.status;
  if (status) return `Error del servidor (código ${status})`;

  return "Error desconocido";
};

// 🛑 SE ELIMINA el código de `handleSuccess`, `setIsModalOpen`, etc., de aquí.
// Esas variables/funciones pertenecen al componente padre.

export default function MarcasForm({
  initialData,
  onSuccess,
  onCancel,
}: Props) {
  const [values, setValues] = useState<MarcaFormData>(
    initialData
      ? { nombre: initialData.nombre, estadoId: initialData.estadoId }
      : { nombre: "", estadoId: 1 }
  );
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (field: keyof MarcaFormData, value: any) => {
    const finalValue = field === "estadoId" ? Number(value) : value;
    setValues({ ...values, [field]: finalValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (values.nombre.trim() === "") {
      setApiError("El nombre de la Marca no puede estar vacío.");
      return;
    }

    setLoading(true);

    const payload: CreateMarcaData | UpdateMarcaData = {
      nombre: values.nombre,
      estadoId: values.estadoId,
    };

    try {
      let result: any;
      if (initialData?.id) {
        result = await updateMarca(initialData.id, payload);
      } else {
        result = await createMarca(payload as CreateMarcaData);
      }
      onSuccess?.(result);
    } catch (err: any) {
      const message = extractErrorMessage(err);
      setApiError(message); // Si el submit es delegado, relanzar para que el padre lo maneje también // (opcional, según integración)
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
                  {/* Mostrar alerta de error */}           {" "}
      {apiError && (
        <div className="mb-4">
                             {" "}
          <Alert
            type="error"
            message={apiError}
            onClose={() => setApiError(null)}
          />
                         {" "}
        </div>
      )}
                 {" "}
      <form onSubmit={handleSubmit} className="space-y-4">
                       {" "}
        <FormInput
          label="Nombre de la Marca"
          name="nombre"
          value={values.nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange("nombre", e.target.value)
          }
          required
          disabled={loading}
        />
                       {" "}
        <FormSelect
          label="Estado"
          name="estadoId"
          value={values.estadoId.toString()}
          options={[
            { label: "Activo", value: "1" },
            { label: "Inactivo", value: "2" },
          ]}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleChange("estadoId", e.target.value)
          }
          disabled={loading}
        />
                       {" "}
        <div className="flex items-center justify-end gap-4">
                             {" "}
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
                                    Cancelar                    {" "}
          </button>
                             {" "}
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
                                    {loading ? "Guardando..." : "Guardar"}     
                         {" "}
          </button>
                         {" "}
        </div>
                   {" "}
      </form>
             {" "}
    </div>
  );
}

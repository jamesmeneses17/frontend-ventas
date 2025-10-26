"use client";

import React, { useState } from 'react';
import Alert from '@/components/ui/Alert'; // Componente de alerta (asumiendo esta ruta)
import FormInput from '@/components/common/form/FormInput'; // Componente de input (asumiendo esta ruta)
import { createMetodoPago, updateMetodoPago, CreateMetodoPagoData, UpdateMetodoPagoData } from '../services/metodosPagoService'; // Servicio para create/update

// Asumo que tienes una función similar a esta para extraer errores de Axios.
// Si esta función ya existe en tu proyecto (por ejemplo, en un archivo de utilidades),
// puedes importarla y eliminar la definición local.
const extractErrorMessage = (err: any): string => {
  const respData = err?.response?.data;

  // Si viene como string directamente
  if (typeof respData === 'string') return respData;

  // Si tiene campo message (típico de NestJS)
  if (respData?.message) {
    // Si message es un array (típico de validaciones)
    if (Array.isArray(respData.message)) {
      return respData.message.join(' | ');
    }
    if (typeof respData.message === 'object') {
      return Object.values(respData.message).join(' | ');
    }
    return respData.message; // string directo
  }

  // Fallback con status code
  const status = err?.response?.status;
  if (status) return `Error del servidor (código ${status})`;

  return 'Error desconocido';
};
// FIN extractErrorMessage (si existe, eliminar esta definición y usar import)


interface Props {
  // initialData incluye id cuando es edición
  initialData?: {
    id?: number;
    nombre: string;
  };
  onSuccess?: (metodo: any) => void;
  onCancel?: () => void;
  // El onSubmit delegado solo necesita el campo 'nombre'
  onSubmit?: (formData: { nombre: string }) => Promise<any>;
}

const MetodosPagoForm: React.FC<Props> = ({ initialData, onSuccess, onCancel, onSubmit }) => {
  const [values, setValues] = useState({
    nombre: initialData?.nombre ?? '',
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setValues((s) => ({ ...s, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null); // limpiar errores al inicio
    
    // Validación simple de campo requerido
    if (!values.nombre.trim()) {
      setApiError('El nombre del método de pago es obligatorio.');
      return;
    }

    setLoading(true);

    const payload: CreateMetodoPagoData = {
      nombre: values.nombre.trim(),
    };

    try {
      let result: any;
      
      if (onSubmit) {
        // Si la página pasó su propio onSubmit, lo usamos
        result = await onSubmit(payload);
      } else {
        if (initialData?.id) {
          // edición
          result = await updateMetodoPago(initialData.id, payload as UpdateMetodoPagoData);
        } else {
          // creación
          result = await createMetodoPago(payload);
        }
      }

      // llamar callback de éxito si existe
      onSuccess?.(result);

    } catch (err: any) {
      const message = extractErrorMessage(err);
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Mostrar alerta de error encima del formulario si existe apiError */}
      {apiError && (
        <div className="mb-4">
          <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Nombre del Método de Pago"
          name="nombre"
          value={values.nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('nombre', e.target.value)}
          placeholder="Ej: Efectivo"
          required
          // Si tu FormInput no maneja el estado de error, puedes implementarlo aquí con clases
        />

        {/* Se elimina el campo de Estado (Select) */}
        
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Guardando...' : initialData?.id ? 'Actualizar Método' : 'Crear Método'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MetodosPagoForm;
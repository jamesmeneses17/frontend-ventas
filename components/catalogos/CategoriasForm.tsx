import React, { useState } from 'react';
import Alert from '@/components/ui/Alert'; // Componente de alerta
import FormInput from '@/components/common/form/FormInput'; // asumo disponible
import { createCategoria, updateCategoria } from '../services/categoriasService'; // servicio para create/update

interface Props {
  // initialData puede incluir id cuando es edición
  initialData?: {
    id?: number;
    nombre: string;
    estadoId?: number;
  };
  onSuccess?: (categoria: any) => void;
  onCancel?: () => void;
  // Si se pasa, el formulario delega el submit a esta función (por compatibilidad con la page)
  onSubmit?: (formData: { nombre: string; estadoId: number }) => Promise<any>;
}

const CategoriasForm: React.FC<Props> = ({ initialData, onSuccess, onCancel, onSubmit }) => {
  const [values, setValues] = useState({
    nombre: initialData?.nombre ?? '',
    estadoId: initialData?.estadoId ?? 1,
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setValues((s) => ({ ...s, [field]: value }));
  };

const extractErrorMessage = (err: any): string => {
  const respData = err?.response?.data;

  // Si viene como string directamente
  if (typeof respData === 'string') return respData;

  // Si tiene campo message
  if (respData?.message) {
    // Si message es un array (típico de validaciones)
    if (Array.isArray(respData.message)) {
      return respData.message.join(' | ');
    }
    // Si message es un objeto (por ejemplo, { nombre: "ya existe" })
    if (typeof respData.message === 'object') {
      return Object.values(respData.message).join(' | ');
    }
    return respData.message; // string directo
  }

  // Si tiene campo error
  if (respData?.error) return respData.error;

  // Si Axios trae un mensaje genérico
  if (err?.message) return err.message;

  // Fallback con status code
  const status = err?.response?.status;
  if (status) return `Error del servidor (código ${status})`;

  return 'Error desconocido';
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null); // limpiar errores al inicio
    setLoading(true);

    const payload = {
      nombre: values.nombre,
      estadoId: values.estadoId,
    };

    try {
      let result: any;
      if (onSubmit) {
        // si la página pasó su propio onSubmit, lo usamos (p. ej. para manejar modal o flujo)
        result = await onSubmit(payload);
      } else {
        if (initialData?.id) {
          // edición
          result = await updateCategoria(initialData.id, payload);
        } else {
          // creación
          result = await createCategoria(payload);
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
          label="Nombre"
          name="nombre"
          value={values.nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('nombre', e.target.value)}
          required
        />

        <div>
          <label htmlFor="estadoId" className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="estadoId"
            name="estadoId"
            value={values.estadoId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('estadoId', Number(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value={1}>Activo</option>
            <option value={2}>Inactivo</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-4">
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
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoriasForm;
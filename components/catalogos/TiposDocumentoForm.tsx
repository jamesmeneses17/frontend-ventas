import React, { useState } from 'react';
import FormInput from '@/components/common/form/FormInput';
import Alert from '../ui/Alert';
import {
  TipoDocumento,
  createTipoDocumento,
  updateTipoDocumento,
} from '../services/tiposDocumentoService';

interface Props {
  initialData?: TipoDocumento;
  onSuccess: (data: TipoDocumento) => void;
  onCancel: () => void;
}

// --- Función para extraer mensajes de error del backend ---
const extractErrorMessage = (err: any): string => {
  const data = err?.response?.data;

  if (typeof data === 'string') return data;

  if (data?.message) {
    if (Array.isArray(data.message)) return data.message.join(' | ');
    if (typeof data.message === 'object') return Object.values(data.message).join(' | ');
    return data.message;
  }

  if (data?.error) return data.error;

  return err?.message || 'Error desconocido';
};

// --- Componente principal ---
const TiposDocumentoForm: React.FC<Props> = ({ initialData, onSuccess, onCancel }) => {
  const [nombre, setNombre] = useState(initialData?.nombre ?? '');
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!initialData?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);

    // 🔥 Creamos payload limpio sin ID
    const payload = { nombre: nombre.trim() };

    if (!payload.nombre) {
      setApiError('El nombre del tipo de documento es obligatorio.');
      setLoading(false);
      return;
    }

    try {
      let result: TipoDocumento;

      if (isEditing && initialData?.id) {
        console.debug('[TiposDocumentoForm] Editando tipo documento ID:', initialData.id);
        result = await updateTipoDocumento(initialData.id, payload);
      } else {
        console.debug('[TiposDocumentoForm] Creando nuevo tipo documento con payload:', payload);
        result = await createTipoDocumento(payload);
      }

      onSuccess(result);
    } catch (err: any) {
      console.error('[TiposDocumentoForm] Error en guardado:', err?.response?.data ?? err);
      setApiError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Alerta de error */}
      {apiError && (
        <div className="mb-4">
          <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Nombre del Tipo de Documento"
          name="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading || nombre.trim() === ''}
          >
            {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Tipo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TiposDocumentoForm;

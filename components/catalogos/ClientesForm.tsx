import React, { useState } from 'react';
import Alert from '@/components/ui/Alert'; // Componente de alerta
import FormInput from '@/components/common/form/FormInput'; // asumo disponible
import { createCliente, CreateClienteData, updateCliente, UpdateClienteData } from '../services/clientesServices';
// Importamos los tipos de datos y los servicios específicos de clientes

// --- Configuración de Opciones Fijas (Simulación) ---
// En una app real, estas opciones se cargarían desde un servicio (ej: /tipos-documento)
const DOCUMENTO_OPTIONS = [
  { id: 1, name: "DNI" },
  { id: 2, name: "RUC" },
  { id: 3, name: "Carnet Extranjería" },
];

// --- INTERFACES ---

interface InitialClientData extends CreateClienteData {
  id?: number; // Opcional solo cuando es creación
}

interface Props {
  initialData?: InitialClientData;
  onSuccess?: (cliente: any) => void;
  onCancel?: () => void;
  // La función onSubmit ahora recibe los datos específicos del Cliente
  onSubmit?: (formData: CreateClienteData) => Promise<any>;
}

// --- FUNCIÓN DE UTILIDAD PARA ERRORES (Copiada de CategoriasForm) ---
const extractErrorMessage = (err: any): string => {
  const respData = err?.response?.data;

  if (typeof respData === 'string') return respData;

  if (respData?.message) {
    if (Array.isArray(respData.message)) {
      return respData.message.join(' | ');
    }
    if (typeof respData.message === 'object') {
      return Object.values(respData.message).join(' | ');
    }
    return respData.message; 
  }

  if (respData?.error) return respData.error;

  if (err?.message) return err.message;

  const status = err?.response?.status;
  if (status) return `Error del servidor (código ${status})`;

  return 'Error desconocido';
};

// --- COMPONENTE CLIENTES FORM ---

const ClientesForm: React.FC<Props> = ({ initialData, onSuccess, onCancel, onSubmit }) => {
  const [values, setValues] = useState<CreateClienteData>({
    nombre: initialData?.nombre ?? '',
    tipo_documento_id: initialData?.tipo_documento_id ?? 1, // Valor por defecto
    numero_documento: initialData?.numero_documento ?? '',
    direccion: initialData?.direccion ?? '',
    correo: initialData?.correo ?? '',
    telefono: initialData?.telefono ?? '',
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof CreateClienteData, value: string | number) => {
    // Asegurarse de que tipo_documento_id se guarde como número
    const finalValue = field === 'tipo_documento_id' ? Number(value) : value;
    setValues((s) => ({ ...s, [field]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);

    const payload: CreateClienteData = values;

    try {
      let result: any;
      if (onSubmit) {
        // Usa la función de la página (useCrudCatalog)
        result = await onSubmit(payload);
      } else {
        if (initialData?.id) {
          // Edición
          const updatePayload: UpdateClienteData = payload; // UpdateData es Partial<CreateData>
          result = await updateCliente(initialData.id, updatePayload);
        } else {
          // Creación
          result = await createCliente(payload);
        }
      }

      onSuccess?.(result);
    } catch (err: any) {
      const message = extractErrorMessage(err);
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!initialData?.id;

  return (
    <div>
      {/* Alerta de error */}
      {apiError && (
        <div className="mb-4">
          <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Nombre */}
        <FormInput
          label="Nombre Completo"
          name="nombre"
          value={values.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          required
        />

        {/* Campo Tipo de Documento (Select) */}
        <div>
          <label htmlFor="tipo_documento_id" className="block text-sm font-medium text-gray-700">
            Tipo de Documento
          </label>
          <select
            id="tipo_documento_id"
            name="tipo_documento_id"
            value={values.tipo_documento_id}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('tipo_documento_id', Number(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            required
          >
            {DOCUMENTO_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>
        
        {/* Campo Número de Documento */}
        <FormInput
          label="Número de Documento"
          name="numero_documento"
          value={values.numero_documento}
          onChange={(e) => handleChange('numero_documento', e.target.value)}
          required
        />

        {/* Campo Teléfono */}
        <FormInput
          label="Teléfono"
          name="telefono"
          value={values.telefono}
          onChange={(e) => handleChange('telefono', e.target.value)}
          type="tel"
        />

        {/* Campo Correo */}
        <FormInput
          label="Correo Electrónico"
          name="correo"
          value={values.correo}
          onChange={(e) => handleChange('correo', e.target.value)}
          type="email"
        />

        {/* Campo Dirección */}
        <FormInput
          label="Dirección"
          name="direccion"
          value={values.direccion}
          onChange={(e) => handleChange('direccion', e.target.value)}
        />
        
        {/* Botones de Acción */}
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
            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Cliente')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientesForm;
import React, { useState, useEffect } from 'react'; // <-- Añadido useEffect
import FormInput from '@/components/common/form/FormInput'; 
import { createCliente, CreateClienteData, updateCliente, UpdateClienteData, getClientes } from '../services/clientesServices';
// <-- Importamos el nuevo servicio y tipo de datos
import { getTiposDocumento, TipoDocumento } from '../services/tiposDocumentoService'; 
import Alert from '../ui/Alert';

// --- Configuración de Opciones Fijas (Eliminada - La cargaremos dinámicamente) ---
// const DOCUMENTO_OPTIONS = [...] 

// --- INTERFACES ---

interface InitialClientData extends CreateClienteData {
  id?: number; 
}

interface Props {
  initialData?: InitialClientData;
  onSuccess?: (cliente: any) => void;
  onCancel?: () => void;
  onSubmit?: (formData: CreateClienteData) => Promise<any>;
}

// --- FUNCIÓN DE UTILIDAD PARA ERRORES (Reutilizada) ---
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
    tipo_documento_id: initialData?.tipo_documento_id ?? 1, 
    numero_documento: initialData?.numero_documento ?? '',
    direccion: initialData?.direccion ?? '',
    correo: initialData?.correo ?? '',
    telefono: initialData?.telefono ?? '',
  });

  // ESTADOS PARA CARGAR LOS TIPOS DE DOCUMENTO
  const [documentTypes, setDocumentTypes] = useState<TipoDocumento[]>([]);
  const [docLoading, setDocLoading] = useState(true);
  const [docError, setDocError] = useState<string | null>(null);

  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEditing = !!initialData?.id;

  // EFECTO para cargar los tipos de documento al iniciar el componente
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setDocLoading(true);
        const data = await getTiposDocumento();
        setDocumentTypes(data);

        // Si estamos creando un nuevo cliente y tenemos documentos, establecemos el primer ID como valor por defecto.
        // O si estamos editando, nos aseguramos de que el ID exista en la lista cargada.
        if (data.length > 0) {
            const initialDocId = initialData?.tipo_documento_id || data[0].id;
            setValues(s => ({ ...s, tipo_documento_id: initialDocId }));
        }
        
      } catch (err) {
        setDocError("Error al cargar los tipos de documento. Por favor, recargue la página.");
        setDocumentTypes([]); // Aseguramos que la lista esté vacía en caso de error
      } finally {
        setDocLoading(false);
      }
    };

    fetchDocumentTypes();
    // La dependencia inicialData?.tipo_documento_id ayuda si el initialData cambia (ej: de crear a editar)
  }, [initialData?.tipo_documento_id]); 


  const handleChange = (field: keyof CreateClienteData, value: string | number) => {
    const finalValue = field === 'tipo_documento_id' ? Number(value) : value;
    setValues((s) => ({ ...s, [field]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setLoading(true);

    const payload: CreateClienteData = values;

    try {
      // VALIDACIÓN FRONTAL: evitar crear o actualizar clientes con documento duplicado
      try {
        const matches = await getClientes(String(values.numero_documento).trim(), 1, 50);
        const exists = matches.some((c: any) => {
          const sameDoc = String(c.numero_documento).trim() === String(values.numero_documento).trim();
          const sameTipo = Number(c.tipo_documento_id) === Number(values.tipo_documento_id);
          if (!isEditing) return sameDoc && sameTipo;
          // Si estamos editando, ignorar el propio registro (mismo id)
          const isSelf = initialData?.id && Number(c.id) === Number(initialData.id);
          return sameDoc && sameTipo && !isSelf;
        });
        if (exists) {
          throw new Error('Ya existe un cliente con ese tipo y número de documento.');
        }
      } catch (checkErr: any) {
        // Si la validación frontal detectó duplicado, propagamos el error
        if (checkErr.message && checkErr.message.includes('Ya existe')) {
          throw checkErr;
        }
        // Si falla la consulta (red/servidor), no bloqueamos la operación aquí;
        // el backend debe realizar la validación definitiva y responder con error.
      }

      let result: any;
      if (onSubmit) {
        result = await onSubmit(payload);
      } else {
        if (initialData?.id) {
          const updatePayload: UpdateClienteData = payload; 
          result = await updateCliente(initialData.id, updatePayload);
        } else {
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

  return (
    <div>
      {/* Alerta de error principal */}
      {apiError && (
        <div className="mb-4">
          <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
        </div>
      )}

    
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            {/* Nombre Completo */}
            <div className="md:col-span-2"> 
                <FormInput
                    label="Nombre Completo"
                    name="nombre"
                    value={values.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    required
                />
            </div>

            {/* Tipo de Documento (1ra columna) */}
            <div>
                <label htmlFor="tipo_documento_id" className="block text-sm font-medium text-gray-700">
                    Tipo de Documento *
                </label>
                {docLoading ? (
                    <p className="mt-1 text-sm text-gray-500">Cargando...</p>
                ) : (
                    <select
                        id="tipo_documento_id"
                        name="tipo_documento_id"
                        value={values.tipo_documento_id}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('tipo_documento_id', Number(e.target.value))}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                        disabled={documentTypes.length === 0} // Deshabilita si no hay opciones cargadas
                    >
                        {/* Renderiza las opciones dinámicas */}
                        {documentTypes.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.nombre}</option>
                        ))}
                    </select>
                )}
            </div>
            
            {/* Número de Documento (2da columna) */}
            <div>
                <FormInput
                    label="Número de Documento"
                    name="numero_documento"
                    value={values.numero_documento}
                    onChange={(e) => handleChange('numero_documento', e.target.value)}
                    required
                />
            </div>

            {/* Correo Electrónico (1ra columna) */}
            <div>
                <FormInput
                    label="Correo Electrónico"
                    name="correo"
                    value={values.correo}
                    onChange={(e) => handleChange('correo', e.target.value)}
                    type="email"
                />
            </div>

            {/* Teléfono (2da columna) */}
            <div>
                <FormInput
                    label="Teléfono"
                    name="telefono"
                    value={values.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    type="tel"
                />
            </div>

            {/* Dirección (Ocupa las dos columnas en PC) */}
            <div className="md:col-span-2"> 
                <FormInput
                    label="Dirección"
                    name="direccion"
                    value={values.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                />
            </div>
        </div>
        
        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            disabled={loading || docLoading}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            // Deshabilita si está cargando el formulario o los documentos
            disabled={loading || docLoading || documentTypes.length === 0} 
          >
            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Cliente')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientesForm;
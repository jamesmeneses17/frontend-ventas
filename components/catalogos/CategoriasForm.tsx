import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Alert from '@/components/ui/Alert'; // Componente de alerta
import FormInput from '@/components/common/form/FormInput'; // asumo disponible
import { createCategoria, updateCategoria, uploadImagenCategoria } from '../services/categoriasService'; // servicio para create/update
import { getCategoriasPrincipales, CategoriaPrincipal } from '../services/categoriasPrincipalesService';

interface Props {
  // initialData puede incluir id cuando es edición
  initialData?: {
    id?: number;
    nombre: string;
    activo?: number;
    categoriaPrincipalId?: number | null;
    imagen_url?: string | null;
  };
  onSuccess?: (categoria: any) => void;
  onCancel?: () => void;
  // Si se pasa, el formulario delega el submit a esta función (por compatibilidad con la page)
  onSubmit?: (formData: { nombre: string; activo: number; categoriaPrincipalId?: number | null; imagen_url?: string | null }) => Promise<any>;
}

const CategoriasForm: React.FC<Props> = ({ initialData, onSuccess, onCancel, onSubmit }) => {
  const [values, setValues] = useState({
    nombre: initialData?.nombre ?? '',
    activo: initialData?.activo ?? 1,
    categoriaPrincipalId: initialData?.categoriaPrincipalId ?? null,
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [allCategories, setAllCategories] = useState<CategoriaPrincipal[]>([]);
  
  // Estados para la imagen
  const [imagePreview, setImagePreview] = useState<string | null>((initialData as any)?.imagen_url || null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sincronizar cuando initialData cambia
  useEffect(() => {
    setValues({
      nombre: initialData?.nombre ?? '',
      activo: Number(initialData?.activo ?? 1), // Asegurar conversión a número
      categoriaPrincipalId: initialData?.categoriaPrincipalId ?? null,
    });
    setImagePreview((initialData as any)?.imagen_url || null);
  }, [initialData]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cats = await getCategoriasPrincipales(1, 1000, '');
        const list = Array.isArray((cats as any)?.data)
          ? (cats as any).data as CategoriaPrincipal[]
          : (cats as any) as CategoriaPrincipal[];
        if (mounted) setAllCategories(list ?? []);
      } catch (err) {
        // no crítico: dejamos el select con opciones vacías
        console.debug("No se pudieron cargar categorías para el select de padre", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

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
    setApiError(null);
    setLoading(true);

    try {
      let result: any;
      let recordId = initialData?.id;

      // Primero crear o actualizar el registro (sin la imagen si es nueva)
      const payload: any = {
        nombre: values.nombre,
        activo: values.activo,
        categoriaPrincipalId: values.categoriaPrincipalId ?? undefined,
      };

      // Si no hay archivo nuevo pero hay URL existente válida, mantenerla
      if (!selectedImageFile && imagePreview && !imagePreview.startsWith('blob:')) {
        payload.imagen_url = imagePreview;
      }

      if (onSubmit) {
        result = await onSubmit(payload);
        console.log('[CategoriasForm] Resultado de onSubmit:', result);
        
        // Verificar si hubo error
        if (!result) {
          setLoading(false);
          return; // No continuar si hubo error
        }
        
        // Si es creación, obtener el ID del resultado (puede venir como id o imagenUrl)
        if (!recordId) {
          recordId = result?.id || result?.data?.id;
        }
      } else {
        if (initialData?.id) {
          // Edición
          result = await updateCategoria(initialData.id, payload);
        } else {
          // Creación
          result = await createCategoria(payload);
          console.log('[CategoriasForm] Resultado de createCategoria:', result);
          recordId = result?.id || result?.data?.id;
        }
      }

      console.log('[CategoriasForm] ID del registro:', recordId, 'Tiene imagen?', !!selectedImageFile);

      // Ahora, si hay un archivo nuevo y tenemos un ID, subir la imagen
      if (selectedImageFile && recordId) {
        console.log('[CategoriasForm] Subiendo imagen para ID:', recordId);
        setUploadingImage(true);
        try {
          const res = await uploadImagenCategoria(recordId, selectedImageFile);
          console.log('[CategoriasForm] Respuesta de upload:', res);
          // El backend puede devolver imagenUrl (camelCase) o imagen_url (snake_case)
          const url = res?.url || res?.imagen_url || res?.imagenUrl;
          if (url) {
            console.log('[CategoriasForm] Imagen subida exitosamente, URL:', url);
            // Actualizar el registro con la nueva URL de imagen
            await updateCategoria(recordId, { imagen_url: url });
          }
        } catch (error) {
          console.error("Error al subir imagen:", error);
        } finally {
          setUploadingImage(false);
        }
      }

      // Cerrar el modal después de completar todo
      if (onCancel) {
        onCancel();
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
    <div className="relative">
      {(loading || uploadingImage) && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 font-medium">
              {uploadingImage ? "Subiendo imagen..." : "Guardando..."}
            </p>
          </div>
        </div>
      )}
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
          disabled={loading || uploadingImage}
        />

        <div>
          <label htmlFor="activo" className="block text-sm font-medium text-gray-700">
            Activo
          </label>
          <select
            id="activo"
            name="activo"
            value={values.activo}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('activo', Number(e.target.value))}
            disabled={loading || uploadingImage}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value={1}>Sí</option>
            <option value={0}>No</option>
          </select>
        </div>

          <div>
            <label htmlFor="categoriaPrincipalId" className="block text-sm font-medium text-gray-700">
              Categoría principal
            </label>
            <select
              id="categoriaPrincipalId"
              name="categoriaPrincipalId"
              value={values.categoriaPrincipalId ?? ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('categoriaPrincipalId', e.target.value ? Number(e.target.value) : null)}
              disabled={loading || uploadingImage}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">(Ninguna)</option>
              {allCategories
                .filter((c) => c.id !== initialData?.id) // evitar seleccionar la misma categoría como padre
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
            </select>
          </div>

          {/* Campo de Imagen */}
          <div className="grid grid-cols-1 gap-4">
            <label className="block text-sm font-medium text-gray-700">
              Imagen de la Categoría (Opcional)
            </label>

            <div className="flex flex-col gap-2">
              <input
                type="file"
                id="imagenCategoria"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
                disabled={uploadingImage || loading}
              />

              <label
                htmlFor="imagenCategoria"
                className={`px-4 py-2 border rounded-md bg-white w-fit ${
                  uploadingImage || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                }`}
              >
                {uploadingImage ? "Subiendo imagen..." : "Seleccionar Imagen"}
              </label>

              {imagePreview && (
                <div className="mt-2 relative w-32 h-32">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded border"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImageFile(null);
                    }}
                    disabled={loading || uploadingImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            disabled={loading || uploadingImage}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading || uploadingImage}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoriasForm;
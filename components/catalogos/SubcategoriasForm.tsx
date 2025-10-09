import React, { useState, useEffect } from 'react';
// Asegúrate de que estas rutas sean correctas
import Alert from '@/components/ui/Alert'; 
import FormInput from '@/components/common/form/FormInput'; 
// Importamos los servicios de Subcategorías y Categorías
import { createSubcategoria, updateSubcategoria } from '../services/subcategoriasService'; 
import { getCategorias, Categoria } from '../services/categoriasService'; 

// 1. Interfaz de datos que maneja este formulario
interface SubcategoriaFormData {
  nombre: string;
  categoriaId: number; // CLAVE: Nuevo campo para la relación
  estadoId: number;
}

interface Props {
  // initialData puede incluir id cuando es edición
  initialData?: {
    id?: number;
    nombre: string;
    categoriaId: number; // Incluye la categoría para preseleccionar en edición
    estadoId: number;
  };
  onSuccess?: (subcategoria: any) => void;
  onCancel?: () => void;
  // Si se pasa, el formulario delega el submit a esta función (usado en la page)
  onSubmit?: (formData: SubcategoriaFormData) => Promise<any>;
}

const SubcategoriasForm: React.FC<Props> = ({ initialData, onSuccess, onCancel, onSubmit }) => {
  const [values, setValues] = useState<SubcategoriaFormData>({
    nombre: initialData?.nombre ?? '',
    categoriaId: initialData?.categoriaId ?? 0, // Inicia en 0 (o null) para forzar la selección
    estadoId: initialData?.estadoId ?? 1,
  });

  const [categorias, setCategorias] = useState<Categoria[]>([]); // Estado para el dropdown
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true); // Nuevo estado para cargar categorías

  // 🚀 LÓGICA PARA CARGAR CATEGORÍAS
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCats(true);
      try {
        // Pedimos todas las categorías activas (o todas si tu API lo requiere)
        const data = await getCategorias(true); 
        setCategorias(data);

        // Si es modo Creación y no hay selección inicial, preseleccionar la primera si existe
        if (!initialData && data.length > 0 && values.categoriaId === 0) {
          setValues(s => ({ ...s, categoriaId: data[0].id }));
        }
      } catch (error) {
        console.error("Error al cargar categorías para el formulario:", error);
        setApiError("No se pudieron cargar las categorías.");
      } finally {
        setLoadingCats(false);
      }
    };
    loadCategories();
  }, [initialData]);

  const handleChange = (field: keyof SubcategoriaFormData, value: any) => {
    // Aseguramos que los IDs sean números
    const finalValue = (field === 'categoriaId' || field === 'estadoId') ? Number(value) : value;
    setValues((s) => ({ ...s, [field]: finalValue }));
  };

  // Función de extracción de errores reutilizada (es robusta)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null); 

    if (values.categoriaId === 0) {
      setApiError("Debe seleccionar una Categoría Padre.");
      return;
    }
    
    setLoading(true);

    const payload: Omit<SubcategoriaFormData, 'id'> = {
      nombre: values.nombre,
      categoriaId: values.categoriaId,
      estadoId: values.estadoId,
    };

    try {
      let result: any;
      if (onSubmit) {
        // Opción 1: Delegar el submit a la página contenedora
        result = await onSubmit(payload);
      } else {
        // Opción 2: Manejar el submit internamente
        if (initialData?.id) {
          result = await updateSubcategoria(initialData.id, payload);
        } else {
          result = await createSubcategoria(payload);
        }
      }

      onSuccess?.(result);
    } catch (err: any) {
      const message = extractErrorMessage(err);
      setApiError(message);
      // Re-lanzamos si delegamos, para que la page contenedora sepa que falló
      if (onSubmit) throw err; 
    } finally {
      setLoading(false);
    }
  };

  // Si aún no cargamos las categorías, mostramos un indicador
  if (loadingCats) {
      return <div className="p-4 text-center text-gray-500">Cargando datos de categorías...</div>;
  }

  return (
    <div>
      {/* Mostrar alerta de error encima del formulario si existe apiError */}
      {apiError && (
        <div className="mb-4">
          <Alert type="error" message={apiError} onClose={() => setApiError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Campo Nombre */}
        <FormInput
          label="Nombre de Subcategoría"
          name="nombre"
          value={values.nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('nombre', e.target.value)}
          required
        />

        {/* 2. Campo Categoría Padre (Dropdown) */}
        <div>
          <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700">
            Categoría Padre
          </label>
          <select
            id="categoriaId"
            name="categoriaId"
            value={values.categoriaId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('categoriaId', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            required
            disabled={loading}
          >
            <option value={0} disabled>Seleccione una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Campo Estado (Dropdown) */}
        <div>
          <label htmlFor="estadoId" className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="estadoId"
            name="estadoId"
            value={values.estadoId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('estadoId', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            disabled={loading}
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

export default SubcategoriasForm;
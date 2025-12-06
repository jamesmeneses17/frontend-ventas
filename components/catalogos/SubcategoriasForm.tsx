// components/catalogos/SubcategoriasForm.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { 
    Subcategoria, 
    CreateSubcategoriaData, 
    UpdateSubcategoriaData 
} from "../services/subcategoriasService";

// ⚠️ Asegúrate de importar los servicios de lookups:
import { getCategorias, Categoria } from "../services/categoriasService";
import { getEstados, Estado } from "../services/estadosService"; 

// 💡 TIPADO DE DATOS DEL FORMULARIO
type FormData = CreateSubcategoriaData & { id?: number };

interface Props {
  initialData?: Partial<Subcategoria> | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  formError?: string;
}

export default function SubcategoriasForm({ initialData, onSubmit, onCancel, formError }: Props) {
  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      id: initialData?.id || undefined,
      nombre: initialData?.nombre || "",
      // Usamos categoria_id según la Entidad Subcategoria
      categoria_id: initialData?.categoria_id || 0, 
    },
  });

  const formValues = watch();

  // Lookups: Necesitamos Categorías (Nivel 2) para el Select
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  
  // No necesitamos estados en el form de subcategorías, pero si se usa, 
  // habría que cargarlos (los omitiremos por simplicidad)

  useEffect(() => {
    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        // Solo necesitamos cargar Categorías (Nivel 2)
        const catResponse: any = await getCategorias(false, 1, 1000, '');
        // Extraer array de data si viene paginado
        const catList = Array.isArray(catResponse?.data) 
          ? catResponse.data as Categoria[]
          : (catResponse as Categoria[] || []);
        setCategorias(catList);

        const isEditing = Boolean(initialData?.id);

        // Asignamos el ID de categoría por defecto (si es nuevo) o el existente (si es edición)
        const defaultCategoriaId = isEditing
          ? initialData?.categoria_id 
          : catList.length > 0 ? catList[0].id : 0;

        // 🔥 Forzamos el reset con los valores cargados/existentes
        reset({
          id: initialData?.id ?? undefined,
          nombre: initialData?.nombre ?? "",
          categoria_id: defaultCategoriaId, // Usamos el valor por defecto/existente
        });
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        reset({
          id: initialData?.id ?? undefined,
          nombre: initialData?.nombre ?? "",
          categoria_id: 0, 
        });
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, [initialData, reset]);

  const submitForm: SubmitHandler<FormData> = (data) => {
    // La data ya está limpia, la enviamos
    onSubmit(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isIdField = name === "categoria_id"; // El único ID que controlamos

    const parsedValue = type === "number" || isIdField ? Number(value) : value;
    setValue(name as keyof FormData, parsedValue as any, { shouldValidate: true });
  };

  const categoriaOptions = (categorias || []).map((c) => ({
    value: String(c.id),
    label: c.nombre,
  }));

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      {/* Nombre de la Subcategoría */}
      <FormInput
        label="Nombre de la Subcategoría"
        name="nombre"
        value={formValues.nombre}
        onChange={handleChange}
        placeholder="Ej: Laptops Gaming"
        required
      />

      {/* Categoría Padre (Nivel 2) */}
      <FormSelect
        label="Categoría Padre"
        name="categoria_id" // Usamos categoria_id
        value={String(formValues.categoria_id)}
        onChange={handleChange}
        options={categoriaOptions}
        disabled={loadingLookups}
        required
        // Error de validación si no hay opciones cargadas
        error={
            !loadingLookups && categoriaOptions.length === 0 
                ? "Debe crear una Categoría (Nivel 2) primero." 
                : undefined
        }
      />

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || loadingLookups}
          color="secondary"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loadingLookups || categoriaOptions.length === 0}>
          {initialData?.id ? "Guardar Cambios" : "Crear Subcategoría"}
        </Button>
      </div>
      {formError && (
        <div className="text-red-600 text-sm mt-2 text-center">{formError}</div>
      )}
    </form>
  );
}
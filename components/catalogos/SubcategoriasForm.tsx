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
    UpdateSubcategoriaData,
    uploadImagenSubcategoria
} from "../services/subcategoriasService";

// ⚠️ Asegúrate de importar los servicios de lookups:
import { getCategorias, Categoria } from "../services/categoriasService";

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
      activo: (initialData as any)?.activo ?? 1,
    },
  });

  const formValues = watch();

  // Lookups: Necesitamos Categorías (Nivel 2) para el Select
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  
  // Estados para la imagen
  const [imagePreview, setImagePreview] = useState<string | null>((initialData as any)?.imagen_url || null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
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
        // IMPORTANTE: Si estamos editando, SIEMPRE usar el categoria_id actual - convertir a número
        const categoriaIdValue = isEditing 
          ? Number(initialData?.categoria_id) || 0
          : catList.length > 0 ? catList[0].id : 0;

        const defaultCategoriaId = categoriaIdValue;

        console.log("[SubcategoriasForm] loadLookups:", {
          isEditing,
          initialData_categoria_id: initialData?.categoria_id,
          convertedValue: categoriaIdValue,
          defaultCategoriaId,
          catList: catList.map(c => ({ id: c.id, nombre: c.nombre })),
        });

        // 🔥 Forzamos el reset con los valores cargados/existentes
        reset({
          id: initialData?.id ?? undefined,
          nombre: initialData?.nombre ?? "",
          categoria_id: defaultCategoriaId, // Usamos el valor por defecto/existente
          activo: (initialData as any)?.activo ?? 1,
          imagen_url: (initialData as any)?.imagen_url ?? undefined,
        }, {
          keepValues: false, // Aseguramos que el reset aplique todos los valores
        });
        
        // Sincronizar preview de imagen
        setImagePreview((initialData as any)?.imagen_url || null);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        const fallbackCategoriaId = Number(initialData?.categoria_id) || 0;
        reset({
          id: initialData?.id ?? undefined,
          nombre: initialData?.nombre ?? "",
          categoria_id: fallbackCategoriaId,
          activo: (initialData as any)?.activo ?? 1,
          imagen_url: (initialData as any)?.imagen_url ?? undefined,
        }, {
          keepValues: false,
        });
        
        setImagePreview((initialData as any)?.imagen_url || null);
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, [initialData, reset]);

  const submitForm: SubmitHandler<FormData> = async (data) => {
    // Remover el ID antes de enviar (el hook lo maneja por separado)
    const { id, ...submitData } = data;
    
    // Si hay un archivo de imagen nuevo, subirlo primero
    if (selectedImageFile) {
      setUploadingImage(true);
      try {
        if (initialData?.id) {
          const res = await uploadImagenSubcategoria(initialData.id, selectedImageFile);
          const url = res?.url || res?.imagen_url;
          if (url) {
            (submitData as any).imagen_url = url;
            console.log('[SubcategoriasForm] Imagen subida, URL del backend:', url);
          }
        }
      } catch (error) {
        console.error("Error al subir imagen:", error);
      } finally {
        setUploadingImage(false);
      }
    } else if (!selectedImageFile && imagePreview && !imagePreview.startsWith('blob:')) {
      // Si no hay archivo nuevo pero hay una URL válida existente (no blob), mantenerla
      (submitData as any).imagen_url = imagePreview;
    }
    
    onSubmit(submitData as any);
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

  // Debug: Verificar que el valor del select coincide con las opciones
  React.useEffect(() => {
    console.log("[SubcategoriasForm] Debug:", {
      formValues_categoria_id: formValues.categoria_id,
      categoriaOptions,
      initialData_categoria_id: initialData?.categoria_id,
      match: categoriaOptions.some(opt => opt.value === String(formValues.categoria_id)),
    });
  }, [formValues.categoria_id, categoriaOptions, initialData?.categoria_id]);

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

      {/* Activo */}
      <FormSelect
        label="Activo"
        name="activo"
        value={String(formValues.activo ?? 1)}
        onChange={handleChange}
        options={[
          { value: "1", label: "Sí" },
          { value: "0", label: "No" },
        ]}
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

      {/* Campo de Imagen */}
      <div className="grid grid-cols-1 gap-4">
        <label className="block text-sm font-medium text-gray-700">
          Imagen de la Subcategoría (Opcional)
        </label>

        <div className="flex flex-col gap-2">
          <input
            type="file"
            id="imagenSubcategoria"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }}
            disabled={uploadingImage}
          />

          <label
            htmlFor="imagenSubcategoria"
            className="px-4 py-2 border rounded-md bg-white cursor-pointer w-fit hover:bg-gray-50 disabled:opacity-50"
          >
            {uploadingImage ? "Subiendo imagen..." : "Seleccionar Imagen"}
          </label>

          {imagePreview && (
            <div className="mt-2 relative w-32 h-32">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setSelectedImageFile(null);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

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
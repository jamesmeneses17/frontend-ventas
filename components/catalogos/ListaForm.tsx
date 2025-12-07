"use client";

import React, { useEffect, useState } from "react";
import Image from 'next/image';
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button"; 
import { Producto, CreateProductoData, uploadImagen, uploadFichaTecnica } from "../services/productosService";
import { getSubcategorias, Subcategoria } from "../services/subcategoriasService";
import { getEstados, Estado } from "../services/estadosService";
import { getCategorias, Categoria } from "../services/categoriasService";
import { formatCurrency } from "../../utils/formatters"; 

type FormData = Omit<CreateProductoData, "ficha_tecnica_url"> & { 
  id?: number; 
  pdfFichaTecnica?: File;
  imagenProducto?: File;
};

interface Props {
  initialData?: Partial<Producto> | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  formError?: string;
}

export default function ListaForm({ initialData, onSubmit, onCancel, formError }: Props) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      id: initialData?.id || undefined,
      nombre: initialData?.nombre || "",
      codigo: initialData?.codigo || "",
      precio: (initialData as any)?.precio ?? 0,
      stock: (initialData as any)?.stock ?? 0,
      descripcion: initialData?.descripcion || "",
      categoriaId: (initialData as any)?.categoriaId || 0,
      subcategoriaId: (initialData as any)?.subcategoriaId || 0,
      estadoId: initialData?.estadoId || 0,
    },
  });

  const formValues = watch();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");
  
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagen_url || null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Cargar lookups (categorías, subcategorías, estados)
  useEffect(() => {
    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const [subResponse, estResponse, catResponse] = await Promise.all([
          getSubcategorias(1, 1000, ""),
          getEstados(),
          getCategorias(false, 1, 1000, ""),
        ]);

        const subs = Array.isArray(subResponse?.data) ? subResponse.data : Array.isArray(subResponse) ? subResponse : [];
        const cats = Array.isArray(catResponse?.data) ? catResponse.data : Array.isArray(catResponse) ? catResponse : [];
        const ests = estResponse || [];
        
        setSubcategorias(subs);
        setEstados(ests);
        setCategorias(cats);
      } catch (error) {
        console.error("Error al cargar datos de lookup:", error);
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, []);

  // Actualizar valores del formulario cuando initialData o lookups cambien
  useEffect(() => {
    const isEditing = Boolean(initialData?.id);
    
    // Determinar la categoría correcta
    let categoriaIdValue = 0;
    let subcategoriaIdValue = 0;
    
    if (isEditing) {
      subcategoriaIdValue = (initialData as any)?.subcategoriaId ?? 0;
      
      if (subcategoriaIdValue > 0) {
        // Si hay subcategoría, obtener la categoría padre
        const subcat = subcategorias.find((s: any) => s.id === subcategoriaIdValue);
        if (subcat) {
          categoriaIdValue = subcat.categoria_id || subcat.categoria?.id || 0;
        } else if ((initialData as any)?.categoriaId) {
          // Fallback si no encuentra la subcategoría
          categoriaIdValue = (initialData as any).categoriaId;
        }
      } else if ((initialData as any)?.categoriaId) {
        // Si no hay subcategoría pero hay categoriaId
        categoriaIdValue = (initialData as any).categoriaId;
      }
    }

    reset({
      id: initialData?.id ?? undefined,
      nombre: initialData?.nombre ?? "",
      codigo: initialData?.codigo ?? "",
      precio: initialData?.precio ?? 0,
      stock: initialData?.stock ?? 0,
      descripcion: initialData?.descripcion ?? "",
      categoriaId: categoriaIdValue,
      subcategoriaId: subcategoriaIdValue,
      estadoId: isEditing ? initialData?.estadoId ?? 0 : estados.length > 0 ? estados[0].id : 0,
    });

    // Actualizar el estado local
    setCategoriaSeleccionada(String(categoriaIdValue || ""));
  }, [initialData, subcategorias, estados, reset]);

  // 🔥 Cuando el usuario cambia subcategoría → actualizar categoría
  useEffect(() => {
    if (formValues.subcategoriaId && subcategorias.length > 0) {
      const subcatSeleccionada = subcategorias.find(
        (s) => s.id === Number(formValues.subcategoriaId)
      );
      if (subcatSeleccionada) {
        const categoriaId =
          subcatSeleccionada.categoria_id || subcatSeleccionada.categoria?.id;
        if (categoriaId) {
          setValue("categoriaId", categoriaId, { shouldValidate: true });
        }
      }
    } else if (formValues.subcategoriaId === 0) {
      // Solo limpiar si el usuario explícitamente selecciona "sin subcategoría"
      // No limpiar en la carga inicial
    }
  }, [formValues.subcategoriaId, subcategorias, setValue]);

  const submitForm: SubmitHandler<FormData> = (data) => {
    data.precio = Number(String(data.precio).replace(/[^\d]/g, ""));

    const isEditing = Boolean(initialData?.id);
    
    // Si hay subcategoría seleccionada, usar su categoría padre
    // Si no hay subcategoría, usar la categoría seleccionada manualmente
    let resolvedCategoriaId = 0;
    
    if (data.subcategoriaId && Number(data.subcategoriaId) > 0) {
      const subcat = subcategorias.find((s) => s.id === Number(data.subcategoriaId));
      if (subcat) {
        resolvedCategoriaId = subcat.categoria_id || (subcat as any).categoria?.id || 0;
      }
    } else if (categoriaSeleccionada) {
      resolvedCategoriaId = Number(categoriaSeleccionada);
    }

    // Validar que siempre haya una categoría válida
    if (!resolvedCategoriaId || resolvedCategoriaId === 0) {
      console.error('[ListaForm] Error: categoria_id es obligatorio');
      alert('Debes seleccionar una categoría o una subcategoría');
      return;
    }

    const run = async () => {
      const payload: any = {
        ...data,
        categoriaId: resolvedCategoriaId,
        subcategoriaId: data.subcategoriaId || null,
      };
      
      console.log('[ListaForm] Datos del formulario antes de enviar:', data);
      console.log('[ListaForm] subcategoriaId en los datos:', (data as any).subcategoriaId);

      try {
        if (isEditing) {
          const id = Number(initialData!.id);

          // Subir imagen si existe
          const imagenFile = (data as any).imagenProducto as File | undefined;
          if (imagenFile instanceof File) {
            setUploadingImage(true);
            try {
              const res = await uploadImagen(id, imagenFile);
              const url = res?.url || res?.producto?.imagen_url;
              if (url) payload.imagen_url = url;
            } finally {
              setUploadingImage(false);
            }
          }

          // Subir PDF si existe
          const pdfFile = (data as any).pdfFichaTecnica as File | undefined;
          if (pdfFile instanceof File) {
            setUploadingPdf(true);
            try {
              const res = await uploadFichaTecnica(id, pdfFile);
              const url = res?.url || res?.producto?.ficha_tecnica_url;
              if (url) payload.ficha_tecnica_url = url;
            } finally {
              setUploadingPdf(false);
            }
          }

          delete payload.imagenProducto;
          delete payload.pdfFichaTecnica;

          await onSubmit(payload as FormData);
        } else {
          // En creación no subimos archivos aquí: se debe crear primero y luego subir desde edición
          delete (payload as any).imagenProducto;
          delete (payload as any).pdfFichaTecnica;
          await onSubmit(payload as FormData);
        }
      } catch (err) {
        console.error('[ListaForm] Error en submit:', err);
        throw err;
      }
    };

    void run();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isIdField = name === "subcategoriaId" || name === "estadoId" || name === "categoriaId";

    if (name === "precio") {
      const numericValue = value.replace(/[^\d]/g, "");
      const numberValue = Number(numericValue || 0);
      setValue(name as keyof FormData, numberValue as any, { shouldValidate: true });
      return;
    }

    // Si cambia la categoría, limpiar subcategoría
    if (name === "categoriaId" && value !== String(formValues.categoriaId)) {
      setValue("subcategoriaId", 0, { shouldValidate: true });
    }

    const parsedValue = type === "number" || isIdField ? Number(value) : value;
    setValue(name as keyof FormData, parsedValue as any, { shouldValidate: true });
  };

  const categoriaOptions = categorias.map((c) => ({
    value: String(c.id),
    label: c.nombre,
  }));

  const subcategoriaOptions = subcategorias.map((s) => ({
    value: String(s.id),
    label: s.nombre,
  }));

  const estadoOptions = estados.map((e) => ({
    value: String(e.id),
    label: e.nombre,
  }));

  return (
    <form 
      onSubmit={handleSubmit(submitForm)}
      className="
        space-y-6 
        max-w-3xl 
        mx-auto 
        px-4 
        bg-white 
        rounded-xl 
        max-h-[80vh] 
        overflow-y-auto
      "
    >

      {/* Sección: Nombre y Código */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <FormInput
          label="Código"
          name="codigo"
          value={formValues.codigo}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Nombre del Producto"
          name="nombre"
          value={formValues.nombre}
          onChange={handleChange}
          required
        />

       
      </div>

      {/* Sección: Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Categoría"
            name="categoriaId"
            value={String(formValues.categoriaId || "")}
            onChange={handleChange}
            options={[
              { value: "", label: "Seleccionar..." },
              ...categoriaOptions,
            ]}
            disabled={false}
            required={false}
          />        
          <FormSelect
            label="Subcategoría (Opcional)"
            name="subcategoriaId"
            value={String(formValues.subcategoriaId || "")}
            onChange={handleChange}
            options={[{ value: "0", label: "Seleccionar..." }, ...subcategoriaOptions]}
            disabled={loadingLookups}
            required={false}
          />
      </div>

      {/* Sección: Descripción y Estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Descripción"
          name="descripcion"
          value={formValues.descripcion}
          onChange={handleChange}
          placeholder="Descripción del producto"
        />

        
      </div>

      

      {/* Sección: PDF */}
      <div className="grid grid-cols-1 gap-4">
        <label className="block text-sm font-medium text-gray-700">
          PDF Ficha Técnica (Opcional)
        </label>

        <div className="flex flex-col">
          <input
            type="file"
            id="pdfFichaTecnica"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setSelectedPdfName(file ? file.name : null);
              setValue("pdfFichaTecnica", file as any);
            }}
            disabled={uploadingPdf}
          />

          <label
            htmlFor="pdfFichaTecnica"
            className="px-4 py-2 border rounded-md bg-white cursor-pointer w-fit disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingPdf ? "Subiendo PDF..." : "Seleccionar PDF"}
          </label>

          <span className="mt-2 text-sm text-gray-600">
            {uploadingPdf ? "📤 Subiendo PDF..." : selectedPdfName || "Ningún archivo seleccionado"}
          </span>
        </div>
      </div>

      {/* Sección: Imagen */}
      <div className="grid grid-cols-1 gap-4">
        <label className="block text-sm font-medium text-gray-700">
          Imagen del producto (Opcional)
        </label>

        <div className="flex flex-col">
          <input
            type="file"
            id="imagenProducto"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setSelectedImageName(f.name);
                setImagePreview(URL.createObjectURL(f));
                setValue("imagenProducto", f as any);
              }
            }}
            disabled={uploadingImage}
          />

          <label
            htmlFor="imagenProducto"
            className="px-4 py-2 border rounded-md bg-white cursor-pointer w-fit disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImage ? "Subiendo imagen..." : "Seleccionar Imagen"}
          </label>

          <div className="mt-3 flex items-center gap-4">
            {imagePreview && (
              (imagePreview.startsWith?.('blob:') || imagePreview.startsWith?.('data:')) ? (
                <Image
                  src={imagePreview}
                  alt={selectedImageName ? `Vista previa: ${selectedImageName}` : 'Vista previa del producto'}
                  width={80}
                  height={80}
                  className="h-20 w-20 object-cover rounded-md border"
                />
              ) : (
                <Image
                  src={imagePreview}
                  alt={selectedImageName ? `Vista previa: ${selectedImageName}` : 'Vista previa del producto'}
                  width={80}
                  height={80}
                  className="h-20 w-20 object-cover rounded-md border"
                />
              )
            )}
            {selectedImageName && (
              <span className="text-sm">
                {uploadingImage ? "📤 Subiendo..." : selectedImageName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel} disabled={isSubmitting || loadingLookups || uploadingImage || uploadingPdf}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loadingLookups || uploadingImage || uploadingPdf}>
          {uploadingImage || uploadingPdf ? "Subiendo archivos..." : initialData?.id ? "Guardar Cambios" : "Crear Producto"}
        </Button>
      </div>

      {formError && (
        <p className="text-red-600 text-center text-sm">{formError}</p>
      )}
    </form>
  );
}

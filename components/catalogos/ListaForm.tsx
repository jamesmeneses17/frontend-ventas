"use client";

import React, { useEffect, useState } from "react";
import Image from 'next/image';
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button"; 
import { Producto, CreateProductoData, uploadImagen } from "../services/productosService";
import { getCategorias, Categoria } from "../services/categoriasService";
import { getEstados, Estado } from "../services/estadosService";
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
      categoriaId: initialData?.categoriaId || 0,
      estadoId: initialData?.estadoId || 0,
    },
  });

  const formValues = watch();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null); 
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagen_url || null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);

  useEffect(() => {
    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const [catResponse, estResponse] = await Promise.all([
          getCategorias(),
          getEstados(),
        ]);

        setCategorias(catResponse);
        setEstados(estResponse);

        const isEditing = Boolean(initialData?.id);

        const defaultCategoriaId = isEditing
          ? initialData?.categoriaId
          : catResponse.length > 0 ? catResponse[0].id : 0;

        const defaultEstadoId = isEditing
          ? initialData?.estadoId
          : estResponse.length > 0 ? estResponse[0].id : 0;

        reset({
          id: initialData?.id ?? undefined,
          nombre: initialData?.nombre ?? "",
          codigo: initialData?.codigo ?? "",
          precio: initialData?.precio ?? 0,
          stock: initialData?.stock ?? 0,
          descripcion: initialData?.descripcion ?? "",
          categoriaId: defaultCategoriaId,
          estadoId: defaultEstadoId,
        });
      } catch (error) {
        reset({
          id: initialData?.id ?? undefined,
          nombre: initialData?.nombre ?? "",
          codigo: initialData?.codigo ?? "",
          precio: initialData?.precio ?? 0,
          stock: initialData?.stock ?? 0,
          descripcion: initialData?.descripcion ?? "",
          categoriaId: 0,
          estadoId: 0,
        });
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, [initialData, reset]);

  const submitForm: SubmitHandler<FormData> = (data) => {
    data.precio = Number(String(data.precio).replace(/[^\d]/g, ""));

    const isEditing = Boolean(initialData?.id);

    const run = async () => {
      const payload: any = { ...data };

      try {
        if (isEditing) {
          const id = Number(initialData!.id);

          // Subir imagen si existe
          const imagenFile = (data as any).imagenProducto as File | undefined;
          if (imagenFile instanceof File) {
            const res = await uploadImagen(id, imagenFile);
            const url = res?.url || res?.producto?.imagen_url;
            if (url) payload.imagen_url = url;
          }

          // Subir PDF si existe
          const pdfFile = (data as any).pdfFichaTecnica as File | undefined;
          if (pdfFile instanceof File) {
            const res = await uploadImagen(id, pdfFile);
            const url = res?.url || res?.producto?.ficha_tecnica_url;
            if (url) payload.ficha_tecnica_url = url;
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
    const isIdField = name === "categoriaId" || name === "estadoId";

    if (name === "precio") {
      const numericValue = value.replace(/[^\d]/g, "");
      const numberValue = Number(numericValue || 0);
      setValue(name as keyof FormData, numberValue as any, { shouldValidate: true });
      return;
    }

    const parsedValue = type === "number" || isIdField ? Number(value) : value;
    setValue(name as keyof FormData, parsedValue as any, { shouldValidate: true });
  };

  const categoriaOptions = categorias.map((c) => ({
    value: String(c.id),
    label: c.nombre,
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
          label="Nombre del Producto"
          name="nombre"
          value={formValues.nombre}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Código"
          name="codigo"
          value={formValues.codigo}
          onChange={handleChange}
          required
        />
      </div>

      {/* Sección: Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Categoría"
          name="categoriaId"
          value={String(formValues.categoriaId)}
          onChange={handleChange}
          options={categoriaOptions}
          disabled={loadingLookups}
          required
        />

        <FormInput
          label="Descripción"
          name="descripcion"
          value={formValues.descripcion}
          onChange={handleChange}
          placeholder="Descripción del producto"
        />
      </div>

      {/* Sección: Precio y Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Precio"
          name="precio"
          type="text"
          value={formatCurrency(formValues.precio as number)}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Stock"
          name="stock"
          type="number"
          value={formValues.stock}
          onChange={handleChange}
          required
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
          />

          <label
            htmlFor="pdfFichaTecnica"
            className="px-4 py-2 border rounded-md bg-white cursor-pointer w-fit"
          >
            Seleccionar PDF
          </label>

          <span className="mt-2 text-sm text-gray-600">
            {selectedPdfName || "Ningún archivo seleccionado"}
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
          />

          <label
            htmlFor="imagenProducto"
            className="px-4 py-2 border rounded-md bg-white cursor-pointer w-fit"
          >
            Seleccionar Imagen
          </label>

          <div className="mt-3 flex items-center gap-4">
            {imagePreview && (
              (imagePreview.startsWith?.('blob:') || imagePreview.startsWith?.('data:')) ? (
                <img
                  src={imagePreview}
                  className="h-20 w-20 object-cover rounded-md border"
                  alt={selectedImageName ? `Vista previa: ${selectedImageName}` : 'Vista previa del producto'}
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
              <span className="text-sm">{selectedImageName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel} disabled={isSubmitting || loadingLookups}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loadingLookups}>
          {initialData?.id ? "Guardar Cambios" : "Crear Producto"}
        </Button>
      </div>

      {formError && (
        <p className="text-red-600 text-center text-sm">{formError}</p>
      )}
    </form>
  );
}

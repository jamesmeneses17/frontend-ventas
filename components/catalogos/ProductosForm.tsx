"use client";

import React, { useEffect, useState } from "react";
import Image from 'next/image';
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { Producto, CreateProductoData, uploadImagen } from "../services/productosService";
import { isImageUrl } from "../../utils/ProductUtils";
import { getCategorias, Categoria } from "../services/categoriasService";
import { getEstados, Estado } from "../services/estadosService";
import { formatCurrency } from "../../utils/formatters"; // ✅ IMPORTAMOS EL FORMATEADOR

type FormData = CreateProductoData & { id?: number };

interface Props {
  initialData?: Partial<Producto> | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  formError?: string;
}

export default function ProductosForm({ initialData, onSubmit, onCancel, formError }: Props) {
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
      ficha_tecnica_url: initialData?.ficha_tecnica_url || "",
      categoriaId: initialData?.categoriaId || 0,
      estadoId: initialData?.estadoId || 0,
    },
  });

  const formValues = watch();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    (initialData as any)?.imagen_url || null
  );
  const [uploading, setUploading] = useState(false);
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

      // Detectamos si es edición o nuevo
      const isEditing = Boolean(initialData?.id);

      // Si es nuevo, asignamos la primera categoría/estado disponibles
      const defaultCategoriaId = isEditing
        ? initialData?.categoriaId
        : catResponse.length > 0 ? catResponse[0].id : 0;

      const defaultEstadoId = isEditing
        ? initialData?.estadoId
        : estResponse.length > 0 ? estResponse[0].id : 0;

      // 🔥 Forzamos el reset siempre, incluso si initialData no cambia
      reset({
        id: initialData?.id ?? undefined,
        nombre: initialData?.nombre ?? "",
        codigo: initialData?.codigo ?? "",
        precio: initialData?.precio ?? 0,
        stock: initialData?.stock ?? 0,
        descripcion: initialData?.descripcion ?? "",
        ficha_tecnica_url: initialData?.ficha_tecnica_url ?? "",
        categoriaId: defaultCategoriaId,
        estadoId: defaultEstadoId,
      });
    } catch (error) {
      console.error("Error al cargar datos de lookup:", error);
      reset({
        id: initialData?.id ?? undefined,
        nombre: initialData?.nombre ?? "",
        codigo: initialData?.codigo ?? "",
        precio: initialData?.precio ?? 0,
        stock: initialData?.stock ?? 0,
        descripcion: initialData?.descripcion ?? "",
        ficha_tecnica_url: initialData?.ficha_tecnica_url ?? "",
        categoriaId: 0,
        estadoId: 0,
      });
    } finally {
      setLoadingLookups(false);
    }
  };

  loadLookups();
  // 👇 Agregamos dependencias para que siempre cargue bien
}, [initialData, reset]);



  const submitForm: SubmitHandler<FormData> = (data) => {
    // ✅ Aseguramos que el precio se envíe como número limpio (sin comas ni $)
    data.precio = Number(String(data.precio).replace(/[^\d]/g, ""));
    onSubmit(data);
  };

  // Manejo del input file y preview
  useEffect(() => {
    setPreview((initialData as any)?.imagen_url || null);
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUploadImage = async () => {
    if (!file) return alert("Selecciona un archivo antes de subir.");
    if (!initialData?.id) return alert("Guarda el producto primero antes de subir la imagen.");
    try {
      setUploading(true);
      const res = await uploadImagen(Number(initialData.id), file);
      // el backend retorna { url, producto }
      const url = res?.url || res?.producto?.imagen_url;
      if (url) {
        setPreview(url);
        // Emitir evento global para que listas se refresquen (ya lo escucha la página)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent('producto:updated', { detail: { id: initialData.id, url } }));
        }
        alert("Imagen subida correctamente.");
      } else {
        alert("Imagen subida pero no se obtuvo URL de respuesta.");
      }
    } catch (err: any) {
      console.error('Error subiendo imagen:', err);
      alert(err?.response?.data?.message || err?.message || 'Error subiendo la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isIdField = name === "categoriaId" || name === "estadoId";

    // ✅ Si el campo es "precio", limpiamos y formateamos
    if (name === "precio") {
      // Quitamos $ y comas
      const numericValue = value.replace(/[^\d]/g, "");
      const numberValue = Number(numericValue || 0);
      // Actualizamos el valor formateado visualmente
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

  // Ocultar el campo de estado tanto en creación como edición
  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      {/* Fila 1: Nombre y Código */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Nombre del Producto"
          name="nombre"
          value={formValues.nombre}
          onChange={handleChange}
          placeholder="Ej: Teclado Mecánico RGB"
          required
        />
        <FormInput
          label="Código"
          name="codigo"
          value={formValues.codigo}
          onChange={handleChange}
          placeholder="TEC-RGB-001"
          required
        />
      </div>

      {/* Fila 2: Solo categoría, nunca estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Categoría"
          name="categoriaId"
          value={String(formValues.categoriaId)}
          onChange={handleChange}
          options={categoriaOptions}
          disabled={loadingLookups}
          required
        />
      </div>

      {/* Fila 3: Precio y Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Precio"
          name="precio"
          type="text" // 👈 cambia a texto para permitir formato
          value={formatCurrency(Number(formValues.precio || 0))} // 👈 muestra formateado
          onChange={handleChange}
          placeholder="$180,000"
          required
        />
        <FormInput
          label="Stock"
          name="stock"
          type="number"
          value={String(formValues.stock)}
          onChange={handleChange}
          placeholder="45"
          required
        />
      </div>

      {/* Fila 4: Descripción */}
      <FormInput
        label="Descripción"
        name="descripcion"
        type="textarea"
        value={formValues.descripcion}
        onChange={handleChange}
        placeholder="Una descripción breve del producto."
      />

      {/* Fila 5: URL Ficha Técnica */}
      <FormInput
        label="URL Ficha Técnica (Opcional)"
        name="ficha_tecnica_url"
        value={formValues.ficha_tecnica_url || ""}
        onChange={handleChange}
        placeholder="https://ejemplo.com/ficha.pdf"
      />

      {/* Subir imagen (solo en edición) */}
      {initialData?.id && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Imagen del producto (Opcional)</label>
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <Button type="button" onClick={handleUploadImage} disabled={uploading || !file}>
              {uploading ? 'Subiendo...' : 'Subir Imagen'}
            </Button>
          </div>
          {preview && (
            <div className="pt-2">
              {isImageUrl(preview) ? (
                (preview.startsWith?.('blob:') || preview.startsWith?.('data:')) ? (
                  <img src={preview} alt={`Imagen producto ${initialData?.nombre || initialData?.id}`} className="w-32 h-32 object-cover rounded border" />
                ) : (
                  <Image src={preview} alt={`Imagen producto ${initialData?.nombre || initialData?.id}`} width={128} height={128} className="w-32 h-32 object-cover rounded border" />
                )
              ) : (
                <a href={preview} target="_blank" rel="noreferrer" className="text-sm text-gray-700">Archivo adjunto (no es imagen) — Ver</a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || loadingLookups}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loadingLookups}>
          {initialData?.id ? "Guardar Cambios" : "Crear Producto"}
        </Button>
      </div>
      {formError && (
        <div className="text-red-600 text-sm mt-2 text-center">{formError}</div>
      )}
    </form>
  );
}

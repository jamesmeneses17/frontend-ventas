"use client";

import React, { useEffect, useState } from "react";
import Image from 'next/image';
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { Producto, CreateProductoData, uploadImagen } from "../services/productosService";
import { isImageUrl } from "../../utils/ProductUtils";
import { getSubcategorias, Subcategoria } from "../services/subcategoriasService";
import { getEstados, Estado } from "../services/estadosService";
import { getCategorias, Categoria } from "../services/categoriasService";
import { formatCurrency } from "../../utils/formatters";

type FormData = CreateProductoData & { id?: number; categoriaId?: number };

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
      categoriaId: (initialData as any)?.categoriaId || 0,
      subcategoriaId: initialData?.subcategoriaId || 0,
      estadoId: initialData?.estadoId || 0,
    },
  });

  const formValues = watch();

  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // 🔥 Categoría inicia VACÍA
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    (initialData as any)?.imagen_url || null
  );
  const [uploading, setUploading] = useState(false);

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

        const subs = subResponse.data || subResponse || [];
        const cats = (catResponse as any).data || (catResponse as any) || [];
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
      subcategoriaIdValue = initialData?.subcategoriaId || 0;
      
      if (subcategoriaIdValue > 0) {
        // Si hay subcategoría, obtener la categoría padre
        const subcat = subcategorias.find((s: any) => s.id === subcategoriaIdValue);
        if (subcat) {
          categoriaIdValue = subcat.categoria_id || subcat.categoria?.id || 0;
        } else if ((initialData as any)?.categoriaId) {
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
      ficha_tecnica_url: initialData?.ficha_tecnica_url ?? "",
      categoriaId: categoriaIdValue,
      subcategoriaId: subcategoriaIdValue,
      estadoId: isEditing ? initialData?.estadoId : estados.length > 0 ? estados[0].id : 0,
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

  const submitForm: SubmitHandler<FormData> = async (data) => {
    data.precio = Number(String(data.precio).replace(/[^\d]/g, ""));
    
    // Crear el producto primero
    try {
      await onSubmit(data);
      
      // Si es creación (no tiene ID inicial) y se cargó exitosamente,
      // el ID vendrá en los datos retornados por onSubmit
      // Aquí solo hacemos que el formulario permanezca disponible para subir archivos
    } catch (error) {
      console.error("Error en submitForm:", error);
    }
  };

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
    if (!initialData?.id)
      return alert("Guarda el producto primero antes de subir la imagen.");
    try {
      setUploading(true);
      const res = await uploadImagen(Number(initialData.id), file);
      const url = res?.url || res?.producto?.imagen_url;
      if (url) {
        setPreview(url);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("producto:updated", {
              detail: { id: initialData.id, url },
            })
          );
        }
        alert("Imagen subida correctamente.");
      }
    } catch (err: any) {
      console.error("Error subiendo imagen:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Error subiendo la imagen."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

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

    const parsedValue =
      type === "number" || name === "subcategoriaId" || name === "estadoId" || name === "categoriaId"
        ? Number(value)
        : value;

    setValue(name as keyof FormData, parsedValue as any, { shouldValidate: true });
  };

  const subcategoriaOptions = [
    { value: "", label: "Seleccione una subcategoría..." },
    ...subcategorias.map((s) => ({
      value: String(s.id),
      label: s.nombre,
    })),
  ];

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      
      {/* Fila 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Código"
          name="codigo"
          value={formValues.codigo}
          onChange={handleChange}
          placeholder="TEC-RGB-001"
          required
        />
        <FormInput
          label="Nombre del Producto"
          name="nombre"
          value={formValues.nombre}
          onChange={handleChange}
          placeholder="Ej: Teclado Mecánico RGB"
          required
        />
      </div>

      {/* Fila 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Categoría"
          name="categoriaId"
          value={String(formValues.categoriaId || "")}
          onChange={handleChange}
          options={[
            { value: "", label: "Seleccionar..." },
            ...categorias.map((c) => ({
              value: String(c.id),
              label: c.nombre,
            })),
          ]}
          disabled={false}
        />

        <FormSelect
          label="Subcategoría"
          name="subcategoriaId"
          value={String(formValues.subcategoriaId || "")}
          onChange={handleChange}
          options={subcategoriaOptions}
          required={false}
        />
      </div>

      {/* Fila 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Precio de Venta"
          name="precio"
          type="text"
          value={formatCurrency(Number(formValues.precio || 0))}
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

      {/* Descripción */}
      <FormInput
        label="Descripción"
        name="descripcion"
        type="textarea"
        value={formValues.descripcion}
        onChange={handleChange}
        placeholder="Una descripción breve del producto."
      />

      {/* Ficha Técnica */}
      <FormInput
        label="URL Ficha Técnica (Opcional)"
        name="ficha_tecnica_url"
        value={formValues.ficha_tecnica_url || ""}
        onChange={handleChange}
        placeholder="https://ejemplo.com/ficha.pdf"
      />

      {/* Subir Imagen */}
      {initialData?.id && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Imagen del producto (Opcional)
          </label>
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <Button type="button" onClick={handleUploadImage} disabled={uploading || !file}>
              {uploading ? "Subiendo..." : "Subir Imagen"}
            </Button>
          </div>

          {preview && (
            <div className="pt-2">
              <Image
                src={preview}
                alt="Imagen producto"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>
      )}

      {/* Nota informativa para nuevos productos */}
      {!initialData?.id && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-sm text-green-800">
            ✅ El formulario permanece abierto para que puedas subir imagen y ficha técnica después de crear.
          </p>
        </div>
      )}

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
        <div className="text-red-600 text-sm mt-2 text-center">{formError}</div>
      )}
    </form>
  );
}

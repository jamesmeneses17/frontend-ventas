"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import {
  Producto,
  CreateProductoData,
  uploadImagen,
  uploadFichaTecnica,
  deleteImagen,
} from "../services/productosService";
import { getSubcategorias, Subcategoria } from "../services/subcategoriasService";
import { getEstados, Estado } from "../services/estadosService";
import { getCategorias, Categoria } from "../services/categoriasService";

type FormData = Omit<CreateProductoData, "ficha_tecnica_url"> & {
  id?: number;
  pdfFichaTecnica?: File;
  imagenProducto?: File;
  activo?: number;
};

type ImagenGaleria = {
  id?: number;
  url: string;
  orden: number;
  esNueva?: boolean;
  file?: File;
};

interface Props {
  initialData?: Partial<Producto> | null;
  onSubmit: (data: FormData) => Promise<any> | any;
  onSuccess?: () => Promise<void> | void;
  onCancel: () => void;
  formError?: string;
}

export default function ListaForm({
  initialData,
  onSubmit,
  onSuccess,
  onCancel,
  formError,
}: Props) {
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<FormData>({});

  const formValues = watch();

  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);

  const [galeriaImagenes, setGaleriaImagenes] = useState<ImagenGaleria[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /* =========================
     LOAD LOOKUPS
  ========================= */
  useEffect(() => {
    const load = async () => {
      const [subs, cats, ests] = await Promise.all([
        getSubcategorias(),
        getCategorias(),
        getEstados(),
      ]);

      setSubcategorias(subs.data || []);
      setCategorias(cats.data || []);
      setEstados(ests || []);
    };

    load();
  }, []);

  /* =========================
     INITIAL DATA
  ========================= */
  useEffect(() => {
    const isEditing = Boolean(initialData?.id);

    let categoriaId = (initialData as any)?.categoriaId || 0;
    let subcategoriaId = (initialData as any)?.subcategoriaId || 0;

    if (!categoriaId && subcategoriaId && subcategorias.length) {
      const sub = subcategorias.find((s) => s.id === subcategoriaId);
      categoriaId = sub?.categoria_id || 0;
    }

    reset({
      id: initialData?.id,
      nombre: initialData?.nombre || "",
      codigo: initialData?.codigo || "",
      precio: initialData?.precio || 0,
      stock: initialData?.stock || 0,
      descripcion: initialData?.descripcion || "",
      categoriaId,
      subcategoriaId,
      estadoId: isEditing
        ? initialData?.estadoId
        : estados[0]?.id,
      activo: typeof initialData?.activo === 'boolean'
        ? (initialData.activo ? 1 : 0)
        : (typeof initialData?.activo === 'number' ? initialData.activo : 1),
    });

    if (isEditing && initialData?.imagenes?.length) {
      setGaleriaImagenes(
        initialData.imagenes.map((img, idx) => ({
          id: img.id,
          url: img.url_imagen,
          orden: idx,
        }))
      );
    }

    setIsInitialLoad(false);
  }, [initialData, subcategorias, estados, reset]);

  /* =========================
     AUTO CATEGORY BY SUB
  ========================= */
  useEffect(() => {
    const subId = Number(formValues.subcategoriaId);
    if (!subId) return;

    const sub = subcategorias.find((s) => s.id === subId);
    if (sub && sub.categoria_id !== formValues.categoriaId) {
      setValue("categoriaId", sub.categoria_id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.subcategoriaId, formValues.categoriaId, setValue, subcategorias]);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setValue(name, name.includes("Id") ? Number(value) : value);
  };

  const submitForm: SubmitHandler<FormData> = async (data) => {
    setIsBusy(true);

    const payload: any = {
      ...data,
      precio: Number(String(data.precio).replace(/\D/g, "")),
      subcategoriaId: data.subcategoriaId || null,
    };

    try {
      if (initialData?.id) {
        await onSubmit(payload);

        for (const img of galeriaImagenes.filter((i) => i.esNueva && i.file)) {
          await uploadImagen(initialData.id!, img.file!);
        }

        if (data.pdfFichaTecnica) {
          await uploadFichaTecnica(initialData.id!, data.pdfFichaTecnica);
        }
      } else {
        const created = await onSubmit(payload);
        for (const img of galeriaImagenes.filter((i) => i.file)) {
          await uploadImagen(created.id, img.file!);
        }
      }

      onSuccess?.();
    } finally {
      setIsBusy(false);
    }
  };

  /* =========================
     OPTIONS
  ========================= */
  // Agregar opción para eliminar la categoría (Sin categoría)
  const categoriaOptions = [
    { value: "0", label: "Sin categoría" },
    ...categorias.map((c) => ({
      value: String(c.id),
      label: c.nombre,
    })),
  ];

  // Opción para eliminar subcategoría (Sin subcategoría)
  const subcategoriaOptions = [
    { value: "0", label: "Sin subcategoría" },
    ...subcategorias
      .filter((s) =>
        formValues.categoriaId && formValues.categoriaId !== 0
          ? s.categoria_id === formValues.categoriaId
          : true
      )
      .map((s) => ({ value: String(s.id), label: s.nombre })),
  ];

  const estadoOptions = estados.map((e) => ({
    value: String(e.id),
    label: e.nombre,
  }));

  /* =========================
     JSX
  ========================= */
  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="space-y-6 max-w-3xl mx-auto bg-white p-6 rounded-xl"
    >
      {/* Nombre / Código */}
      <div className="grid md:grid-cols-2 gap-6">
        <FormInput label="Código" name="codigo" value={formValues.codigo} onChange={handleChange} required />
        <FormInput label="Nombre" name="nombre" value={formValues.nombre} onChange={handleChange} required />
      </div>

      {/* Categoría / Activo */}
      <div className="grid md:grid-cols-2 gap-6">
        <FormSelect
          label="Categoría"
          name="categoriaId"
          value={String(formValues.categoriaId ?? 0)}
          onChange={handleChange}
          options={categoriaOptions}
        />
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
      </div>

      {/* Subcategoría */}
      <FormSelect
        label="Subcategoría (Opcional)"
        name="subcategoriaId"
        value={String(formValues.subcategoriaId ?? 0)}
        onChange={handleChange}
        options={subcategoriaOptions}
      />

      {/* Descripción */}
      <FormInput
        label="Descripción"
        name="descripcion"
        value={formValues.descripcion}
        onChange={handleChange}
      />

      {/* PDF Ficha Técnica */}
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
            disabled={isBusy}
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

      {/* Galería de Imágenes */}
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Galería de Imágenes
          </label>
          <span className="text-xs text-gray-500">
            Máximo 6 imágenes. Arrastra para reordenar o marca la principal.
          </span>
        </div>
        {/* Botón de Subida */}
        {galeriaImagenes.length < 6 && (
          <div>
            <input
              type="file"
              id="imagenProducto"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const espacioDisponible = 6 - galeriaImagenes.length;
                const archivosASubir = files.slice(0, espacioDisponible);
                const nuevasImagenes: ImagenGaleria[] = archivosASubir.map((file, idx) => ({
                  url: URL.createObjectURL(file),
                  file,
                  orden: galeriaImagenes.length + idx,
                  esNueva: true,
                }));
                setGaleriaImagenes(prev => [...prev, ...nuevasImagenes]);
                e.target.value = '';
              }}
              disabled={isBusy}
            />
            <label
              htmlFor="imagenProducto"
              className="px-4 py-2 border-2 border-dashed border-blue-300 rounded-md bg-blue-50 hover:bg-blue-100 cursor-pointer inline-flex items-center gap-2 text-blue-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">+</span>
              {uploadingImage ? "Subiendo imágenes..." : "Agregar más Imágenes"}
            </label>
          </div>
        )}
        {/* Área de Visualización - La Galería */}
        {galeriaImagenes.length > 0 && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {galeriaImagenes
                .sort((a, b) => a.orden - b.orden)
                .map((imagen, index) => (
                  <div
                    key={`${imagen.id || 'new'}-${index}`}
                    draggable={!isBusy}
                    onDragStart={() => setDraggedIndex(index)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedIndex !== null && draggedIndex !== index) {
                        const newGaleria = [...galeriaImagenes];
                        const [draggedItem] = newGaleria.splice(draggedIndex, 1);
                        newGaleria.splice(index, 0, draggedItem);
                        newGaleria.forEach((img, idx) => { img.orden = idx; });
                        setGaleriaImagenes(newGaleria);
                        setDraggedIndex(index);
                      }
                    }}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`relative border-2 rounded-lg overflow-hidden group transition-all ${
                      draggedIndex === index ? 'opacity-50 scale-95' : 'hover:border-blue-400'
                    } ${index === 0 ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'}`}
                  >
                    {/* Badge de Principal */}
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10 font-semibold">
                        Principal
                      </div>
                    )}
                    {/* Imagen */}
                    <div className="aspect-square relative">
                      <Image
                        src={imagen.url}
                        alt={`Imagen ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    {/* Controles */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      {/* Botón Eliminar */}
                      <button
                        type="button"
                        onClick={async () => {
                          if (imagen.id && initialData?.id) {
                            if (confirm('¿Estás seguro de eliminar esta imagen?')) {
                              try {
                                setUploadingImage(true);
                                await deleteImagen(initialData.id, imagen.id);
                                setGaleriaImagenes(prev => {
                                  const nuevaGaleria = prev.filter((_, i) => i !== index);
                                  nuevaGaleria.forEach((img, idx) => { img.orden = idx; });
                                  return nuevaGaleria;
                                });
                              } catch (error) {
                                alert('Error al eliminar la imagen');
                              } finally {
                                setUploadingImage(false);
                              }
                            }
                          } else {
                            setGaleriaImagenes(prev => {
                              const nuevaGaleria = prev.filter((_, i) => i !== index);
                              nuevaGaleria.forEach((img, idx) => { img.orden = idx; });
                              return nuevaGaleria;
                            });
                          }
                        }}
                        disabled={isBusy}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
                        title="Eliminar imagen"
                      >
                        🗑️
                      </button>
                      {/* Botones de Ordenamiento */}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newGaleria = [...galeriaImagenes];
                            [newGaleria[index], newGaleria[index - 1]] = [newGaleria[index - 1], newGaleria[index]];
                            newGaleria.forEach((img, idx) => { img.orden = idx; });
                            setGaleriaImagenes(newGaleria);
                          }}
                          disabled={isBusy}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50"
                          title="Mover hacia arriba"
                        >
                          ⬆️
                        </button>
                      )}
                      {index < galeriaImagenes.length - 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newGaleria = [...galeriaImagenes];
                            [newGaleria[index], newGaleria[index + 1]] = [newGaleria[index + 1], newGaleria[index]];
                            newGaleria.forEach((img, idx) => { img.orden = idx; });
                            setGaleriaImagenes(newGaleria);
                          }}
                          disabled={isBusy}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50"
                          title="Mover hacia abajo"
                        >
                          ⬇️
                        </button>
                      )}
                    </div>
                    {/* Número de orden */}
                    <div className="absolute bottom-1 right-1 bg-white/90 text-xs px-2 py-1 rounded-full font-semibold">
                      {index + 1}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {galeriaImagenes.length === 0 && (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm">No hay imágenes. Haz clic en &quot;+ Agregar más Imágenes&quot; para comenzar.</p>
          </div>
        )}
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-3">
        <Button type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isBusy}>
          {initialData?.id ? "Guardar Cambios" : "Crear Producto"}
        </Button>
      </div>

      {formError && <p className="text-red-600 text-sm text-center">{formError}</p>}
    </form>
  );
}

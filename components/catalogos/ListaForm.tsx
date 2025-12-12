"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from 'next/image';
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button"; 
import { Producto, CreateProductoData, uploadImagen, uploadFichaTecnica, deleteImagen } from "../services/productosService";
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
  onSubmit: (data: FormData) => Promise<any> | any;
  onSuccess?: () => Promise<void> | void;
  onCancel: () => void;
  formError?: string;
}

export default function ListaForm({ initialData, onSubmit, onSuccess, onCancel, formError }: Props) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({});

  // Estados para lookups y otros
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [galeriaImagenes, setGaleriaImagenes] = useState<any[]>([]); // Ajusta el tipo según tu modelo
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [subcategoriaChanged, setSubcategoriaChanged] = useState(false);

  // Para acceder a los valores actuales del formulario
  const formValues = watch();

  // Cargar datos de lookups al montar
  useEffect(() => {
    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const [subsResp, ests, catsResp] = await Promise.all([
          getSubcategorias(),
          getEstados(),
          getCategorias(),
        ]);
        setSubcategorias(subsResp.data || []);
        setEstados(ests);
        setCategorias(catsResp.data || []);
      } catch (error) {
        console.error("Error al cargar datos de lookup:", error);
      } finally {
        setLoadingLookups(false);
      }
    };
    loadLookups();
  }, []);
// Tipo para galería de imágenes
type ImagenGaleria = {
  id?: number;
  url: string;
  orden: number;
  esNueva?: boolean;
  file?: File;
};

// Estado para nombre del PDF seleccionado
const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);

// Estado para drag & drop de imágenes
const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Actualizar valores del formulario cuando initialData o lookups cambien
  useEffect(() => {
    const isEditing = Boolean(initialData?.id);
    
    // Determinar la categoría correcta
    let categoriaIdValue = 0;
    let subcategoriaIdValue = 0;
    
    if (isEditing) {
      // Obtener valores del producto directamente
      categoriaIdValue = (initialData as any)?.categoriaId || 0;
      subcategoriaIdValue = (initialData as any)?.subcategoriaId || 0;
      
      // ✅ SOLO si NO hay categoriaId directa Y hay subcategoría, obtener categoría de la subcategoría
      if (!categoriaIdValue && subcategoriaIdValue > 0 && subcategorias.length > 0) {
        const subcat = subcategorias.find((s: any) => s.id === subcategoriaIdValue);
        if (subcat) {
          categoriaIdValue = subcat.categoria_id || subcat.categoria?.id || 0;
        }
      }
      
      console.log('[ListaForm] 🔍 Cargando producto para editar:', {
        productoId: initialData?.id,
        categoriaIdDelProducto: (initialData as any)?.categoriaId,
        subcategoriaIdDelProducto: (initialData as any)?.subcategoriaId,
        categoriaIdFinal: categoriaIdValue,
        subcategoriaIdFinal: subcategoriaIdValue
      });
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

    // Marcar que ya no es carga inicial
    setIsInitialLoad(false);
    
    // ✅ Inicializar galería de imágenes si estamos editando
    if (isEditing && initialData?.imagenes && initialData.imagenes.length > 0) {
      const imagenesExistentes: ImagenGaleria[] = initialData.imagenes.map((img, idx) => ({
        id: img.id,
        url: img.url_imagen,
        orden: img.orden || idx,
        esNueva: false,
      }));
      setGaleriaImagenes(imagenesExistentes);
    } else {
      setGaleriaImagenes([]);
    }
  }, [initialData, subcategorias, estados, reset]);

  // 🔥 Cuando el usuario cambia subcategoría → actualizar categoría automáticamente
  useEffect(() => {
    const currentSubcategoryId = Number(formValues.subcategoriaId) || 0;
    
    // Si hay una subcategoría seleccionada
    if (currentSubcategoryId > 0 && subcategorias.length > 0) {
      const subcatSeleccionada = subcategorias.find(
        (s) => s.id === currentSubcategoryId
      );
      if (subcatSeleccionada) {
        const categoriaId =
          subcatSeleccionada.categoria_id || subcatSeleccionada.categoria?.id;
        if (categoriaId && Number(formValues.categoriaId) !== categoriaId) {
          // Solo actualizar si la categoría actual es diferente
          setValue("categoriaId", categoriaId, { shouldValidate: true });
        }
      }
    }
  }, [formValues.subcategoriaId, subcategorias, setValue, formValues.categoriaId]);

  const submitForm: SubmitHandler<FormData> = (data) => {
    console.log('==========================================');
    console.log('[ListaForm] ===== INICIO DE SUBMIT =====');
    console.log('[ListaForm] Datos del formulario (data):', data);
    console.log('[ListaForm] initialData:', initialData);
    console.log('==========================================');

    data.precio = Number(String(data.precio).replace(/[^\d]/g, ""));

    const isEditing = Boolean(initialData?.id);
    
    // Validar que siempre haya una categoría válida (requerida) SOLO si no es null explícito
    // Si categoriaId es null, significa que se está eliminando intencionalmente
    if (data.categoriaId !== null && (!data.categoriaId || Number(data.categoriaId) === 0)) {
      console.error('[ListaForm] Error: categoria_id es obligatorio');
      alert('Debes seleccionar una categoría');
      return;
    }

    const run = async () => {
      const isEditing = Boolean(initialData?.id);
      
      // Construir payload según las reglas
      const payload: any = {
        id: data.id,
        nombre: data.nombre,
        codigo: data.codigo,
        precio: data.precio,
        stock: data.stock,
        descripcion: data.descripcion,
        categoriaId: Number(data.categoriaId),
        estadoId: (data as any).estadoId,
      };

      console.log('[ListaForm] Payload BASE (antes de subcategoría):', payload);

      // Manejo de subcategoriaId: SIEMPRE incluir el campo
      const originalSubcategoryId = (initialData as any)?.subcategoriaId || 0;
      const newSubcategoryId = data.subcategoriaId && Number(data.subcategoriaId) > 0 
        ? Number(data.subcategoriaId) 
        : 0;

      console.log('[ListaForm] originalSubcategoryId:', originalSubcategoryId);
      console.log('[ListaForm] newSubcategoryId:', newSubcategoryId);
      console.log('[ListaForm] data.subcategoriaId (raw):', data.subcategoriaId);

      // SIEMPRE incluir subcategoriaId (null si es 0, o el valor numérico)
      payload.subcategoriaId = newSubcategoryId > 0 ? newSubcategoryId : null;

      console.log('==========================================');
      console.log('[ListaForm] ✅ PAYLOAD FINAL A ENVIAR:', JSON.stringify(payload, null, 2));
      console.log('[ListaForm] subcategoriaId final:', payload.subcategoriaId);
      console.log('==========================================');

      try {
        if (isEditing) {
          const id = Number(initialData!.id);

          // ✅ Subir múltiples imágenes si existen nuevas
          const imagenesNuevas = galeriaImagenes.filter(img => img.esNueva && img.file);
          if (imagenesNuevas.length > 0) {
            setUploadingImage(true);
            try {
              // Subir cada imagen nueva secuencialmente
              for (const imagen of imagenesNuevas) {
                if (imagen.file) {
                  await uploadImagen(id, imagen.file);
                }
              }
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
          if (onSuccess) await onSuccess();
        } else {
          // ✅ En creación, primero crear el producto
          delete (payload as any).imagenProducto;
          delete (payload as any).pdfFichaTecnica;
          
          const productoCreado = await onSubmit(payload as FormData);
          
          // ✅ Luego subir las imágenes nuevas si existen
          const imagenesNuevas = galeriaImagenes.filter(img => img.esNueva && img.file);
          if (imagenesNuevas.length > 0 && productoCreado?.id) {
            setUploadingImage(true);
            try {
              for (const imagen of imagenesNuevas) {
                if (imagen.file) {
                  await uploadImagen(productoCreado.id, imagen.file);
                }
              }
            } finally {
              setUploadingImage(false);
            }
          }
          
          if (onSuccess) await onSuccess();
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

    // Si cambia subcategoría, marcar que fue cambio explícito
    if (name === "subcategoriaId" && !isInitialLoad) {
      setSubcategoriaChanged(true);
    }

    // Si cambia la categoría manualmente, limpiar subcategoría
    // PERO solo si la subcategoría actual no pertenece a la nueva categoría
    if (name === "categoriaId" && !isInitialLoad) {
      const nuevaCategoriaId = Number(value);
      const subcategoriaActualId = Number(formValues.subcategoriaId) || 0;
      
      // Si hay una subcategoría seleccionada, verificar si pertenece a la nueva categoría
      if (subcategoriaActualId > 0 && subcategorias.length > 0) {
        const subcatActual = subcategorias.find((s: any) => s.id === subcategoriaActualId);
        const categoriaDeSubcat = subcatActual?.categoria_id || subcatActual?.categoria?.id;
        
        // Solo limpiar si la subcategoría NO pertenece a la nueva categoría
        if (categoriaDeSubcat !== nuevaCategoriaId) {
          setValue("subcategoriaId", 0, { shouldValidate: true });
          setSubcategoriaChanged(false);
        }
      } else {
        // Si no hay subcategoría, simplemente resetear
        setValue("subcategoriaId", 0, { shouldValidate: true });
        setSubcategoriaChanged(false);
      }
    }

    const parsedValue = type === "number" || isIdField ? Number(value) : value;
    setValue(name as keyof FormData, parsedValue as any, { shouldValidate: true });
  };

  const categoriaOptions = categorias.map((c) => ({
    value: String(c.id),
    label: c.nombre,
  }));

  // Filtrar subcategorías por la categoría seleccionada
  // Si hay categoría seleccionada, filtrar las subcategorías que pertenecen a esa categoría
  const selectedCategoryId = Number(formValues.categoriaId) || 0;
  const selectedSubcategoryId = Number(formValues.subcategoriaId) || 0;
  
  let subcategoriasFiltradas = selectedCategoryId > 0
    ? subcategorias.filter((s: any) => Number(s.categoria_id) === selectedCategoryId)
    : subcategorias;

  // ✅ IMPORTANTE: Si hay una subcategoría seleccionada que NO está en el filtro, agregarla
  if (selectedSubcategoryId > 0) {
    const subcatSeleccionada = subcategorias.find((s: any) => s.id === selectedSubcategoryId);
    const estaEnFiltradas = subcategoriasFiltradas.some((s: any) => s.id === selectedSubcategoryId);
    
    if (subcatSeleccionada && !estaEnFiltradas) {
      subcategoriasFiltradas = [subcatSeleccionada, ...subcategoriasFiltradas];
    }
  }

  console.log('[ListaForm] 🔍 Filtrado de subcategorías:', {
    categoriaSeleccionada: selectedCategoryId,
    subcategoriaSeleccionada: selectedSubcategoryId,
    totalSubcategorias: subcategorias.length,
    subcategoriasFiltradas: subcategoriasFiltradas.length,
    ejemploSubcategoria: subcategorias[0],
  });

  const subcategoriaOptions = [
    { value: "0", label: "Sin subcategoría" },
    ...subcategoriasFiltradas.map((s) => ({
      value: String(s.id),
      label: s.nombre,
    })),
  ];

  const estadoOptions = estados.map((e) => ({
    value: String(e.id),
    label: e.nombre,
  }));

  return (
    <div className="relative">
      {(isBusy) && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 font-medium">
              {uploadingImage ? "Subiendo imagen..." : uploadingPdf ? "Subiendo PDF..." : "Guardando..."}
            </p>
          </div>
        </div>
      )}

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
          disabled={isBusy}
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
          <div className="flex flex-col gap-2">
            <FormSelect
              label="Categoría"
              name="categoriaId"
              value={String(formValues.categoriaId || "")}
              onChange={handleChange}
              options={[
                { value: "", label: "Seleccionar..." },
                ...categoriaOptions,
              ]}
              disabled={isBusy}
              required={false}
            />
            {Number(formValues.categoriaId) > 0 && initialData?.id && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('¿Eliminar categoría y subcategoría de este producto?')) {
                    try {
                      // Construir payload directamente
                      const payload: any = {
                        id: initialData.id,
                        nombre: formValues.nombre,
                        codigo: formValues.codigo,
                        precio: Number(String(formValues.precio).replace(/[^\d]/g, "")),
                        stock: formValues.stock,
                        descripcion: formValues.descripcion,
                        categoriaId: null,  // ✅ Eliminar categoría
                        subcategoriaId: null,  // ✅ Eliminar subcategoría
                        estadoId: formValues.estadoId,
                      };
                      
                      console.log('[ELIMINAR] Enviando payload:', payload);
                      
                      // Llamar a onSubmit directamente
                      await onSubmit(payload as any);
                      
                      // Actualizar valores en el formulario después de guardar
                      setValue("categoriaId", 0, { shouldValidate: false });
                      setValue("subcategoriaId", 0, { shouldValidate: false });
                      
                      alert('Categoría y subcategoría eliminadas correctamente');
                    } catch (error) {
                      console.error('[ELIMINAR] Error:', error);
                      alert('Error al eliminar. Ver consola.');
                    }
                  }
                }}
                className="text-sm text-red-600 hover:text-red-800 underline self-start hover:font-semibold"
              >
                🗑️ Eliminar categoría y subcategoría
              </button>
            )}
          </div>
          
          <FormSelect
            label="Subcategoría (Opcional)"
            name="subcategoriaId"
            value={String(formValues.subcategoriaId ?? 0)}
            onChange={handleChange}
            options={subcategoriaOptions}
            disabled={isBusy}
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
            disabled={isBusy}
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
                e.target.value = ''; // Reset input
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
                        
                        // Reordenar índices
                        newGaleria.forEach((img, idx) => {
                          img.orden = idx;
                        });
                        
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
                          // Si la imagen existe en BD, eliminarla del backend
                          if (imagen.id && initialData?.id) {
                            if (confirm('¿Estás seguro de eliminar esta imagen?')) {
                              try {
                                setUploadingImage(true);
                                await deleteImagen(initialData.id, imagen.id);
                                // Actualizar estado local
                                setGaleriaImagenes(prev => {
                                  const nuevaGaleria = prev.filter((_, i) => i !== index);
                                  nuevaGaleria.forEach((img, idx) => {
                                    img.orden = idx;
                                  });
                                  return nuevaGaleria;
                                });
                              } catch (error) {
                                console.error('Error al eliminar imagen:', error);
                                alert('Error al eliminar la imagen');
                              } finally {
                                setUploadingImage(false);
                              }
                            }
                          } else {
                            // Si es nueva, solo eliminarla del estado
                            setGaleriaImagenes(prev => {
                              const nuevaGaleria = prev.filter((_, i) => i !== index);
                              nuevaGaleria.forEach((img, idx) => {
                                img.orden = idx;
                              });
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
                            newGaleria.forEach((img, idx) => {
                              img.orden = idx;
                            });
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
                            newGaleria.forEach((img, idx) => {
                              img.orden = idx;
                            });
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
            <p className="text-sm">No hay imágenes. Haz clic en "+ Agregar más Imágenes" para comenzar.</p>
          </div>
        )}
      </div>

      {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" onClick={onCancel} disabled={isBusy}>
          Cancelar
        </Button>
          <Button type="submit" disabled={isBusy}>
          {uploadingImage || uploadingPdf ? "Subiendo archivos..." : initialData?.id ? "Guardar Cambios" : "Crear Producto"}
        </Button>
      </div>

      {formError && (
        <p className="text-red-600 text-center text-sm">{formError}</p>
      )}
    </form>
    </div>
  );
}

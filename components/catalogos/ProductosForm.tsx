"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from 'next/image';
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { Producto, CreateProductoData, UpdateProductoData, uploadImagen, getProductos } from "../services/productosService";
import { isImageUrl } from "../../utils/ProductUtils";
import { getSubcategorias, Subcategoria } from "../services/subcategoriasService";
import { getEstados, Estado } from "../services/estadosService";
import { getCategorias, Categoria } from "../services/categoriasService";
import { formatCurrency } from "../../utils/formatters";

// Redefinimos precios como string|number para permitir el formateo en inputs
type FormData = Omit<CreateProductoData, "precio" | "precio_venta"> & {
  precio?: number | string;
  precio_venta?: number | string;
  id?: number;
  categoriaId?: number;
};

// Formatea un valor numérico a string con separador de miles y sin decimales
const formatThousands = (val: any): string => {
  if (val === undefined || val === null || val === "") return "";
  const num = Number(val);
  if (!Number.isFinite(num)) return "";
  const intPart = Math.trunc(num).toString();
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

interface Props {
  initialData?: Partial<Producto> | null;
  onSubmit: (data: CreateProductoData | UpdateProductoData) => void | Promise<void>;
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
      precio: formatThousands((initialData as any)?.precio),
      precio_venta: formatThousands((initialData as any)?.precio_venta ?? (initialData as any)?.precio),
      stock: (initialData as any)?.stock ?? 0,
      descripcion: initialData?.descripcion || "",
      ficha_tecnica_url: initialData?.ficha_tecnica_url || "",
      categoriaId: (initialData as any)?.categoriaId || 0,
      subcategoriaId: initialData?.subcategoriaId || 0,
      estadoId: initialData?.estadoId || 0,
    },
  });

  const formValues = watch();
  const nameManuallyChanged = useRef(false);

  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [subcategoriaChanged, setSubcategoriaChanged] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    (initialData as any)?.imagen_url || null
  );
  const [uploading, setUploading] = useState(false);
  const lastCodeLookup = useRef<string>("");
  const [nameLocked, setNameLocked] = useState(false);
  const [codeExists, setCodeExists] = useState(false);

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

    // En creación: solo asignar estado por defecto la primera vez, sin resetear el resto del formulario
    if (!isEditing) {
      if (isInitialLoad && estados.length > 0) {
        setValue("estadoId", estados[0].id, { shouldValidate: true });
      }
      setIsInitialLoad(false);
      return;
    }

    // Determinar la categoría correcta para edición
    let categoriaIdValue = (initialData as any)?.categoriaId || 0;
    let subcategoriaIdValue = initialData?.subcategoriaId || 0;
    
    if (!categoriaIdValue && subcategoriaIdValue > 0) {
      const subcat = subcategorias.find((s: any) => s.id === subcategoriaIdValue);
      if (subcat) {
        categoriaIdValue = subcat.categoria_id || subcat.categoria?.id || 0;
      }
    }

    reset({
      id: initialData?.id ?? undefined,
      nombre: initialData?.nombre ?? "",
      codigo: initialData?.codigo ?? "",
      precio_venta: formatThousands((initialData as any)?.precio_venta ?? initialData?.precio),
      stock: initialData?.stock ?? 0,
      descripcion: initialData?.descripcion ?? "",
      ficha_tecnica_url: initialData?.ficha_tecnica_url ?? "",
      categoriaId: categoriaIdValue,
      subcategoriaId: subcategoriaIdValue,
      estadoId: isEditing ? initialData?.estadoId : estados.length > 0 ? estados[0].id : 0,
    });

    setIsInitialLoad(false);
  }, [initialData, subcategorias, estados, reset, setValue, isInitialLoad]);

  // 🔥 Cuando el usuario cambia subcategoría → actualizar categoría
  // SOLO si cambió desde el valor inicial
  useEffect(() => {
    const initialSubcategoryId = (initialData as any)?.subcategoriaId || 0;
    const currentSubcategoryId = Number(formValues.subcategoriaId) || 0;
    
    // Si la subcategoría cambió desde su valor inicial y hay una nueva seleccionada
    if (currentSubcategoryId !== initialSubcategoryId && currentSubcategoryId > 0 && subcategorias.length > 0) {
      const subcatSeleccionada = subcategorias.find(
        (s) => s.id === currentSubcategoryId
      );
      if (subcatSeleccionada) {
        const categoriaId =
          subcatSeleccionada.categoria_id || subcatSeleccionada.categoria?.id;
        if (categoriaId) {
          setValue("categoriaId", categoriaId, { shouldValidate: true });
        }
      }
    }
  }, [formValues.subcategoriaId, subcategorias, setValue, initialData]);

  const submitForm: SubmitHandler<FormData> = async (data) => {
    const parsePrecio = (val: any): number | undefined => {
      if (val === undefined || val === null || val === "") return undefined;
      const str = String(val).replace(/,/g, "");
      const num = parseFloat(str);
      return Number.isFinite(num) ? num : undefined;
    };

    // Convertir los campos a number si es necesario
    const precio = parsePrecio(data.precio);
    const precio_venta = parsePrecio(data.precio_venta);

    const isEditing = Boolean(initialData?.id);

    // Construir payload según las reglas
    const submittedData: any = {
      ...data,
      precio,
      precio_venta,
    };

    // Limpiar campos vacíos de precios para no sobrescribir con undefined
    if (submittedData.precio === undefined) delete submittedData.precio;
    if (submittedData.precio_venta === undefined) delete submittedData.precio_venta;

    // Detectar si la subcategoría cambió desde su valor original
    const originalSubcategoryId = (initialData as any)?.subcategoriaId || 0;
    const newSubcategoryId = data.subcategoriaId && Number(data.subcategoriaId) > 0 
      ? Number(data.subcategoriaId) 
      : 0;
    const hasSubcategoryChanged = originalSubcategoryId !== newSubcategoryId;

    // REGLA: Solo incluir subcategoriaId si:
    // 1. En CREACIÓN: enviar el valor (o null si no hay)
    // 2. En EDICIÓN:
    //    - Si la subcategoría es 0 (vacía): SIEMPRE enviar null (el usuario la limpió o cambió categoría)
    //    - Si cambió a un valor diferente: enviar el nuevo valor
    //    - Si NO cambió: NO incluir el campo (mantendrá el actual)
    if (!isEditing) {
      // En creación, enviar null si no hay subcategoría
      submittedData.subcategoriaId = newSubcategoryId > 0 ? newSubcategoryId : null;
    } else if (newSubcategoryId === 0 && originalSubcategoryId > 0) {
      // En edición: si la subcategoría ahora es 0 pero antes tenía valor, enviar null (desvincular)
      submittedData.subcategoriaId = null;
    } else if (hasSubcategoryChanged) {
      // En edición: si cambió a un nuevo valor, enviar ese valor
      submittedData.subcategoriaId = newSubcategoryId > 0 ? newSubcategoryId : null;
    } else {
      // En edición y realmente NO cambió, no incluir el campo
      delete submittedData.subcategoriaId;
    }

    // Crear el producto primero
    try {
      await onSubmit(submittedData as CreateProductoData | UpdateProductoData);
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

    if (name === "precio" || name === "precio_venta") {
      // Formatear en vivo con separador de miles (coma) y permitir punto decimal
      const raw = value.replace(/[^0-9.]/g, "");
      const [intPart, decPart] = raw.split(".");
      const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      const formatted = decPart !== undefined ? `${intFormatted}.${decPart}` : intFormatted;
      setValue(name as keyof FormData, formatted as any, { shouldValidate: true });
      return;
    }

    if (name === "nombre") {
      nameManuallyChanged.current = true;
    }

    if (name === "codigo" && !initialData?.id) {
      // 🔥 RESETEAR el flag cuando el usuario cambia el código para permitir nueva búsqueda
      nameManuallyChanged.current = false;
      setNameLocked(false);
    }

    // Si cambia subcategoría, marcar que fue cambio explícito
    if (name === "subcategoriaId" && !isInitialLoad) {
      setSubcategoriaChanged(true);
    }

    // Si cambia la categoría manualmente, limpiar subcategoría
    if (name === "categoriaId" && !isInitialLoad) {
      setValue("subcategoriaId", 0, { shouldValidate: true });
      setSubcategoriaChanged(false);
    }

    const parsedValue =
      type === "number" || name === "subcategoriaId" || name === "estadoId" || name === "categoriaId"
        ? Number(value)
        : value;

    setValue(name as keyof FormData, parsedValue as any, { shouldValidate: true });
  };

  // Buscar producto existente por código para autocompletar el nombre en creación
  useEffect(() => {
    if (initialData?.id) return; // no autofill en edición

    const code = (formValues.codigo || "").trim();
    const shouldAutofillName = !nameManuallyChanged.current; // permitir actualizar mientras no haya edición manual
    if (!code) {
      lastCodeLookup.current = "";
      setNameLocked(false);
      return;
    }
    if (!shouldAutofillName) return;

    const timer = setTimeout(async () => {
      try {
        const res = await getProductos(1, 10, "", code);
        const normalized = code.toLowerCase();
        const match =
          res?.data?.find((p) => p.codigo?.toLowerCase() === normalized) ||
          res?.data?.find((p) => p.codigo?.toLowerCase().startsWith(normalized)) ||
          res?.data?.[0];

        if (match && !nameManuallyChanged.current) {
          // Verificar si es una coincidencia exacta (producto ya existe)
          const exactMatch = match.codigo?.toLowerCase() === normalized;
          
          if (exactMatch) {
            setCodeExists(true);
            setValue("nombre", match.nombre, { shouldValidate: true });
            setNameLocked(true);
          } else {
            // Solo autocompleta si no es coincidencia exacta
            setCodeExists(false);
            setValue("nombre", match.nombre, { shouldValidate: true });
            setNameLocked(true);
          }
        } else {
          setCodeExists(false);
          setNameLocked(false);
        }
      } catch (err) {
        console.error("Auto-completar nombre por código falló", err);
        setCodeExists(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [formValues.codigo, formValues.nombre, initialData?.id, setValue]);

  // Filtrar subcategorías por la categoría seleccionada
  // Si no hay categoría seleccionada O estamos editando (para poder cambiar de subcategoría), mostrar TODAS
  const selectedCategoryId = Number(formValues.categoriaId) || 0;
  const isEditing = Boolean(initialData?.id);
  const subcategoriasFiltradas = (selectedCategoryId > 0 && !isEditing)
    ? subcategorias.filter((s: any) => Number(s.categoria_id) === selectedCategoryId)
    : subcategorias;

  const subcategoriaOptions = [
    { value: "0", label: "Sin subcategoría" },
    ...subcategoriasFiltradas.map((s) => ({
      value: String(s.id),
      label: s.nombre,
    })),
  ];

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      
      {/* Alerta si el código ya existe */}
      {!initialData?.id && codeExists && formValues.codigo && (
        <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
          <p className="text-sm text-yellow-800 font-semibold">
            Ya existe un producto con el código &quot;{formValues.codigo}&quot; en la base de datos. No es necesario agregarlo nuevamente.
          </p>
        </div>
      )}
      
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
          readOnly={nameLocked && !initialData?.id}
          required
        />
      </div>

      {/* Fila 2 */}
     

      {/* Fila 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Precio de Venta"
          name="precio_venta"
          type="text"
          value={(formValues as any).precio_venta ?? ""}
          onChange={handleChange}
          placeholder="180000"
          required
        />
        <FormInput
          label="Costo (opcional)"
          name="precio"
          type="text"
          value={(formValues as any).precio ?? ""}
          onChange={handleChange}
          placeholder="120000"
        />
      </div>

     


      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel} disabled={isSubmitting || loadingLookups}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || loadingLookups || (!initialData?.id && codeExists)}
        >
          {initialData?.id ? "Guardar Cambios" : "Crear Producto"}
        </Button>
      </div>

      {formError && (
        <div className="text-red-600 text-sm mt-2 text-center">{formError}</div>
      )}
    </form>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { Producto, CreateProductoData } from "../services/productosService";
import { getCategorias, Categoria } from "../../components/services/categoriasService";
import { getEstados, Estado } from "../../components/services/estadosService";
import { formatCurrency } from "../../utils/formatters"; // ✅ IMPORTAMOS EL FORMATEADOR

type FormData = CreateProductoData & { id?: number };

interface Props {
  initialData?: Partial<Producto> | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export default function ProductosForm({ initialData, onSubmit, onCancel }: Props) {
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

        const defaultCategoriaId = initialData?.categoriaId || catResponse[0]?.id || 0;
        const defaultEstadoId = initialData?.estadoId || estResponse[0]?.id || 0;

        reset({
          ...initialData,
          categoriaId: defaultCategoriaId,
          estadoId: defaultEstadoId,
        });
      } catch (error) {
        console.error("Error al cargar datos de lookup:", error);
        reset({
          ...initialData,
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
    // ✅ Aseguramos que el precio se envíe como número limpio (sin comas ni $)
    data.precio = Number(String(data.precio).replace(/[^\d]/g, ""));
    onSubmit(data);
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

      {/* Fila 2: Categoría y Estado */}
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
        <FormSelect
          label="Estado"
          name="estadoId"
          value={String(formValues.estadoId)}
          onChange={handleChange}
          options={estadoOptions}
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
    </form>
  );
}

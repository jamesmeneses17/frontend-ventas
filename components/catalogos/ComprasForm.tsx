"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { getProductos, Producto } from "../services/productosService";
import { CreateCompraDTO } from "../services/comprasService";
import { formatCurrency } from "../../utils/formatters";

type FormData = {
  id?: number;
  productoId: number;
  cantidad: number;
  costo_unitario: number;
  costo_total: number;
  fecha_compra: string;
  observacion?: string;
};

interface Props {
  initialData?: Partial<FormData> | null;
  onSubmit: (data: CreateCompraDTO) => void;
  onCancel: () => void;
  formError?: string;
}

export default function ComprasForm({
  initialData,
  onSubmit,
  onCancel,
  formError,
}: Props) {
  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      id: initialData?.id,
      productoId: initialData?.productoId ?? 0,
      cantidad: initialData?.cantidad ?? 1,
      costo_unitario: initialData?.costo_unitario ?? 0,
      costo_total: initialData?.costo_total ?? 0,
      fecha_compra:
        initialData?.fecha_compra ?? new Date().toISOString().substring(0, 10),
      observacion: initialData?.observacion ?? "",
    },
  });

  const formValues = watch();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [productoSearchTerm, setProductoSearchTerm] = useState("");
  const [costoUnitarioDisplay, setCostoUnitarioDisplay] = useState(
    initialData?.costo_unitario
      ? Number(initialData.costo_unitario).toLocaleString("es-CO", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : ""
  );

  //Q 🔎 Cargar productos
  useEffect(() => {
    const loadProductos = async () => {
      setLoadingLookups(true);
      try {
        const list = await getProductos(1, 100, "", "");
        const productosList = Array.isArray(list) ? list : list?.data ?? [];

        setProductos(productosList);

        reset({
          id: initialData?.id,
          productoId: initialData?.productoId ?? (productosList[0]?.id || 0),
          cantidad: initialData?.cantidad ?? 1,
          costo_unitario: initialData?.costo_unitario ?? 0,
          costo_total: initialData?.costo_total ?? 0,
          fecha_compra:
            initialData?.fecha_compra ??
            new Date().toISOString().substring(0, 10),
          observacion: initialData?.observacion ?? "",
        });

        // Sincronizar el display del costo_unitario
        if (initialData?.costo_unitario) {
          setCostoUnitarioDisplay(
            Number(initialData.costo_unitario).toLocaleString("es-CO", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          );
        }
      } finally {
        setLoadingLookups(false);
      }
    };

    loadProductos();
  }, [initialData, reset]);

  // 📌 Calcular costo_total en vivo
  useEffect(() => {
    const total =
      Number(formValues.cantidad || 0) * Number(formValues.costo_unitario || 0);
    setValue("costo_total", total);
  }, [formValues.cantidad, formValues.costo_unitario, setValue]);

  // 🔄 Buscar productos y autoseleccionar sin perder el catálogo inicial (similar a ProductosForm)
  useEffect(() => {
    const term = productoSearchTerm.trim();
    if (!term) return;

    const normalized = term.toLowerCase();

    // 1) Intentar con la lista local primero
    const exactLocal = productos.find(
      (p) => p.codigo?.toLowerCase() === normalized
    );
    const partialLocal = productos.find((p) =>
      p.codigo?.toLowerCase().startsWith(normalized)
    );
    const localTarget = exactLocal || partialLocal;
    if (localTarget) {
      setValue("productoId", localTarget.id, { shouldValidate: true });
      return;
    }

    // 2) Si no está en la lista local, consultar API y fusionar sin reemplazar la lista previa
    const timer = setTimeout(async () => {
      try {
        const res = await getProductos(1, 10, "", term);
        const list = Array.isArray(res) ? res : res?.data ?? [];

        if (list.length > 0) {
          // fusionar sin duplicar por id
          setProductos((prev) => {
            const merged = [...prev];
            list.forEach((item: any) => {
              if (!merged.some((p) => p.id === item.id)) {
                merged.push(item);
              }
            });
            return merged;
          });

          const exact = list.find(
            (p: any) => p.codigo?.toLowerCase() === normalized
          );
          const partial = list.find((p: any) =>
            p.codigo?.toLowerCase().startsWith(normalized)
          );
          const target = exact || partial || list[0];
          if (target) {
            setValue("productoId", target.id, { shouldValidate: true });
          }
        }
      } catch (err) {
        console.error("Error buscando producto por código", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [productoSearchTerm, productos, setValue]);

  // 📌 Seleccionar producto automáticamente al escribir un código exacto
  useEffect(() => {
    if (!productoSearchTerm || productos.length === 0) return;

    const normalizedSearch = productoSearchTerm.trim().toLowerCase();
    const exactMatch = productos.find(
      (p) => p.codigo?.trim().toLowerCase() === normalizedSearch
    );

    if (exactMatch) {
      setValue("productoId", exactMatch.id, { shouldValidate: true });
      return;
    }

    // Si no hay match exacto, intenta con coincidencia inicial (para evitar escribir todo el código)
    const partialMatch = productos.find((p) =>
      p.codigo?.trim().toLowerCase().startsWith(normalizedSearch)
    );

    if (partialMatch) {
      setValue("productoId", partialMatch.id, { shouldValidate: true });
    }
  }, [productoSearchTerm, productos, setValue]);

  // 🔥 Formatear costo_unitario con miles sin bloquear entrada
  const handlePriceChange = (inputValue: string) => {
    // Limpiar: eliminar puntos y comas de entrada
    const cleaned = inputValue.replace(/[^0-9]/g, "");
    
    if (cleaned === "") {
      setCostoUnitarioDisplay("");
      setValue("costo_unitario", 0, { shouldValidate: true });
      return;
    }

    // Convertir a número
    const numericValue = parseInt(cleaned, 10);
    if (!Number.isFinite(numericValue)) {
      return;
    }

    // Formatear para visualizar con separador de miles (punto)
    const formatted = numericValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Guardar en display y en el formulario
    setCostoUnitarioDisplay(formatted);
    setValue("costo_unitario", numericValue, { shouldValidate: true });
  };

  // 📌 Control universal de cambios
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    // 💰 Formateo automático para costo_unitario con separador de miles en vivo
    if (name === "costo_unitario") {
      handlePriceChange(value);
      return;
    }

    const parsed =
      type === "number" || name === "productoId" ? Number(value) : value;

    setValue(name as keyof FormData, parsed, { shouldValidate: true });

    // Sincronizar el campo de búsqueda cuando se selecciona un producto desde el combo
    if (name === "productoId") {
      const selected = productos.find((p) => p.id === Number(value));
      if (selected?.codigo) setProductoSearchTerm(selected.codigo);
    }
  };

  const submitForm: SubmitHandler<FormData> = (data) => {
    // Buscar producto seleccionado para obtener categoria
    const productoSel = productos.find((p) => p.id === Number(data.productoId));
    if (!productoSel) {
      // No debería ocurrir (select obliga a elegir), pero prevenir envío inválido
      throw new Error(
        "Selecciona un producto válido antes de enviar la compra."
      );
    }

    // Guardar la fecha como string 'YYYY-MM-DD' para evitar desfase de zona horaria
    const payload: any = {
      fecha: data.fecha_compra || new Date().toISOString().substring(0, 10),
      producto_id: Number(data.productoId),
      cantidad: Math.max(1, Number(data.cantidad) || 0),
      // El valor ya está limpio porque handlePriceChange lo convierte a número
      costo_unitario: Number(data.costo_unitario) || 0,
    };

    onSubmit(payload as CreateCompraDTO);
  };

  const productoOptions = productos.map((p) => ({
    value: String(p.id),
    label: `${p.codigo} - ${p.nombre}`,
  }));

  // Filtrar productos por búsqueda
  const productosFiltrados = productos.filter((p) => {
    const searchLower = productoSearchTerm.toLowerCase();
    return (
      p.codigo?.toLowerCase().includes(searchLower) ||
      p.nombre?.toLowerCase().includes(searchLower)
    );
  });

  const productoOptionsFiltered = productosFiltrados.map((p) => ({
    value: String(p.id),
    label: `${p.codigo} - ${p.nombre}`,
  }));

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      {/* ===================== BÚSQUEDA + SELECCIÓN ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Buscar Producto"
          name="productoSearch"
          value={productoSearchTerm}
          onChange={(e) => setProductoSearchTerm(e.target.value)}
          placeholder="Ej: LC209 o Teclado..."
        />

        <FormSelect
          label="Producto"
          name="productoId"
          value={String(formValues.productoId)}
          onChange={handleChange}
          options={productoOptionsFiltered}
          disabled={loadingLookups}
          required
        />
      </div>

      {/* ===================== FILA 1 ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Cantidad"
          name="cantidad"
          type="number"
          value={String(formValues.cantidad)}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Costo Unitario"
          name="costo_unitario"
          type="text"
          value={costoUnitarioDisplay}
          onChange={handleChange}
          placeholder="30000"
          required
        />
      </div>

      {/* ===================== FILA 2 ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Fecha de Compra"
          name="fecha_compra"
          type="date"
          value={formValues.fecha_compra}
          onChange={handleChange}
          required
        />
      </div>

      {/* ===================== FILA 3 ===================== */}

      {/* ===================== BOTONES ===================== */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || loadingLookups}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loadingLookups}>
          {initialData?.id ? "Actualizar Compra" : "Registrar Compra"}
        </Button>
      </div>

      {formError && (
        <div className="text-red-600 text-sm mt-2 text-center">{formError}</div>
      )}
    </form>
  );
}

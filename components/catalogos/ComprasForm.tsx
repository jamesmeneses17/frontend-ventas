"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { getProductos, Producto } from "../services/productosService";
import { formatCurrency } from "../../utils/formatters";

interface FormData {
  id?: number;
  productoId: number;
  cantidad: number;
  costo_unitario: number;
  costo_total: number;
  fecha_compra: string;
  observacion?: string;
}

interface Props {
  initialData?: Partial<FormData> | null;
  onSubmit: (data: FormData) => void;
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
    formState: { errors, isSubmitting },
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
        initialData?.fecha_compra ??
        new Date().toISOString().substring(0, 10),
      observacion: initialData?.observacion ?? "",
    },
  });

  const formValues = watch();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  useEffect(() => {
    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const list = await getProductos();
        setProductos(list);

        reset({
          id: initialData?.id,
          productoId: initialData?.productoId ?? (list[0]?.id || 0),
          cantidad: initialData?.cantidad ?? 1,
          costo_unitario: initialData?.costo_unitario ?? 0,
          costo_total: initialData?.costo_total ?? 0,
          fecha_compra:
            initialData?.fecha_compra ??
            new Date().toISOString().substring(0, 10),
          observacion: initialData?.observacion ?? "",
        });
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, [initialData, reset]);

  // 🔥 Actualizar costo total automáticamente
  useEffect(() => {
    const total =
      Number(formValues.cantidad || 0) *
      Number(formValues.costo_unitario || 0);
    setValue("costo_total", total);
  }, [formValues.cantidad, formValues.costo_unitario]);

  const submitForm: SubmitHandler<FormData> = (data) => {
    data.costo_unitario = Number(String(data.costo_unitario).replace(/[^\d]/g, ""));
    data.costo_total = Number(data.costo_total);
    onSubmit(data);
  };

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;

    if (name === "costo_unitario") {
      const numericValue = value.replace(/[^\d]/g, "");
      setValue(name as keyof FormData, Number(numericValue), {
        shouldValidate: true,
      });
      return;
    }

    const parsed =
      type === "number" ? Number(value) : value;

    setValue(name as keyof FormData, parsed, { shouldValidate: true });
  };

  const productoOptions = productos.map((p) => ({
    value: String(p.id),
    label: `${p.codigo} - ${p.nombre}`,
  }));

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      {/* Producto */}
      <FormSelect
        label="Producto"
        name="productoId"
        value={String(formValues.productoId)}
        onChange={handleChange}
        options={productoOptions}
        required
      />

      {/* Cantidad */}
      <FormInput
        label="Cantidad"
        name="cantidad"
        type="number"
        value={String(formValues.cantidad)}
        onChange={handleChange}
        required
      />

      {/* Costo unitario */}
      <FormInput
        label="Costo Unitario"
        name="costo_unitario"
        type="text"
        value={formatCurrency(formValues.costo_unitario)}
        onChange={handleChange}
        required
      />

      {/* Total */}
      <FormInput
        label="Costo Total"
        name="costo_total"
        value={formatCurrency(formValues.costo_total)}
        disabled
      />

      {/* Fecha */}
      <FormInput
        label="Fecha de Compra"
        name="fecha_compra"
        type="date"
        value={formValues.fecha_compra}
        onChange={handleChange}
        required
      />

      {/* Observación */}
      <FormInput
        label="Observación"
        name="observacion"
        type="textarea"
        value={formValues.observacion}
        onChange={handleChange}
      />

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {initialData?.id ? "Guardar Cambios" : "Registrar Compra"}
        </Button>
      </div>

      {formError && (
        <div className="text-red-600 text-sm mt-2 text-center">
          {formError}
        </div>
      )}
    </form>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";
import { formatCurrency } from "../../utils/formatters";
import {
  CreateMovimientoData,
  MovimientoCaja,
  TipoMovimiento
} from "../services/movimientosService";

// Options fijas
const TIPO_MOVIMIENTO_OPTIONS: { value: TipoMovimiento; label: string }[] = [
  { value: "INGRESO", label: "Ingreso" },
  { value: "EGRESO", label: "Egreso (Compra de Productos)" },
  { value: "GASTO", label: "Gasto (Servicios, Transporte, etc.)" }
];

// Convierte fecha para input date
const toInputDate = (dateString: string | undefined): string => {
  if (!dateString) return new Date().toISOString().split("T")[0];
  return dateString.split("T")[0];
};

// Tipo local
type FormData = Omit<CreateMovimientoData, "fecha"> & {
  id?: number;
  fecha_str: string;
};

interface Props {
  initialData?: Partial<MovimientoCaja> | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  formError?: string;
}

export default function MovimientosForm({
  initialData = null,
  onSubmit,
  onCancel,
  formError
}: Props) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<FormData>({
    defaultValues: {
      id: initialData?.id || undefined,
      tipo_movimiento:
        (initialData?.tipo_movimiento as TipoMovimiento) ||
        TIPO_MOVIMIENTO_OPTIONS[0].value,
      concepto: initialData?.concepto || "",
      monto: (initialData as any)?.monto ?? 0,
      fecha_str: toInputDate(initialData?.fecha)
    }
  });

  const formValues = watch();

  useEffect(() => {
    if (initialData?.id) {
      // edición
      reset({
        id: initialData.id,
        tipo_movimiento:
          (initialData.tipo_movimiento as TipoMovimiento) ||
          TIPO_MOVIMIENTO_OPTIONS[0].value,
        concepto: initialData.concepto || "",
        monto: Number(initialData.monto) || 0,
        fecha_str: toInputDate(initialData.fecha)
      });
    } else {
      // nuevo
      reset({
        tipo_movimiento: TIPO_MOVIMIENTO_OPTIONS[0].value,
        concepto: "",
        monto: 0,
        fecha_str: toInputDate(undefined)
      });
    }
  }, [initialData, reset]);

  const submitForm: SubmitHandler<FormData> = (data) => {
    data.monto = Number(String(data.monto).replace(/[^\d]/g, ""));
    onSubmit({
      ...data,
      fecha_str: data.fecha_str
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "monto") {
      const numericValue = value.replace(/[^\d]/g, "");
      const numberValue = Number(numericValue || 0);
      setValue("monto", numberValue as any, { shouldValidate: true });
      return;
    }

    setValue(name as keyof FormData, value as any, { shouldValidate: true });
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="space-y-4"
    >

      {/* Tipo - Fecha */}
      <FormSelect
        label="Tipo de Movimiento"
        name="tipo_movimiento"
        value={formValues.tipo_movimiento}
        onChange={handleChange}
        options={TIPO_MOVIMIENTO_OPTIONS}
        required
      />

      <FormInput
        label="Fecha"
        name="fecha_str"
        type="date"
        value={formValues.fecha_str}
        onChange={handleChange}
        required
      />

      {/* Monto */}
      <FormInput
        label="Monto Total"
        name="monto"
        type="text"
        value={formatCurrency(formValues.monto as number)}
        onChange={handleChange}
        required
        error={errors.monto && "El monto debe ser un número válido."}
      />

      {/* Concepto */}
      <FormInput
        label="Concepto / Descripción"
        name="concepto"
        value={formValues.concepto}
        onChange={handleChange}
        placeholder="Detalle del movimiento"
        required
      />

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {initialData?.id ? "Guardar Cambios" : "Registrar Movimiento"}
        </Button>
      </div>

      {formError && (
        <p className="text-red-600 text-center text-sm">{formError}</p>
      )}
    </form>
  );
}

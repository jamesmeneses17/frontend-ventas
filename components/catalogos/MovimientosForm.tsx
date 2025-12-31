"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";
import { formatCurrency } from "../../utils/formatters";
import { getTiposMovimiento, TipoMovimiento } from "../services/tiposMovimientoService";
import { MovimientoCaja } from "../services/cajaService";

// Convierte fecha para input date
const toInputDate = (dateString: string | undefined): string => {
  if (!dateString) return new Date().toISOString().split("T")[0];
  return dateString.split("T")[0];
};

// Tipo local alineado a la base de datos
type FormData = {
  id?: number;
  tipo_movimiento_id: number;
  monto: number;
  concepto: string;
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
  // Estado para cargar los tipos desde la DB
  const [tipoOptions, setTipoOptions] = useState<{ value: string; label: string }[]>([]);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<FormData>({
    defaultValues: {
      id: initialData?.id || undefined,
      tipo_movimiento_id: initialData?.tipo_movimiento_id || (initialData as any)?.tipoMovimientoId || 0,
      concepto: initialData?.concepto || "",
      monto: Number(initialData?.monto) || 0,
      fecha_str: toInputDate(initialData?.fecha)
    }
  });

  const formValues = watch();

  // 1. Cargar opciones del selector desde el Backend
  useEffect(() => {
    const fetchTipos = async () => {
      const tipos = await getTiposMovimiento();
      const options = tipos
        .filter((t: TipoMovimiento) => t.id !== 4 && t.nombre.toLowerCase() !== 'venta') // Excluir Venta (ID 4) para creación manual
        .map((t: TipoMovimiento) => ({
          value: String(t.id),
          label: t.nombre
        }));
      setTipoOptions(options);

      // Si es nuevo, poner el primero por defecto
      if (!initialData?.id && options.length > 0) {
        setValue("tipo_movimiento_id", Number(options[0].value));
      }
    };
    fetchTipos();
  }, [initialData, setValue]);

  // 2. Resetear valores cuando cambia initialData (Edición)
  useEffect(() => {
    if (initialData?.id) {
      reset({
        id: initialData.id,
        tipo_movimiento_id: initialData.tipo_movimiento_id || (initialData as any)?.tipoMovimientoId,
        concepto: initialData.concepto || "",
        monto: Number(initialData.monto) || 0,
        fecha_str: toInputDate(initialData.fecha)
      });
    }
  }, [initialData, reset]);

  const submitForm: SubmitHandler<FormData> = (data) => {
    // Limpiar el monto de cualquier caracter no numérico
    const numericMonto = Number(String(data.monto).replace(/[^\d]/g, ""));

    onSubmit({
      ...data,
      tipo_movimiento_id: Number(data.tipo_movimiento_id),
      monto: numericMonto
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "monto") {
      const numericValue = value.replace(/[^\d]/g, "");
      setValue("monto", Number(numericValue || 0) as any, { shouldValidate: true });
      return;
    }

    if (name === "tipo_movimiento_id") {
      setValue("tipo_movimiento_id", Number(value), { shouldValidate: true });
      return;
    }

    setValue(name as keyof FormData, value as any, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">

      {/* Selector Dinámico */}
      <FormSelect
        label="Tipo de Movimiento"
        name="tipo_movimiento_id"
        value={formValues.tipo_movimiento_id ? String(formValues.tipo_movimiento_id) : ""}
        onChange={handleChange}
        options={tipoOptions}
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

      <FormInput
        label="Monto Total"
        name="monto"
        type="text"
        value={formatCurrency(formValues.monto)}
        onChange={handleChange}
        required
        error={errors.monto && "El monto debe ser un número válido."}
      />

      <FormInput
        label="Concepto / Descripción"
        name="concepto"
        value={formValues.concepto}
        onChange={handleChange}
        placeholder="Detalle del movimiento"
        required
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || tipoOptions.length === 0}>
          {initialData?.id ? "Guardar Cambios" : "Registrar Movimiento"}
        </Button>
      </div>

      {formError && (
        <p className="text-red-600 text-center text-sm">{formError}</p>
      )}
    </form>
  );
}
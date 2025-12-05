// components/catalogos/MovimientosForm.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button"; 
import { formatCurrency } from "../../utils/formatters"; 
import { CreateMovimientoData, MovimientoCaja, TipoMovimiento } from "../services/movimientosService";

// Importa los tipos del servicio de movimientos (Ajusta la ruta si es necesario)

// Definición de las opciones fijas para el Tipo de Movimiento
const TIPO_MOVIMIENTO_OPTIONS: { value: TipoMovimiento; label: string }[] = [
    { value: 'INGRESO', label: "1. Ingreso" },
    { value: 'EGRESO', label: "2. Egreso (Compra de Productos)" },
    { value: 'GASTO', label: "3. Gasto (Servicios, Transporte, etc.)" },
];

// Tipos para el formulario local (incluye el ID para edición)
type FormData = Omit<CreateMovimientoData, "fecha"> & { 
  id?: number; 
  // La fecha viene como string para el input type="date"
  fecha_str: string;
};

interface Props {
  initialData?: Partial<MovimientoCaja> | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  formError?: string;
}

// -------------------- UTILITY para fecha --------------------
// Convierte 'YYYY-MM-DD' de la base de datos a 'YYYY-MM-DD' para el input date
const toInputDate = (dateString: string | undefined): string => {
    if (!dateString) {
        // Devuelve la fecha de hoy por defecto para nuevos registros
        return new Date().toISOString().split('T')[0];
    }
    // Asume que la fecha de la DB ya viene en formato compatible (YYYY-MM-DD)
    return dateString.split('T')[0];
};
// -----------------------------------------------------------


export default function MovimientosForm({ initialData, onSubmit, onCancel, formError }: Props) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
    id: initialData?.id || undefined,
    tipo_movimiento: (initialData?.tipo_movimiento as TipoMovimiento) || TIPO_MOVIMIENTO_OPTIONS[0].value,
      concepto: initialData?.concepto || "",
      monto: (initialData as any)?.monto ?? 0,
      fecha_str: toInputDate(initialData?.fecha), // Usamos la utilidad para la fecha
    },
  });

  const formValues = watch();
  
  // Simulación de carga de lookups (no hay lookups dinámicos aquí, pero mantenemos la estructura)
  const [loadingLookups, setLoadingLookups] = useState(false);
  
  useEffect(() => {
    // Cuando los datos iniciales cambian (al abrir el modal o cambiar de edición a nuevo), reseteamos el formulario
    reset({
        id: initialData?.id ?? undefined,
        tipo_movimiento: (initialData?.tipo_movimiento as TipoMovimiento) || TIPO_MOVIMIENTO_OPTIONS[0].value,
        concepto: initialData?.concepto || "",
        monto: initialData?.monto ?? 0,
        fecha_str: toInputDate(initialData?.fecha), 
    });
  }, [initialData, reset]);

  const submitForm: SubmitHandler<FormData> = (data) => {
    // 1. Limpiar y convertir el Monto a número
    data.monto = Number(String(data.monto).replace(/[^\d]/g, ""));
    
    // 2. Preparar el payload final (Asegurar que la fecha sea la correcta)
    const payload: FormData = {
        ...data,
        // En este molde de formulario, la fecha se envía como un string ISO compatible con MySQL
        // El backend debe convertir 'data.fecha_str' a DATE si es necesario.
        // Lo pasamos como propiedad fecha_str para que el onSubmit lo maneje.
    };

    // No hay subida de archivos, simplemente llamamos al onSubmit
    onSubmit(payload);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Lógica para formatear y manejar el campo 'monto' como moneda
    if (name === "monto") {
      const numericValue = value.replace(/[^\d]/g, "");
      const numberValue = Number(numericValue || 0);
      setValue(name as keyof FormData, numberValue as any, { shouldValidate: true });
      return;
    }

    // Manejar otros campos (concepto, fecha_str, tipo_movimiento)
    setValue(name as keyof FormData, value as any, { shouldValidate: true });
  };


  return (
    <form 
      onSubmit={handleSubmit(submitForm)}
      className="
        space-y-6 
        max-w-xl 
        mx-auto 
        px-4 
        bg-white 
        rounded-xl 
        max-h-[80vh] 
        overflow-y-auto
      "
    >

      {/* Sección: Tipo de Movimiento y Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <FormSelect
          label="Tipo de Movimiento"
          name="tipo_movimiento"
          value={formValues.tipo_movimiento}
          onChange={handleChange}
          options={TIPO_MOVIMIENTO_OPTIONS}
          disabled={loadingLookups}
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
      </div>

      {/* Sección: Monto y Concepto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="Monto Total"
          name="monto"
          type="text"
          // Usamos formatCurrency para mostrar el valor formateado
          value={formatCurrency(formValues.monto as number)}
          onChange={handleChange}
          required
          error={errors.monto && "El monto debe ser un número válido."}
        />

        <FormInput
          label="Concepto / Descripción"
          name="concepto"
          value={formValues.concepto}
          onChange={handleChange}
          placeholder="Detalle del movimiento (ej: Pago de luz, Compra de cables)"
          required
        />
      </div>


      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel} disabled={isSubmitting || loadingLookups}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || loadingLookups}>
          {initialData?.id ? "Guardar Cambios" : "Registrar Movimiento"}
        </Button>
      </div>

      {formError && (
        <p className="text-red-600 text-center text-sm">{formError}</p>
      )}
    </form>
  );
}
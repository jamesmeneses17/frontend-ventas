"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";
import { CreateCreditoPayload } from "../services/creditosService";

type FormData = {
  numero_factura?: string;
  cliente_id: number;
  saldo_pendiente: number | string;
  fecha_inicial: string;
  fecha_final?: string;
  estado: "PENDIENTE" | "PAGADO";

  // Detalle simple (1 fila por ahora)
  producto_id: number;
  cantidad: number;
  precio_unitario: number | string;
};

interface Props {
  initialData?: Partial<CreateCreditoPayload> | null;
  onSubmit: (data: CreateCreditoPayload) => Promise<void> | void;
  onCancel: () => void;
  formError?: string;
  onSaved: () => void | Promise<void>; // 👈 clave
}

export default function CreditosForm({
  initialData,
  onSubmit,
  onCancel,
  onSaved, // 👈 ahora lo recibimos
  formError,
}: Props) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      numero_factura: initialData?.numero_factura || "",
      cliente_id: initialData?.cliente_id || 0,
      saldo_pendiente: initialData?.saldo_pendiente || 0,
      fecha_inicial: initialData?.fecha_inicial || "",
      fecha_final: initialData?.fecha_final || "",
      estado: initialData?.estado || "PENDIENTE",

      producto_id: initialData?.detalles?.[0]?.producto_id || 0,
      cantidad: initialData?.detalles?.[0]?.cantidad || 1,
      precio_unitario: initialData?.detalles?.[0]?.precio_unitario || 0,
    },
  });

  const values = watch();

  const submitForm: SubmitHandler<FormData> = async (data) => {
    const precio = Number(String(data.precio_unitario).replace(/\./g, ""));
    const cantidad = Number(data.cantidad);

    const payload: CreateCreditoPayload = {
      numero_factura: data.numero_factura?.trim(),
      cliente_id: Number(data.cliente_id),
      saldo_pendiente: Number(String(data.saldo_pendiente).replace(/\./g, "")),
      fecha_inicial: data.fecha_inicial,
      fecha_final: data.fecha_final || undefined,
      estado: data.estado,
      detalles: [
        {
          producto_id: Number(data.producto_id),
          cantidad,
          precio_unitario: precio,
          subtotal: precio * cantidad,
        },
      ],
    };

    await onSubmit(payload);

    // ✅ avisamos al padre que se guardó
    await onSaved();
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      {/* Factura */}
      <FormInput
        label="Número de factura"
        name="numero_factura"
        value={values.numero_factura}
        onChange={(e) => setValue("numero_factura", e.target.value)}
        placeholder="FAC-001"
      />

      {/* Cliente */}
      <FormInput
        label="ID Cliente"
        name="cliente_id"
        type="number"
        value={values.cliente_id}
        onChange={(e) => setValue("cliente_id", Number(e.target.value))}
        required
      />

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Fecha inicial"
          name="fecha_inicial"
          type="date"
          value={values.fecha_inicial}
          onChange={(e) => setValue("fecha_inicial", e.target.value)}
          required
        />
        <FormInput
          label="Fecha final"
          name="fecha_final"
          type="date"
          value={values.fecha_final}
          onChange={(e) => setValue("fecha_final", e.target.value)}
        />
      </div>

      {/* Estado */}
      <FormSelect
        label="Estado"
        name="estado"
        value={values.estado}
        onChange={(e) =>
          setValue("estado", e.target.value as "PENDIENTE" | "PAGADO")
        }
        options={[
          { value: "PENDIENTE", label: "Pendiente" },
          { value: "PAGADO", label: "Pagado" },
        ]}
      />

      {/* Detalle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          label="Producto ID"
          name="producto_id"
          type="number"
          value={values.producto_id}
          onChange={(e) => setValue("producto_id", Number(e.target.value))}
          required
        />
        <FormInput
          label="Cantidad"
          name="cantidad"
          type="number"
          value={values.cantidad}
          onChange={(e) => setValue("cantidad", Number(e.target.value))}
          required
        />
        <FormInput
          label="Precio unitario"
          name="precio_unitario"
          value={values.precio_unitario}
          onChange={(e) => setValue("precio_unitario", e.target.value)}
          required
        />
      </div>

      {/* Total */}
      <FormInput
        label="Saldo pendiente"
        name="saldo_pendiente"
        value={values.saldo_pendiente}
        onChange={(e) => setValue("saldo_pendiente", e.target.value)}
        required
      />

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Guardar Crédito
        </Button>
      </div>

      {formError && (
        <div className="text-red-600 text-sm text-center">{formError}</div>
      )}
    </form>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "../ui/button";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";

import { getClientes } from "../services/clientesServices"; // asume tienes servicio clientes
import { createCredito, getCreditoById, updateCredito } from "../services/cuentasCobrarService";
import { getProductos } from "../services/productosService";

const schema = z.object({
  cliente_id: z.number().int().positive(),
  articulo_id: z.number().int().positive().optional(),
  articulo: z.string().min(1),
  valor_credito: z.number().positive(),
  fecha_inicial: z.string().optional(),
  fecha_final: z.string().optional(),
});

type FormData = z.infer<typeof schema> & { id?: number };

interface Props {
  initialData?: Partial<FormData> | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function CuentasCobrarForm({ initialData = null, onSaved, onCancel }: Props) {
  const { register, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cliente_id: 0, articulo_id: undefined, articulo: "", valor_credito: 0, fecha_inicial: "", fecha_final: "" }
  });

  const [clientesOptions, setClientesOptions] = useState<{ value: string; label: string }[]>([]);
  const [productosOptions, setProductosOptions] = useState<{ value: string; label: string; nombre?: string }[]>([]);

  useEffect(() => {
    (async () => {
      // load clientes for select
      try {
        const clientes = await getClientes();
        const opts = (clientes || []).map((c:any) => ({ value: String(c.id), label: c.nombre || c.nombre_completo || c.nombre_cliente || `Cliente ${c.id}` }));
        setClientesOptions(opts);
        if (clientes && clientes.length > 0 && !initialData) {
          setValue("cliente_id", clientes[0].id);
        }
      } catch (e) {
        // ignore
      }

      // cargar productos para seleccionar artículo
      try {
        const resp = await getProductos(1, 100, "", "");
        const productosList = resp?.data || [];
        const pOpts = (productosList || []).map((p:any) => ({ value: String(p.id), label: String(p.nombre ?? `Producto ${p.id}`), nombre: String(p.nombre ?? "") }));
        setProductosOptions(pOpts);
        if (productosList && productosList.length > 0 && !initialData) {
          // si no hay artículo seleccionado por defecto, dejar el primero
          setValue("articulo_id", Number(pOpts[0].value));
          setValue("articulo", pOpts[0].nombre ?? pOpts[0].value);
        }
      } catch (err) {
        // ignore
      }

      if (initialData?.id) {
        // reload full item
        const full = await getCreditoById(Number(initialData.id));
        reset({
            cliente_id: full.cliente_id,
            articulo_id: full.articulo_id ?? undefined,
            articulo: full.articulo,
            valor_credito: Number(full.valor_credito),
            fecha_inicial: full.fecha_inicial ?? "",
            fecha_final: full.fecha_final ?? ""
          });
      } else if (initialData) {
        reset(initialData as any);
      }
    })();
  }, [initialData, reset, setValue]);

  const onSubmit = async (data: FormData) => {
    console.log("[CuentasCobrarForm] onSubmit start", { data, isSubmitting, initialData });
    try {
      if (initialData?.id) {
        console.log("[CuentasCobrarForm] updating credito id=", initialData.id, data);
        const updated = await updateCredito(initialData.id, data);
        console.log("[CuentasCobrarForm] update response:", updated);
      } else {
        // Asegurarnos que `articulo` sea string antes de enviarlo
        const safeData = { ...data, articulo: data.articulo ? String(data.articulo) : "" };
        console.log("[CuentasCobrarForm] submit payload:", safeData);
        const created = await createCredito(safeData as any);
        console.log("[CuentasCobrarForm] create response:", created);
      }

      // Aguardar a que la acción de la página (cerrar modal, recargar) concluya y capturar errores
      try {
        await onSaved();
      } catch (err2) {
        console.error("[CuentasCobrarForm] onSaved error:", err2);
      }
    } catch (err: any) {
      console.error("[CuentasCobrarForm] error", err);
      // Mostrar mensaje más descriptivo si viene del servidor
      const msg = err?.response?.data?.message || err?.message || "Error al guardar";
      alert(msg);
    }
  };

  const clienteId = watch("cliente_id");

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errs) => {
        console.log("[CuentasCobrarForm] validation errors:", errs);
      })}
      className="space-y-4"
    >
      <FormSelect
        label="Cliente"
        name="cliente_id"
        value={String(clienteId ?? "")}
        onChange={(e:any) => setValue("cliente_id", Number(e.target.value))}
        options={clientesOptions}
        required
      />
      <FormSelect
        label="Artículo"
        name="articulo_id"
        value={String(watch("articulo_id") ?? "")}
        onChange={(e:any) => {
          const val = e.target.value;
          setValue("articulo_id", Number(val));
          // también setear nombre legible en `articulo`
          const found = productosOptions.find(p => p.value === String(val));
          setValue("articulo", found?.nombre ?? String(val));
        }}
        options={productosOptions}
      />
      {/* field oculto para `articulo` (nombre) - registrado para validación y envío */}
      <input type="hidden" {...register("articulo")} />
      <FormInput label="Valor crédito" type="number" {...register("valor_credito", { valueAsNumber: true })} />
      <FormInput label="Fecha inicial" type="date" {...register("fecha_inicial")} />
      <FormInput label="Fecha final" type="date" {...register("fecha_final")} />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>{initialData?.id ? "Guardar" : "Crear"}</Button>
      </div>
    </form>
  );
}

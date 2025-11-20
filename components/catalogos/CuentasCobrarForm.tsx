"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "../ui/button";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";

import { getClientes } from "../services/clientesServices"; // asume tienes servicio clientes
import { createCredito, getCreditoById, updateCredito } from "../services/creditosService";

const schema = z.object({
  cliente_id: z.number().int().positive(),
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
    defaultValues: { cliente_id: 0, articulo: "", valor_credito: 0, fecha_inicial: "", fecha_final: "" }
  });

  const [clientesOptions, setClientesOptions] = useState<{ value: string; label: string }[]>([]);

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

      if (initialData?.id) {
        // reload full item
        const full = await getCreditoById(Number(initialData.id));
        reset({
          cliente_id: full.cliente_id,
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
    try {
      if (initialData?.id) {
        await updateCredito(initialData.id, data);
      } else {
        await createCredito(data as any);
      }
      onSaved();
    } catch (err: any) {
        console.error("[CuentasCobrarForm] error", err);
        alert(err?.response?.data?.message ?? "Error al guardar");
      }
  };

  const clienteId = watch("cliente_id");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSelect
        label="Cliente"
        name="cliente_id"
        value={String(clienteId ?? "")}
        onChange={(e:any) => setValue("cliente_id", Number(e.target.value))}
        options={clientesOptions}
        required
      />
      <FormInput label="Artículo" {...register("articulo")} />
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

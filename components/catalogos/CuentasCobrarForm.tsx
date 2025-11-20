"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "../ui/button";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";

import { createCredito, updateCredito, getCreditoById } from "../services/cuentasCobrarService";
import { getClientes } from "../services/clientesService"; // asume tienes servicio clientes

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
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cliente_id: 0, articulo: "", valor_credito: 0, fecha_inicial: "", fecha_final: "" }
  });

  useEffect(() => {
    (async () => {
      // load clientes for select
      try {
        const clientes = await getClientes();
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
    } catch (err) {
      console.error("[CuentasCobrarForm] error", err);
      alert(err?.response?.data?.message ?? "Error al guardar");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSelect label="Cliente" name="cliente_id" {...{
        value: String((initialData?.cliente_id ?? 0)),
        onChange: (e:any) => setValue("cliente_id", Number(e.target.value))
      }} options={[]} /> {/* Puedes reemplazar por componente que haga fetch de clientes */}
      <FormInput label="Artículo" name="articulo" {...register("articulo")} error={errors.articulo?.message as any} />
      <FormInput label="Valor crédito" name="valor_credito" type="number" {...register("valor_credito", { valueAsNumber: true })} error={errors.valor_credito?.message as any} />
      <FormInput label="Fecha inicial" name="fecha_inicial" type="date" {...register("fecha_inicial")} />
      <FormInput label="Fecha final" name="fecha_final" type="date" {...register("fecha_final")} />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>{initialData?.id ? "Guardar" : "Crear"}</Button>
      </div>
    </form>
  );
}

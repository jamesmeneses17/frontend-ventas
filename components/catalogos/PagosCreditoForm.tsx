"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../ui/button";
import { registrarPago, getPagosByCredito, getCreditoById } from "../services/cuentasCobrarService";
import { formatCurrency } from "../utils/formatters";
import FormInput from "../common/form/FormInput";

interface Props {
  creditoId: number;
  onClose: () => void;
}

export default function PagosCreditoForm({ creditoId, onClose }: Props) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ monto_pago:number; fecha_pago?:string }>();
  const [pagos, setPagos] = useState<any[]>([]);
  const [credito, setCredito] = useState<any | null>(null);

  const load = async () => {
    const c = await getCreditoById(creditoId);
    setCredito(c);
    const p = await getPagosByCredito(creditoId);
    setPagos(p || []);
  };

  useEffect(() => { load(); }, [creditoId]);

  const onSubmit = async (data:any) => {
    try {
      await registrarPago({ credito_id: creditoId, monto_pago: Number(data.monto_pago) });
      reset();
      await load();
    } catch (err) {
      console.error("[PagosCreditoForm] error", err);
      alert(err?.response?.data?.message ?? "Error registrando pago");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Crédito</h3>
        <div className="text-sm text-gray-700">{credito?.cliente} — {credito?.articulo}</div>
        <div className="mt-2">
          <span className="text-xs text-gray-500 mr-2">Saldo:</span>
          <span className="font-bold">{formatCurrency(Number(credito?.saldo_pendiente ?? 0))}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormInput label="Monto" name="monto_pago" type="number" {...register("monto_pago", { valueAsNumber: true })} />
        <FormInput label="Fecha (opcional)" name="fecha_pago" type="date" {...register("fecha_pago")} />
        <div className="flex items-end">
          <Button type="submit" disabled={isSubmitting}>Registrar Pago</Button>
        </div>
      </form>

      <div>
        <h4 className="font-semibold">Historial de pagos</h4>
        <div className="mt-2 space-y-2">
          {pagos.length === 0 && <div className="text-sm text-gray-500">Sin pagos registrados</div>}
          {pagos.map(p => (
            <div key={p.id} className="flex justify-between border-b py-2">
              <div>{p.fecha_pago?.substring(0,10) ?? p.fecha_pago}</div>
              <div className="font-semibold">{formatCurrency(Number(p.monto_pago || 0))}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onClose} type="button">Cerrar</Button>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../ui/button";
import { formatCurrency } from "../../utils/formatters";
import FormInput from "../common/form/FormInput";
import {
  getPagosByCredito,
  registrarPago,
} from "../services/pagosCreditoService";
import { getCreditoById } from "../services/creditosService";

interface Props {
  creditoId: number;
  onClose: () => void;
}

type PagoFormValues = {
  monto_pago: number;
  fecha_pago?: string;
};

export default function PagosCreditoForm({
  creditoId,
  onClose,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PagoFormValues>({
    defaultValues: {
      monto_pago: undefined,
      fecha_pago: undefined,
    },
  });

  const [pagos, setPagos] = useState<any[]>([]);
  const [credito, setCredito] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      const c = await getCreditoById(creditoId);
      setCredito(c);

      const p = await getPagosByCredito(creditoId);
      console.log("[PagosCreditoForm] loaded pagos:", p);
      setPagos(p || []);
    };
    load();
  }, [creditoId]);

  const onSubmit = async (data: PagoFormValues) => {
    try {
      console.log("[PagosCreditoForm] raw form data:", data);
      console.log("typeof monto_pago:", typeof data.monto_pago, "valor:", data.monto_pago);

      const monto = Number(data.monto_pago);

      if (!monto || isNaN(monto) || monto <= 0) {
        alert("Ingrese un monto válido mayor que 0");
        return;
      }

      const payload: any = {
        credito_id: creditoId,
        monto_pago: monto,
      };

      if (data.fecha_pago) {
        payload.fecha_pago = data.fecha_pago;
      }

      console.log("[PagosCreditoForm] payload enviado:", payload);

      const saldo = Number(credito?.saldo_pendiente ?? 0);
      if (saldo > 0 && monto > saldo) {
        const ok = confirm(
          `El monto ingresado (${monto}) excede el saldo pendiente (${saldo}). ¿Desea continuar?`
        );
        if (!ok) return;
      }

      const resp = await registrarPago(payload);

      if (resp && typeof resp.nuevo_saldo !== "undefined") {
        setCredito((c: any) => ({
          ...(c || {}),
          saldo_pendiente: resp.nuevo_saldo,
        }));
      }

      reset();

      const pagosActualizados = await getPagosByCredito(creditoId);
      setPagos(pagosActualizados || []);

      console.log(
        "[PagosCreditoForm] pago registrado correctamente",
        resp
      );
    } catch (err: any) {
      console.error("[PagosCreditoForm] error", err);
      console.error(
        "[PagosCreditoForm] error response:",
        err?.response?.data,
        "status:",
        err?.response?.status
      );

      const serverMsg =
        err?.response?.data?.message ?? err?.message;
      alert(serverMsg || "Error registrando pago");
    }
  };

  return (
    <div className="space-y-4">
      {/* INFO DEL CRÉDITO */}
      <div>
        <h3 className="font-semibold">Crédito</h3>
        <div className="text-sm text-gray-700">
          {credito?.cliente} — {credito?.articulo}
        </div>
        <div className="mt-2">
          <span className="text-xs text-gray-500 mr-2">
            Saldo:
          </span>
          <span className="font-bold">
            {formatCurrency(
              Number(credito?.saldo_pendiente ?? 0)
            )}
          </span>
        </div>
      </div>

      {/* FORMULARIO */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <FormInput
          label="Monto"
          type="number"
          step="0.01"
          {...register("monto_pago", {
            required: true,
            setValueAs: (v) =>
              v === "" ? undefined : Number(v),
          })}
        />

        <FormInput
          label="Fecha (opcional)"
          type="date"
          {...register("fecha_pago")}
        />

        <div className="flex items-end">
          <Button type="submit" disabled={isSubmitting}>
            Registrar Pago
          </Button>
        </div>
      </form>

      {/* HISTORIAL */}
      <div>
        <h4 className="font-semibold">Historial de pagos</h4>
        <div className="mt-2 space-y-2">
          {pagos.length === 0 && (
            <div className="text-sm text-gray-500">
              Sin pagos registrados
            </div>
          )}

          {pagos.map((p) => (
            <div
              key={p.id}
              className="flex justify-between border-b py-2"
            >
              <div>
                {p.fecha_pago?.substring(0, 10) ??
                  p.fecha_pago}
              </div>
              <div className="font-semibold">
                {formatCurrency(
                  Number(p.monto_pago || 0)
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end">
        <Button onClick={onClose} type="button">
          Cerrar
        </Button>
      </div>
    </div>
  );
}

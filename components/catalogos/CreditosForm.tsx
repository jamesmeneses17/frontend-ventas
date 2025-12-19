"use client";

import React, { useEffect, useState } from "react";
import { getPagosByCredito, registrarPago } from "../services/pagosCreditoService";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import ProductAutocomplete from "../common/form/ProductAutocomplete";
import Button from "../ui/button";
import { CreateCreditoPayload } from "../services/creditosService";

type ProductoDetalle = {
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

type FormData = {
  numero_factura?: string;
  cliente_id: number;
  saldo_pendiente: number | string;
  fecha_inicial: string;
  fecha_final?: string;
  estado: "PENDIENTE" | "PAGADO";
  detalles: ProductoDetalle[];
};

type CreditoWithId = Partial<CreateCreditoPayload> & { id?: number };

interface Props {
  initialData?: CreditoWithId | null;
  onSubmit: (data: CreateCreditoPayload) => Promise<void> | void;
  onCancel: () => void;
  formError?: string;
  onSaved: () => void | Promise<void>;
}

export default function CreditosForm({
  initialData,
  onSubmit,
  onCancel,
  onSaved,
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
      detalles: initialData?.detalles || [],
    },
  });

  const values = watch();

  // --- ESTADOS LOCALES ---
  const detallesIniciales: ProductoDetalle[] = (initialData?.detalles || []).map((d: any) => ({
    producto_id: d.producto_id,
    producto_nombre: d.producto_nombre || d.producto?.nombre || "",
    cantidad: d.cantidad,
    precio_unitario: d.precio_unitario,
    subtotal: d.subtotal,
  }));

  const [detalles, setDetalles] = useState<ProductoDetalle[]>(detallesIniciales);
  const [pagos, setPagos] = useState<any[]>([]);
  const [nuevoPago, setNuevoPago] = useState("");
  const [notasPago, setNotasPago] = useState("");
  const [pagosLoading, setPagosLoading] = useState(false);
  const [pagoError, setPagoError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [cantidadTmp, setCantidadTmp] = useState(1);

  // --- CÁLCULOS ---
  const totalProductos = detalles.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0);
  const totalPagos = pagos.reduce((sum, p) => sum + (Number(p.monto_pago) || 0), 0);
  const saldoPendiente = Math.max(totalProductos - totalPagos, 0);

  // --- EFECTOS ---
  useEffect(() => {
    if (initialData?.id) {
      setPagosLoading(true);
      getPagosByCredito(initialData.id)
        .then(setPagos)
        .catch(() => setPagos([]))
        .finally(() => setPagosLoading(false));
    }
  }, [initialData]);

  // --- HANDLERS ---
  const handleRegistrarAbono = async () => {
    setPagoError(null);
    const idActivo = initialData?.id;

    if (!idActivo) {
      setPagoError("Guarde el crédito");
      return;
    }

    const monto = Number(nuevoPago);
    if (!nuevoPago || isNaN(monto) || monto <= 0) {
      setPagoError("Ingrese un monto válido.");
      return;
    }

    try {
      setPagosLoading(true);
      await registrarPago({ 
        credito_id: Number(idActivo), 
        monto_pago: monto, 
        notas: notasPago 
      });
      
      setNuevoPago("");
      setNotasPago("");
      
      const actualizados = await getPagosByCredito(Number(idActivo));
      setPagos(actualizados);
      
      if (onSaved) await onSaved(); 
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al registrar el abono";
      setPagoError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setPagosLoading(false);
    }
  };

  const submitForm: SubmitHandler<FormData> = async (data) => {
    const payload: CreateCreditoPayload = {
      numero_factura: data.numero_factura?.trim(),
      cliente_id: Number(data.cliente_id),
      saldo_pendiente: saldoPendiente,
      fecha_inicial: data.fecha_inicial,
      fecha_final: data.fecha_final || undefined,
      estado: data.estado,
      detalles: detalles,
    };
    await onSubmit(payload);
    await onSaved();
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      <FormInput
        label="Número de factura"
        name="numero_factura"
        value={values.numero_factura}
        onChange={(e) => setValue("numero_factura", e.target.value)}
        placeholder="FAC-001"
      />

      <FormInput
        label="ID Cliente"
        name="cliente_id"
        type="number"
        value={values.cliente_id}
        onChange={(e) => setValue("cliente_id", Number(e.target.value))}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Fecha inicial" name="fecha_inicial" type="date" value={values.fecha_inicial} onChange={(e) => setValue("fecha_inicial", e.target.value)} required />
        <FormInput label="Fecha final" name="fecha_final" type="date" value={values.fecha_final} onChange={(e) => setValue("fecha_final", e.target.value)} />
      </div>

      <FormSelect
        label="Estado"
        name="estado"
        value={values.estado}
        onChange={(e) => setValue("estado", e.target.value as any)}
        options={[
          { value: "PENDIENTE", label: "Pendiente" },
          { value: "PAGADO", label: "Pagado" },
        ]}
      />

      {/* --- SECCIÓN DE ABONOS --- */}
      {initialData?.id ? (
        <div className="mb-4 p-3 border-2 border-green-100 rounded-lg bg-green-50/20">
          <h4 className="font-bold text-green-800 mb-2">Pagos del Crédito</h4>
          <div className="flex flex-col md:flex-row gap-2 items-end mb-2">
            <div className="flex-1">
              <input
                type="number"
                className="form-input w-full border-green-300"
                placeholder="Monto"
                value={nuevoPago}
                onChange={e => setNuevoPago(e.target.value)}
              />
            </div>
            <div className="flex-[2]">
              <input
                type="text"
                className="form-input w-full border-green-300"
                placeholder="Notas (opcional)"
                value={notasPago}
                onChange={e => setNotasPago(e.target.value)}
              />
            </div>
            <button 
              type="button" 
              onClick={handleRegistrarAbono}
              className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 font-bold transition-colors disabled:opacity-50"
              disabled={pagosLoading}
            >
              {pagosLoading ? "..." : "Abonar"}
            </button>
          </div>
          {pagoError && <p className="text-red-600 text-xs font-bold mb-2">{pagoError}</p>}

          <div className="overflow-x-auto max-h-40 overflow-y-auto border bg-white rounded">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-2 py-1 text-left">Fecha</th>
                  <th className="px-2 py-1 text-left">Monto</th>
                </tr>
              </thead>
              <tbody>
                {pagos.length === 0 ? (
                  <tr><td colSpan={2} className="text-center py-2 text-gray-400">Sin abonos registrados</td></tr>
                ) : (
                  pagos.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-2 py-1">{p.fecha_pago?.substring(0,10)}</td>
                      <td className="px-2 py-1 font-bold text-green-700">
                        {Number(p.monto_pago).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Estilo simple sin icono */
        <div className="mb-4 py-2 text-center">
          <p className="text-red-500 text-sm font-medium">
            Guarde el crédito para habilitar la sección de abonos
          </p>
        </div>
      )}

      {/* --- SECCIÓN DE PRODUCTOS --- */}
      <div className="mb-4 p-2 border rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-1">Producto</label>
            <ProductAutocomplete onSelect={(item: any) => setSelectedProduct(item)} placeholder="Buscar..." />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Cant.</label>
            <input type="number" className="form-input w-full" value={cantidadTmp} onChange={e => setCantidadTmp(Number(e.target.value))} />
          </div>
          <button
            type="button"
            className="bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50 font-bold"
            disabled={!selectedProduct}
            onClick={() => {
              if (!selectedProduct) return;
              if (detalles.some(d => d.producto_id === selectedProduct.id)) return;
              const nuevo: ProductoDetalle = {
                producto_id: selectedProduct.id,
                producto_nombre: selectedProduct.nombre,
                cantidad: cantidadTmp,
                precio_unitario: selectedProduct.precio || 0,
                subtotal: (selectedProduct.precio || 0) * cantidadTmp,
              };
              setDetalles([...detalles, nuevo]);
              setSelectedProduct(null);
            }}
          >+ Agregar</button>
        </div>
        
        {detalles.length > 0 && (
          <div className="mt-3 overflow-x-auto border rounded bg-white">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-1 text-left">Producto</th>
                  <th className="p-1 text-left">Cant.</th>
                  <th className="p-1 text-left">Precio</th>
                  <th className="p-1 text-left">Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((d, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-1">{d.producto_nombre}</td>
                    <td className="p-1">{d.cantidad}</td>
                    <td className="p-1">{d.precio_unitario}</td>
                    <td className="p-1">{d.subtotal}</td>
                    <td className="p-1 text-center">
                      <button type="button" className="text-red-500 font-bold" onClick={() => setDetalles(detalles.filter((_, i) => i !== idx))}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FormInput
        label="Saldo pendiente"
        name="saldo_pendiente"
        value={saldoPendiente.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
        readOnly
        disabled
      />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Crédito"}
        </Button>
      </div>

      {formError && <p className="text-red-600 text-sm text-center font-bold">{formError}</p>}
    </form>
  );
}
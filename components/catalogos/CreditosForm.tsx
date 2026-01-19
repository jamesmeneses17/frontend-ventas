"use client";

import React, { useEffect, useState } from "react";
import { getPagosByCredito, registrarPago } from "../services/pagosCreditoService";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import ProductAutocomplete from "../common/form/ProductAutocomplete";
import Button from "../ui/button";
import { CreateCreditoPayload } from "../services/creditosService";
import ClienteAutocomplete from "../common/form/ClienteAutocomplete";

/* ==========================================================
   TIPOS Y AYUDANTES
   ========================================================== */
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

type CreditoWithId = Partial<CreateCreditoPayload> & {
  id?: number;
  cliente?: { nombre: string };
};

// Función para formatear visualmente mientras el usuario escribe
const formatInputAsCurrency = (value: string) => {
  const number = value.replace(/\D/g, "");
  if (!number) return "";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(number));
};

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
  const isEditing = !!initialData?.id;

  const {
    handleSubmit,
    setValue,
    watch,
    register,
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

  const [detalles, setDetalles] = useState<ProductoDetalle[]>(
    (initialData?.detalles || []).map((d: any) => ({
      producto_id: d.producto_id,
      producto_nombre: d.producto_nombre || d.producto?.nombre || "",
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      subtotal: d.subtotal,
    }))
  );

  const [pagos, setPagos] = useState<any[]>([]);
  const [nuevoPago, setNuevoPago] = useState(""); // Valor numérico puro
  const [notasPago, setNotasPago] = useState("");
  const [pagosLoading, setPagosLoading] = useState(false);
  const [pagoError, setPagoError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [cantidadTmp, setCantidadTmp] = useState(1);

  const totalProductos = detalles.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0);
  const totalPagos = pagos.reduce((sum, p) => sum + (Number(p.monto_pago) || 0), 0);
  const saldoPendiente = Math.max(totalProductos - totalPagos, 0);

  useEffect(() => {
    if (initialData?.id) {
      setPagosLoading(true);
      getPagosByCredito(initialData.id)
        .then(setPagos)
        .catch(() => setPagos([]))
        .finally(() => setPagosLoading(false));
    }
  }, [initialData]);

  const handleRegistrarAbono = async () => {
    setPagoError(null);
    if (!initialData?.id) return;

    const monto = Number(nuevoPago);
    if (!nuevoPago || isNaN(monto) || monto <= 0) {
      setPagoError("Ingrese un monto válido.");
      return;
    }

    try {
      setPagosLoading(true);
      await registrarPago({
        credito_id: Number(initialData.id),
        monto_pago: monto,
        notas: notasPago,
      });

      setNuevoPago("");
      setNotasPago("");
      const actualizados = await getPagosByCredito(Number(initialData.id));
      setPagos(actualizados);
      if (onSaved) await onSaved();
    } catch (err: any) {
      setPagoError("Error al registrar el abono");
    } finally {
      setPagosLoading(false);
    }
  };

  const submitForm: SubmitHandler<FormData> = async (data) => {
    const payload: CreateCreditoPayload = {
      ...data,
      cliente_id: Number(data.cliente_id),
      saldo_pendiente: saldoPendiente,
      detalles: detalles,
    };
    await onSubmit(payload);
    await onSaved();
  };

  return (
    <div className="space-y-6">
      {isEditing ? (
        /* ==========================================================
           MODO ACTUALIZAR: FOCO EN ABONOS
           ========================================================== */
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase">Cliente</p>
              <p className="text-lg font-bold text-blue-900">{initialData?.cliente?.nombre || 'Héctor Rojas'}</p>
              <p className="text-sm text-blue-700">Factura: {initialData?.numero_factura || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600 font-bold uppercase">Saldo Actual</p>
              <p className="text-2xl font-black text-blue-700">
                {saldoPendiente.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
              </p>
            </div>
          </div>

          <div className="p-4 border-2 border-green-100 rounded-xl bg-green-50/30">
            <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2 text-base">
              Registrar Nuevo Abono
            </h4>
            <div className="flex flex-col md:flex-row gap-3 items-start">
              <div className="w-full md:w-1/3">
                {/* Input con máscara de miles integrada */}
                <input
                  type="text"
                  className="form-input w-full border-green-300 focus:ring-green-500 rounded-lg font-bold text-lg text-green-700"
                  placeholder="$ 0"
                  value={nuevoPago ? formatInputAsCurrency(nuevoPago) : ""}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, "");
                    setNuevoPago(rawValue);
                  }}
                />
              </div>
              <div className="w-full md:flex-1">
                <input
                  type="text"
                  className="form-input w-full border-green-300 focus:ring-green-500 rounded-lg py-2.5"
                  placeholder="Notas o concepto del pago"
                  value={notasPago}
                  onChange={(e) => setNotasPago(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleRegistrarAbono}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2.5 font-bold transition-all disabled:opacity-50 shadow-md"
                disabled={pagosLoading}
              >
                {pagosLoading ? "Procesando..." : "Confirmar Abono"}
              </button>
            </div>
            {pagoError && <p className="text-red-600 text-xs font-bold mt-2">{pagoError}</p>}
          </div>

          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <span className="text-sm font-bold text-gray-700">Historial de Pagos</span>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Monto</th>
                  <th className="px-4 py-2 text-left">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagos.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-6 text-gray-400 italic">No hay abonos registrados aún</td></tr>
                ) : (
                  pagos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{p.fecha_pago?.substring(0, 10)}</td>
                      <td className="px-4 py-2 font-bold text-green-700">
                        {Number(p.monto_pago).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
                      </td>
                      <td className="px-4 py-2 text-gray-500 text-xs italic">{p.notas || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="button" onClick={onCancel} className="bg-gray-500 px-8">Cerrar</Button>
          </div>
        </div>
      ) : (
        /* ==========================================================
           MODO CREACIÓN: FORMULARIO COMPLETO
           ========================================================== */
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <FormInput
            label="Número de factura"
            name="numero_factura"
            value={values.numero_factura}
            onChange={(e) => setValue("numero_factura", e.target.value)}
            placeholder="FAC-001"
          />

          <div className="w-full">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Cliente (Cédula o Nombre) <span className="text-red-500">*</span>
            </label>
            <ClienteAutocomplete
              onSelect={(cliente) => setValue("cliente_id", cliente.id)}
              initialValue=""
              placeholder="Escriba nombre o documento..."
            />
            <input type="hidden" value={watch("cliente_id") || ""} />
          </div>

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
              label="Fecha final (opcional)"
              name="fecha_final"
              type="date"
              value={values.fecha_final}
              onChange={(e) => setValue("fecha_final", e.target.value)}
            />
          </div>

          <div className="mb-4 p-4 border rounded-xl bg-gray-50">
            <p className="text-sm font-bold text-gray-700 mb-3">Detalle de Productos</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div className="md:col-span-2">
                <ProductAutocomplete
                  key={detalles.length}
                  onSelect={(item: any) => setSelectedProduct(item)}
                  placeholder="Buscar producto..."
                />
              </div>
              <div>
                <input type="number" className="form-input w-full" value={cantidadTmp} onChange={(e) => setCantidadTmp(Number(e.target.value))} />
              </div>
              <button
                type="button"
                className="bg-blue-600 text-white rounded-lg px-3 py-2 font-bold hover:bg-blue-700"
                disabled={!selectedProduct}
                onClick={() => {
                  if (!selectedProduct) return;

                  // Usa el precio con descuento si existe (calculado en backend), si no, usa el precio normal
                  const precioFinal = selectedProduct.precio_con_descuento || selectedProduct.precio || 0;

                  setDetalles([...detalles, {
                    producto_id: selectedProduct.id,
                    producto_nombre: selectedProduct.nombre,
                    cantidad: cantidadTmp,
                    precio_unitario: precioFinal,
                    subtotal: precioFinal * cantidadTmp,
                  }]);
                  setSelectedProduct(null);
                }}
              > + Agregar </button>
            </div>

            {detalles.length > 0 && (
              <div className="mt-3 border rounded-lg bg-white overflow-hidden">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Producto</th>
                      <th className="p-2 text-left">Cant.</th>
                      <th className="p-2 text-left">Subtotal</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalles.map((d, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{d.producto_nombre}</td>
                        <td className="p-2">{d.cantidad}</td>
                        <td className="p-2 font-bold text-gray-800">{d.subtotal.toLocaleString()}</td>
                        <td className="p-2 text-center">
                          <button type="button" className="text-red-500 hover:scale-110" onClick={() => setDetalles(detalles.filter((_, i) => i !== idx))}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-blue-900 p-5 rounded-xl text-white flex justify-between items-center shadow-inner">
            <span className="font-bold uppercase tracking-wider text-blue-200">Total Deuda Inicial:</span>
            <span className="text-2xl font-black">{totalProductos.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</span>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-4">
            <Button type="button" onClick={onCancel} className="bg-gray-100 text-gray-600 hover:bg-gray-200">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting} className="px-10">
              {isSubmitting ? "Procesando..." : "Crear Crédito Nuevo"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
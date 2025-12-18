"use client";

import React, { useEffect } from "react";
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

// Extiende el tipo para permitir id opcional en initialData
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

      detalles: initialData?.detalles || [],
    },
  });

  const values = watch();

  // Manejo de productos seleccionados
  // Adaptar detalles para que siempre tengan producto_nombre (si viene de la API sin esa propiedad)
  const detallesIniciales: ProductoDetalle[] = (initialData?.detalles || []).map((d: any) => ({
    producto_id: d.producto_id,
    producto_nombre: d.producto_nombre || d.producto?.nombre || "",
    cantidad: d.cantidad,
    precio_unitario: d.precio_unitario,
    subtotal: d.subtotal,
  }));
  const [detalles, setDetalles] = React.useState<ProductoDetalle[]>(detallesIniciales);
  // Pagos
  const [pagos, setPagos] = React.useState<any[]>([]);
  const [nuevoPago, setNuevoPago] = React.useState("");
  const [notasPago, setNotasPago] = React.useState("");
  const [pagosLoading, setPagosLoading] = React.useState(false);
  const [pagoError, setPagoError] = React.useState<string | null>(null);

  // Calcular total productos y total pagos usando SIEMPRE el estado local detalles
  const totalProductos = detalles.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0);
  const totalPagos = pagos.reduce((sum, p) => sum + (Number(p.monto_pago) || 0), 0);
  const saldoPendiente = Math.max(totalProductos - totalPagos, 0);

  // Cargar historial de pagos si estamos editando
  useEffect(() => {
    if (initialData && initialData.id) {
      setPagosLoading(true);
      getPagosByCredito(initialData.id)
        .then(setPagos)
        .catch(() => setPagos([]))
        .finally(() => setPagosLoading(false));
    }
  }, [initialData]);
  // Para autocompletar
  const [selectedProduct, setSelectedProduct] = React.useState<any | null>(null);
  const [cantidadTmp, setCantidadTmp] = React.useState(1);

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
      {/* Sección para agregar productos al crédito */}
            {/* Registro e historial de pagos */}
            <div className="mb-4 p-2 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Pagos del Crédito</h4>
              {/* Formulario para registrar un nuevo pago */}
              <form
                className="flex flex-col md:flex-row gap-2 items-end mb-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPagoError(null);
                  // Validar que el crédito exista
                  if (!initialData?.id) {
                    setPagoError("Primero debes guardar el crédito antes de registrar un abono.");
                    return;
                  }
                  // Validar monto
                  const monto = Number(nuevoPago);
                  if (nuevoPago === "" || isNaN(monto) || monto <= 0) {
                    setPagoError("Ingresa un monto válido mayor a 0.");
                    return;
                  }
                  try {
                    await registrarPago({ credito_id: initialData.id, monto_pago: monto, notas: notasPago });
                    setNuevoPago("");
                    setNotasPago("");
                    // Recargar pagos
                    setPagosLoading(true);
                    const pagosActualizados = await getPagosByCredito(initialData.id);
                    setPagos(pagosActualizados);
                    setPagosLoading(false);
                  } catch (err: any) {
                    setPagoError("Error registrando pago");
                    setPagosLoading(false);
                  }
                }}
              >
                <input
                  type="number"
                  min={1}
                  className="form-input w-32"
                  placeholder="Monto del pago"
                  value={nuevoPago}
                  onChange={e => setNuevoPago(e.target.value)}
                />
                <input
                  type="text"
                  className="form-input w-48"
                  placeholder="Notas (opcional)"
                  value={notasPago}
                  onChange={e => setNotasPago(e.target.value)}
                />
                <button type="submit" className="bg-green-600 text-white rounded px-3 py-2 ml-2">Registrar Pago</button>
                {pagoError && <span className="text-red-600 text-xs ml-2">{pagoError}</span>}
              </form>
              {/* Historial de pagos */}
              {pagosLoading ? (
                <div className="text-xs text-gray-500">Cargando pagos...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1">Fecha</th>
                        <th className="px-2 py-1">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.length === 0 && (
                        <tr><td colSpan={2} className="text-center text-gray-400 py-2">Sin pagos registrados</td></tr>
                      )}
                      {pagos.map((p) => (
                        <tr key={p.id}>
                          <td className="px-2 py-1">{p.fecha_pago?.substring(0,10) ?? p.fecha_pago}</td>
                          <td className="px-2 py-1 font-semibold">{Number(p.monto_pago).toLocaleString("es-CO", { style: "currency", currency: "COP" })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
      <div className="mb-4 p-2 border rounded-lg bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <ProductAutocomplete
              placeholder="Buscar producto..."
              maxResults={8}
              onSelect={(item: any) => {
                setSelectedProduct(item);
                setCantidadTmp(1);
              }}
              disabled={false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input
              type="number"
              min={1}
              className="form-input w-full"
              value={cantidadTmp}
              onChange={e => setCantidadTmp(Number(e.target.value))}
              disabled={!selectedProduct}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio unitario</label>
            <input
              type="number"
              className="form-input w-full"
              value={selectedProduct?.precio || 0}
              disabled
            />
          </div>
          <button
            type="button"
            className="bg-blue-600 text-white rounded px-3 py-2 mt-2 md:mt-0 disabled:opacity-50"
            disabled={!selectedProduct}
            onClick={() => {
              if (!selectedProduct) return;
              // Evitar duplicados
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
              setCantidadTmp(1);
            }}
          >Agregar</button>
        </div>
        {/* Tabla de productos agregados */}
        {detalles.length > 0 && (
          <div className="mt-4">
            <table className="min-w-full text-xs border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1">Producto</th>
                  <th className="px-2 py-1">Cantidad</th>
                  <th className="px-2 py-1">Precio unitario</th>
                  <th className="px-2 py-1">Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((d, idx) => (
                  <tr key={d.producto_id}>
                    <td className="px-2 py-1">{d.producto_nombre}</td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        min={1}
                        className="w-16 border rounded"
                        value={d.cantidad}
                        onChange={e => {
                          const nueva = detalles.map((item, i) => i === idx ? { ...item, cantidad: Number(e.target.value), subtotal: item.precio_unitario * Number(e.target.value) } : item);
                          setDetalles(nueva);
                        }}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        className="w-20 border rounded"
                        value={d.precio_unitario}
                        onChange={e => {
                          const nueva = detalles.map((item, i) => i === idx ? { ...item, precio_unitario: Number(e.target.value), subtotal: Number(e.target.value) * item.cantidad } : item);
                          setDetalles(nueva);
                        }}
                      />
                    </td>
                    <td className="px-2 py-1">{d.subtotal}</td>
                    <td>
                      <button type="button" className="text-red-600" onClick={() => setDetalles(detalles.filter((_, i) => i !== idx))}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total */}
      <FormInput
        label="Saldo pendiente"
        name="saldo_pendiente"
        value={saldoPendiente.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
        readOnly
        disabled
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

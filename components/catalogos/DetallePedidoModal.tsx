"use client";

import React, { useState } from "react";
import { ShieldCheck, Package, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import Button from "../ui/button";
import { updateEstadoPedido } from "../services/pedidosOnlineService";

interface Props {
  pedido: any;
  onClose: () => void;
}

export default function DetallePedidoModal({ pedido, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Código copiado: " + text);
  };

  /**
   * Cambia el estado del pedido a CONFIRMADO.
   * Esto hace que desaparezca de la campana de pendientes.
   */
  const handleConfirmarPedido = async () => {
    if (!window.confirm("¿Confirmas que el HASH coincide y el pago es real?")) return;
    
    setLoading(true);
    try {
      await updateEstadoPedido(pedido.id, 'CONFIRMADO');
      alert("✅ Pedido validado correctamente.");
      onClose();
      window.location.reload(); // Recarga para limpiar la campana y la tabla
    } catch (err) {
      alert("Error al actualizar el estado del pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* --- SECCIÓN DE SEGURIDAD (HASH) --- */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-4">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-emerald-800 font-bold text-sm uppercase tracking-wider">
            Código de Verificación (HASH)
          </h4>
          <p className="text-2xl font-mono font-black text-emerald-700 mt-1">
            {pedido.hash_verificacion}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            Compare este código con el recibido en WhatsApp. Si no coinciden, los datos fueron manipulados.
          </p>
        </div>
      </div>

      {/* --- INFORMACIÓN GENERAL --- */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg border">
          <span className="text-gray-500 block text-xs">Número de Pedido</span>
          <span className="font-bold text-gray-800">{pedido.codigo_pedido}</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border">
          <span className="text-gray-500 block text-xs">Fecha del Pedido</span>
          <span className="font-bold text-gray-800">
            {new Date(pedido.fecha).toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      {/* --- LISTADO DE PRODUCTOS --- */}
      <div>
        <h4 className="flex items-center gap-2 font-bold text-gray-700 mb-3 text-sm">
          <Package className="w-4 h-4" /> Detalle de Productos
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Producto (ID)</th>
                <th className="px-4 py-2 text-center">Cant.</th>
                <th className="px-4 py-2 text-right">Unitario</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {pedido.detalles?.map((det: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ID: {det.producto_id}
                  </td>
                  <td className="px-4 py-3 text-center">{det.cantidad}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(det.precio_unitario)}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatCurrency(det.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold border-t">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-gray-600 uppercase">Total a Validar</td>
                <td className="px-4 py-3 text-right text-indigo-700 text-base">
                  {formatCurrency(pedido.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[10px] italic">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        Una vez verificado el HASH y el pago, presione &quot;Validación Exitosa&quot; para despachar de la campana.
      </div>

      {/* --- ACCIONES --- */}
      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t">
        <Button onClick={onClose} variant="secondary" disabled={loading}>
          Cerrar
        </Button>
        
        <Button 
          onClick={() => copyToClipboard(pedido.codigo_pedido)}
          className="bg-gray-800 text-white hover:bg-black"
          disabled={loading}
        >
          Copiar Código
        </Button>

        {/* Botón de Validación: Solo aparece si el pedido está PENDIENTE */}
        {pedido.estado === 'PENDIENTE' && (
          <Button 
            onClick={handleConfirmarPedido}
            className="bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Validación Exitosa
          </Button>
        )}
      </div>
    </div>
  );
}
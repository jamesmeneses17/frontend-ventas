"use client";

import React from "react";
import { ShieldCheck, Package, AlertCircle } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import Button from "../ui/button";

interface Props {
  pedido: any;
  onClose: () => void;
}

export default function DetallePedidoModal({ pedido, onClose }: Props) {
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Código copiado: " + text);
  };

  return (
    <div className="space-y-6">
      {/* --- SECCIÓN DE SEGURIDAD (HASH) --- */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-4">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
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
                <td colSpan={3} className="px-4 py-3 text-right text-gray-600">TOTAL A VALIDAR</td>
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
        Una vez verificado el HASH y el pago, registre la venta manualmente en la sección de Ventas.
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button onClick={onClose}>
          Cerrar
        </Button>
        <Button 
          onClick={() => copyToClipboard(pedido.codigo_pedido)}
          className=" bg-indigo-600  text-white"
        >
          Copiar Código para Venta
        </Button>
      </div>
    </div>
  );
}
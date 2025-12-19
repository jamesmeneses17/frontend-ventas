"use client";

import React, { useState } from "react";
import { formatCurrency } from "../../utils/formatters";
import { Send, Loader2 } from "lucide-react";
import { registrarPedidoOnline } from "../services/pedidosOnlineService";

interface WhatsAppButtonProps {
  items: any[];
  finalTotal: number;
  currency: string;
}

const BUSINESS_PHONE = "573206197545";

export const WhatsAppOrderButton: React.FC<WhatsAppButtonProps> = ({
  items,
  finalTotal,
  currency,
}) => {
  const [loading, setLoading] = useState(false);

  const handleOrderCapture = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      // 1. REGISTRO EN BASE DE DATOS (Mantiene la integridad en el Panel)
      const payload = {
        total: finalTotal,
        detalles: items.map(item => ({
          producto_id: item.id,
          cantidad: item.quantity,
          precio_unitario: item.precio * (1 - (item.descuento || 0) / 100)
        }))
      };

      const pedidoOficial = await registrarPedidoOnline(payload);

      // 2. GENERAR MENSAJE PARA EL CLIENTE
      const mensaje = generateSecureMessage(pedidoOficial);
      
      // 3. ABRIR WHATSAPP
      const whatsappLink = `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(mensaje)}`;
      window.open(whatsappLink, "_blank");

    } catch (error) {
      console.error("Error registrando pedido:", error);
      alert("No se pudo procesar el pedido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const generateSecureMessage = (pedido: any) => {
    const now = new Date();
    
    // Formato de productos: Nombre + Código + Cantidad + Precio Unitario
    const lineItems = items.map((item, index) => {
        const finalUnitPrice = item.precio * (1 - (item.descuento || 0) / 100);
        const codePart = item.codigo ? `[Ref: ${item.codigo}]` : '';
        
        return `*${index + 1}) ${item.nombre}* ${codePart}
   - Cantidad: ${item.quantity}
   - Precio Unit: ${formatCurrency(finalUnitPrice, currency)}`;
    }).join("\n\n");

    return `
*--- NUEVO PEDIDO ONLINE - DISEM ---*

*Pedido:* ${pedido.codigo_pedido}
*Fecha:* ${now.toLocaleString()}

*DETALLE DE PRODUCTOS:*
${lineItems}

---------------------------
*TOTAL ESTIMADO:* ${formatCurrency(pedido.total, currency)}

*CÓDIGO DE VERIFICACIÓN: ${pedido.hash_verificacion}*
_(Verifique que este código coincida en su entrega)_

Quedo a la espera de la confirmación de disponibilidad.`.trim();
  };

  return (
    <button
      onClick={handleOrderCapture}
      disabled={loading || items.length === 0}
      className="w-full flex items-center justify-center px-6 py-3 rounded-xl shadow-lg text-lg font-bold text-white transition duration-300 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
      ) : (
        <Send className="w-6 h-6 mr-3" />
      )}
      {loading ? "Procesando..." : "Confirmar y Enviar Pedido"}
    </button>
  );
};
"use client";

import React, { useState } from "react";
import { formatCurrency } from "../../utils/formatters";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleOrderCapture = async () => {
    if (items.length === 0) return;
    setLoading(true);

    try {
      // 1. REGISTRO OFICIAL EN BASE DE DATOS
      const payload = {
        total: finalTotal,
        detalles: items.map(item => ({
          producto_id: item.id,
          cantidad: item.quantity,
          precio_unitario: item.precio * (1 - item.descuento / 100)
        }))
      };

      // Llamamos al backend para que genere el Código y el Hash
      const pedidoOficial = await registrarPedidoOnline(payload);

      // 2. GENERAR MENSAJE CON DATOS INALTERABLES DEL BACKEND
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
    const lineItems = items.map((item, index) => {
        const finalPrice = item.precio * (1 - item.descuento / 100);
        return `  ${index + 1}) ${item.nombre}\n     - Cantidad: ${item.quantity}\n     - P. Unitario: ${formatCurrency(finalPrice, currency)}`;
    }).join("\n");

    const clientInfo = user ? `Cliente: ${user.nombre || user.correo}\nID Cliente: ${user.id}\n` : "";

    return `
*--- NUEVO PEDIDO ONLINE - DISEM ---*

Pedido: ${pedido.codigo_pedido}
Fecha: ${now.toLocaleString()}
${clientInfo}
*DETALLE DE PRODUCTOS:*
${lineItems}

---------------------------
*TOTAL A PAGAR:* ${formatCurrency(pedido.total, currency)}

🔐 *CÓDIGO DE VERIFICACIÓN:* ${pedido.hash_verificacion}
_(Este código garantiza que los precios no han sido modificados)_

Por favor confirmar disponibilidad y forma de pago.`.trim();
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
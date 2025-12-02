"use client";

import React from "react";
import { formatCurrency } from "../../utils/formatters";
import { Send } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface WhatsAppButtonProps {
  items: {
    id?: number;
    codigo?: string;
    nombre: string;
    quantity: number;
    precio: number;
    descuento: number;
  }[];
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
  // Generar mensaje profesional para WhatsApp
  const generateMessage = () => {
    if (items.length === 0) return "Hola, quiero consultar por un producto.";

    const now = new Date();
    const when = now.toLocaleString();

    // Generador de número de pedido ÚNICO y CORTO (VTA-YYMMDD-XXXX)
    const generateOrderNumber = () => {
      const pad = (n: number) => String(n).padStart(2, "0");
      // Usamos slice(2) para obtener solo los últimos dos dígitos del año (ej: 25)
      const y = String(now.getFullYear()).slice(2); 
      const m = pad(now.getMonth() + 1);
      const d = pad(now.getDate());
      // 4 dígitos aleatorios para hacerlo único en el instante
      const rnd = Math.floor(Math.random() * 9000) + 1000; 
      return `VTA-${y}${m}${d}-${rnd}`;
    };

    const orderNumber = generateOrderNumber();

    const lineItems = items
      .map((item, index) => {
        const finalPrice = item.precio * (1 - item.descuento / 100);
        const subtotal = finalPrice * item.quantity;

        // Incluimos el código justo después del nombre
        const codePart = item.codigo ? ` (Código: ${item.codigo})` : '';

        return `
  ${index + 1}) ${item.nombre}${codePart}
     - Cantidad: ${item.quantity}
     - P. Unitario: ${formatCurrency(finalPrice, currency)}
     - Subtotal: ${formatCurrency(subtotal, currency)}`;
      })
      .join("\n");

      // Información del cliente si está autenticado, con mejor formato
      const clientInfo = user 
        ? `Cliente: ${user.nombre ?? user.correo}\nID Cliente: ${user.id}\n` 
        : "";

      return `*--- NUEVO PEDIDO ONLINE - DISEM ---*

    Pedido: ${orderNumber}
    Fecha: ${when}
    ${clientInfo ? `\n${clientInfo}\n` : ""}
    *DETALLE DE PRODUCTOS:*
    ${lineItems}

    ---------------------------

    *TOTAL A PAGAR:* ${formatCurrency(finalTotal, currency)}

    Por favor confirmar disponibilidad, tiempos de entrega y forma de pago.
    Gracias por su atención.`.trim();
  };

  const message = encodeURIComponent(generateMessage());
  const whatsappLink = `https://wa.me/${BUSINESS_PHONE}?text=${message}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition duration-300 bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
    >
      <Send className="w-6 h-6 mr-3" />
      Enviar Pedido por WhatsApp
    </a>
  );
};
import React from "react";
import { formatCurrency } from "../../utils/formatters";
import { Send } from "lucide-react";

interface WhatsAppButtonProps {
  items: {
    nombre: string;
    quantity: number;
    precio: number;
    descuento: number;
  }[];
  finalTotal: number;
  currency: string;
}

const BUSINESS_PHONE = "573506324968";

export const WhatsAppOrderButton: React.FC<WhatsAppButtonProps> = ({
  items,
  finalTotal,
  currency,
}) => {
  // Generar mensaje profesional para WhatsApp
  const generateMessage = () => {
    if (items.length === 0) return "Hola, quiero consultar por un producto.";

    const lineItems = items
      .map((item, index) => {
        const finalPrice = item.precio * (1 - item.descuento / 100);
        const subtotal = finalPrice * item.quantity;

        return `
*${index + 1}) Producto:* ${item.nombre}
- Cantidad: ${item.quantity}
- P. Unitario: ${formatCurrency(finalPrice, currency)}
- Subtotal: ${formatCurrency(subtotal, currency)}`;
      })
      .join("\n");

    return `
*--- NUEVO PEDIDO ONLINE ---*

*DETALLE DE PRODUCTOS:*
${lineItems}
---------------------------

*TOTAL A PAGAR:* ${formatCurrency(finalTotal, currency)}

_Por favor, confirmar disponibilidad y tiempos de entrega._
    `.trim();
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

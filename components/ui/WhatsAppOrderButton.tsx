import React from 'react';
import { Send, Smartphone } from 'lucide-react';

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

// Número de teléfono de tu negocio (incluye código de país, sin '+' ni guiones)
const BUSINESS_PHONE = '573506324968'; 

export const WhatsAppOrderButton: React.FC<WhatsAppButtonProps> = ({ items, finalTotal, currency }) => {
    
    // 1. Generar el mensaje de texto del pedido
    const generateMessage = () => {
        if (items.length === 0) return "Hola, me gustaría hacer una consulta.";
        
        const lineItems = items.map(item => {
            const finalPrice = item.precio * (1 - (item.descuento / 100));
            return `* ${item.nombre} (x${item.quantity}) - ${currency} ${(finalPrice * item.quantity).toFixed(2)}`;
        }).join('\n');
        
        return `
¡Hola! Quiero realizar el siguiente pedido:

---
${lineItems}
---
Total a pagar: ${currency} ${finalTotal.toFixed(2)}

Por favor, ayúdame a finalizar la compra.
        `.trim();
    };

    // 2. Codificar el mensaje para la URL
    const message = encodeURIComponent(generateMessage());
    
    // 3. Construir el enlace de WhatsApp
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
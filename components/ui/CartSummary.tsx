import React, { useMemo } from 'react';
import { useCart } from './../hooks/CartContext'; // Asegúrate de la ruta correcta
import { WhatsAppOrderButton } from './../../components/ui/WhatsAppOrderButton'; // Creamos este componente aparte
import { formatCurrency } from '../../utils/formatters';

export const CartSummary: React.FC = () => {
    const { items, subtotal, totalAmount } = useCart();
    
    // Cálculo de Ahorro/Descuento (Para el resumen)
    const totalDiscount = useMemo(() => {
        return items.reduce((acc, item) => {
            const originalPrice = item.precio * item.quantity;
            const finalPrice = item.precio * (1 - (item.descuento / 100)) * item.quantity;
            return acc + (originalPrice - finalPrice);
        }, 0);
    }, [items]);
    
    // Total final real (Subtotal con descuentos). No se aplica cargo de envío
    const finalTotal = totalAmount;
    const currency = items.length > 0 ? items[0].moneda : 'COP';

    return (
        <div className="bg-gray-50 p-6 rounded-xl shadow-lg lg:sticky lg:top-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Resumen del Pedido</h2>
            
            <dl className="space-y-3 text-sm">
                
                {/* 1. Subtotal (Precio sin descuento) */}
                <div className="flex justify-between">
                    <dt className="text-gray-600">Subtotal de Productos</dt>
                    <dd className="font-medium text-gray-900">{formatCurrency(subtotal, currency)}</dd>
                </div>

                {/* 2. Descuento Aplicado */}
                <div className="flex justify-between">
                    <dt className="text-red-500">Descuento aplicado</dt>
                    <dd className="font-semibold text-red-500">- {formatCurrency(totalDiscount, currency)}</dd>
                </div>
                
                {/* Nota: se removió el cargo de envío */}
                
                {/* 4. Separador y Total */}
                <div className="flex justify-between border-t border-gray-300 pt-4 text-lg font-bold">
                    <dt className="text-gray-900">Total a Pagar</dt>
                    <dd className="text-indigo-600">{formatCurrency(finalTotal, currency)}</dd>
                </div>
                
            </dl>
            
            <div className="mt-6">
                <WhatsAppOrderButton items={items} finalTotal={finalTotal} currency={currency} />
            </div>
            
        </div>
    );
};
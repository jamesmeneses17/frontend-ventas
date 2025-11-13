"use client";

import React, { useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import PublicLayout from '../../../components/layout/PublicLayout';

import { CartSummary } from '../../../components/ui/CartSummary';
import { CartItem } from '../../../components/ui/CartItem';
import { useCart } from '../../../components/hooks/CartContext';

// Contenido principal de la página del carrito. Depende de que PublicLayout
// envuelva la aplicación con <CartProvider> (ya lo hace en components/layout/PublicLayout.tsx)
const CartContent = () => {
    const { items } = useCart();

    useEffect(() => {
        console.log('[CartPage] items', items);
    }, [items]);

    if (items.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-lg shadow-md">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700">Tu carrito está vacío.</h2>
                <p className="mt-2 text-gray-500">¡Explora nuestros productos y agrega lo que necesites!</p>
                <a href="/users/productos" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
                    Volver a Productos
                </a>
            </div>
        );
    }

    return (
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            
            {/* Columna 1 y 2: Lista de Productos (2/3 del ancho) */}
            <div className="lg:col-span-2 space-y-4 bg-white p-6 rounded-xl shadow-lg">
                <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4 mb-4 flex items-center">
                    <ShoppingCart className="w-8 h-8 mr-3 text-indigo-600" />
                    Tu Carrito de Compras ({items.length} artículos)
                </h1>
                {items.map(item => (
                    <CartItem key={item.id} item={item} />
                ))}
            </div>

            {/* Columna 3: Resumen del Pedido (1/3 del ancho) */}
            <div className="lg:col-span-1 mt-8 lg:mt-0">
                <CartSummary />
            </div>

        </div>
    );
};

// Componente de página que usa PublicLayout (el layout ya incluye CartProvider)
export default function CartPage() {
    return (
        <PublicLayout>
            <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <CartContent />
                </div>
            </div>
        </PublicLayout>
    );
}
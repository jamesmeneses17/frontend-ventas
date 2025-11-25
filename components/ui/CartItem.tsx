import React from 'react';
import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from './../hooks/CartContext'; // Asegúrate de la ruta correcta
import { formatCurrency } from '../../utils/formatters';

interface CartItemProps {
    item: {
        id: number;
        nombre: string;
        precio: number;
        descuento: number;
        imageUrl: string;
        quantity: number;
        moneda: string;
        stock: number;
    };
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();
    
    // Calcula el precio final con descuento
    const finalPrice = item.precio * (1 - (item.descuento / 100));
    const lineTotal = finalPrice * item.quantity;

    return (
        <div className="flex items-center border-b py-4 space-x-4">
            
            {/* 1. Imagen */}
                        <div className="w-16 h-16 relative rounded-md overflow-hidden">
                            <Image
                                src={item.imageUrl}
                                alt={item.nombre}
                                fill
                                className="object-cover"
                            />
                        </div>

            {/* 2. Detalles del Producto */}
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{item.nombre}</h3>
                <p className="text-sm text-gray-500">
                    {item.descuento > 0 && <span className="line-through mr-2">{formatCurrency(item.precio, item.moneda)}</span>}
                    <span className="font-bold text-indigo-600">{formatCurrency(finalPrice, item.moneda)}</span>
                </p>
            </div>

            {/* 3. Control de Cantidad */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-24">
                <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* 4. Total de Línea */}
            <div className="w-20 text-right">
                <p className="text-md font-bold text-gray-900">{formatCurrency(lineTotal, item.moneda)}</p>
            </div>
            
            {/* 5. Botón de Eliminar */}
            <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 p-2 ml-2 transition"
                aria-label="Eliminar producto"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};
"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';

// 1. Tipos de Datos
interface CartProduct {
    id: number;
    nombre: string;
    precio: number;
    descuento: number;
    imageUrl: string;
    stock: number;
    quantity: number; // NUEVO: Cantidad en el carrito
    moneda: string;
}

interface CartContextType {
    items: CartProduct[];
    addToCart: (product: Omit<CartProduct, 'quantity'>, quantity: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    removeFromCart: (id: number) => void;
    totalAmount: number;
    subtotal: number;
    // Otros cálculos (ej: totalDescuento, costoEnvio)
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// 2. Hook para usar el carrito
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// 3. Proveedor del Contexto (Lógica del Carrito)
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<CartProduct[]>(() => {
        try {
            if (typeof window !== 'undefined') {
                const raw = localStorage.getItem('cart_v1');
                if (raw) {
                    const parsed = JSON.parse(raw) as CartProduct[];
                    return parsed;
                }
            }
        } catch (err) {
            console.warn('[CartProvider] error reading localStorage', err);
        }
        return [];
    });

    // Debug: indicar que el provider se montó
    useEffect(() => {
        console.log('[CartProvider] mounted');
    }, []);

    // Debug: loguear cambios en items
    useEffect(() => {
        console.log('[CartProvider] items changed', items);
    }, [items]);

    // Persistir en localStorage para que el carrito sobreviva a remounts/navegaciones
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('cart_v1', JSON.stringify(items));
            }
        } catch (err) {
            console.warn('[CartProvider] error saving to localStorage', err);
        }
    }, [items]);

    // Función para calcular el precio final con descuento
    const calculateFinalPrice = (price: number, discount: number) => {
        return price * (1 - (discount / 100));
    };
    
    // Añadir/Actualizar producto
    const addToCart = useCallback((product: Omit<CartProduct, 'quantity'>, quantity: number) => {
        console.log('[CartProvider] addToCart called', { product, quantity });
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                // Si existe, actualiza la cantidad (asegúrate de no exceder el stock)
                const newQuantity = Math.min(existingItem.quantity + quantity, existingItem.stock);
                if (newQuantity === existingItem.quantity) return prevItems; // No hay cambio si ya está al máximo
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: newQuantity } : item
                );
            } else {
                // Si es nuevo, agrégalo (asegúrate de que la cantidad no exceda el stock)
                const newQuantity = Math.min(quantity, product.stock);
                return [...prevItems, { ...product, quantity: newQuantity }];
            }
        });
    }, []);

    // Actualizar cantidad específica
    const updateQuantity = useCallback((id: number, quantity: number) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                const newQuantity = Math.min(Math.max(1, quantity), item.stock); // Min 1, Max Stock
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    }, []);

    // Eliminar producto
    const removeFromCart = useCallback((id: number) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    }, []);


    // CÁLCULOS
    const { subtotal, totalAmount } = useMemo(() => {
        let currentSubtotal = 0;
        let currentTotalAmount = 0;
        // Asume un costo de envío fijo o 'Gratis' para simplificar
        const costoEnvio = 0; 
        
        items.forEach(item => {
            const finalPrice = calculateFinalPrice(item.precio, item.descuento);
            const lineTotal = finalPrice * item.quantity;
            
            currentSubtotal += (item.precio * item.quantity); // Subtotal sin descuentos
            currentTotalAmount += lineTotal;
        });

        // Suma de total con descuentos + envío
        const total = currentTotalAmount + costoEnvio; 
        
        return { subtotal: currentSubtotal, totalAmount: total };
    }, [items]);


    const value = useMemo(() => ({
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        subtotal,
        totalAmount,
    }), [items, addToCart, updateQuantity, removeFromCart, subtotal, totalAmount]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
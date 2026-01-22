"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Bell, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '../../utils/formatters';
import { getPedidosOnline, PedidoOnline } from '../services/pedidosOnlineService';

export default function NotificationBell() {
    const [orders, setOrders] = useState<PedidoOnline[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const checkNewOrders = async () => {
        try {
            const res = await getPedidosOnline(1, 5);
            const pending = res.data.filter(p => p.estado === 'PENDIENTE');
            setOrders(pending);
        } catch (err) {
            console.error("Error cargando notificaciones:", err);
        }
    };

    useEffect(() => {
        checkNewOrders();
        const interval = setInterval(checkNewOrders, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de la Campana */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100"
            >
                <Bell className="w-6 h-6 md:w-6 md:h-6" />
                {orders.length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                        {orders.length}
                    </span>
                )}
            </button>

            {/* Dropdown Responsivo */}
            {isOpen && (
                <div className="
                    fixed left-4 right-4 mt-3   /* En móvil: ocupa casi todo el ancho con márgenes */
                    md:absolute md:left-auto md:right-0 md:w-80 md:mt-3 /* En PC: ancho fijo a la derecha */
                    bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden 
                    transform origin-top transition-all
                ">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-indigo-600" />
                            Pedidos Web Pendientes
                        </h3>
                    </div>

                    <div className="max-h-[60vh] md:max-h-64 overflow-y-auto">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href="/admin/pedidos"
                                    onClick={() => setIsOpen(false)}
                                    className="block p-4 border-b border-gray-50 hover:bg-indigo-50/30 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-mono font-bold text-indigo-600">{order.codigo_pedido}</span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(order.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600 flex items-center gap-1">
                                            <Package className="w-3 h-3" />
                                            {order.detalles.length} productos
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {formatCurrency(order.total, 'COP')}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No hay pedidos pendientes
                            </div>
                        )}
                    </div>

                    {orders.length > 0 && (
                        <Link
                            href="/admin/pedidos"
                            onClick={() => setIsOpen(false)}
                            className="block p-3 text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-50"
                        >
                            Ver todos los pedidos
                            <ArrowRight className="w-3 h-3 inline ml-1" />
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
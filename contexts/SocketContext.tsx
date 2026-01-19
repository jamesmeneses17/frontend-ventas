"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Solo conectar si hay usuario logueado
        if (!user) {
            if (socket) {
                console.log('🔌 Desconectando socket (Sin usuario)...');
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Evitar reconectar si ya existe socket conectado con el mismo usuario
        if (socket && socket.connected) {
            // Podríamos verificar si el query userId es el mismo, pero por simplicidad asumiremos que si cambia el user, el componente se desmonta o el efecto se dispara
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

        console.log(`🔌 Iniciando conexión Socket.IO a ${apiUrl} para usuario ${user.id}`);

        const newSocket = io(apiUrl, {
            query: {
                userId: user.id
            },
            transports: ['websocket', 'polling'], // Forzar websocket si es posible
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket conectado:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket desconectado');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Connection Error:', err);
        });

        setSocket(newSocket);

        return () => {
            console.log('🔌 Limpiando socket (Desmontaje)...');
            newSocket.disconnect();
        };
    }, [user]); // Re-ejecutar si cambia el usuario

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket debe ser usado dentro de un SocketProvider');
    }
    return context;
}

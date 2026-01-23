"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Usuario {
    id: number;
    nombre: string;
    correo: string;
    rol: string;
    ultimo_login?: string;
    en_linea: number;
}

export default function HistorialSesionesPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Protección de ruta del lado del cliente
        if (user && user.correo !== 'james@itp.edu.co') {
            router.push('/dashboard');
        }
    }, [user, router]);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            // Usar variable de entorno o fallback
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

            const response = await fetch(`${apiUrl}/usuarios-admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsuarios(data);
            } else {
                console.error('Error al obtener usuarios');
            }
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const timeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diffInSeconds < 60) return `Hace unos segundos`;

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;

        const diffInMonths = Math.floor(diffInDays / 30);
        return `Hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`;
    };

    const columns = [
        { key: "nombre" as keyof Usuario, label: "Usuario" },
        { key: "correo" as keyof Usuario, label: "Correo" },
        { key: "rol" as keyof Usuario, label: "Rol" },
        {
            key: "ultimo_login" as keyof Usuario,
            label: "Último Inicio de Sesión",
            render: (value: string | undefined) => (
                value ? (
                    <div className="flex flex-col">
                        <span className="font-bold text-emerald-600">
                            {timeAgo(value)}
                        </span>
                        <span className="text-xs text-gray-500">
                            {new Date(value).toLocaleString('es-CO', {
                                day: '2-digit', month: 'long',
                                hour: '2-digit', minute: '2-digit', hour12: true
                            })}
                        </span>
                    </div>
                ) : <span className="text-gray-400 italic">Nunca</span>
            ),
        },
        {
            key: "en_linea" as keyof Usuario,
            label: "Estado",
            render: (value: number) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${value === 1
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                >
                    {value === 1 ? "En Línea" : "Desconectado"}
                </span>
            ),
        },
    ];

    // Si no es el usuario autorizado, no renderizar nada mientras redirige
    if (user && user.correo !== 'james@itp.edu.co') {
        return null;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Historial de Sesiones</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Supervisión de actividad y estado de usuarios administradores
                    </p>
                </div>

                <button
                    onClick={fetchUsuarios}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
                >
                    Actualizar
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <DataTable data={usuarios} columns={columns} />
            )}
        </div>
    );
}

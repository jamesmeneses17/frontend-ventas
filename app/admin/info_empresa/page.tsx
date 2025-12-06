"use client";
import React, { useEffect, useCallback, useState } from "react";
// Componentes de Layout y UI
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import Alert from "../../../components/ui/Alert";
import CardStat from "../../../components/ui/CardStat"; // Lo dejamos por si quieres mostrar stats
import { Settings } from "lucide-react"; // Usaremos un ícono de configuración

// Importar la Entidad (para tipado) y el Formulario/Servicio específico
import { InformacionEmpresa } from "../../../types/configuracion";
import InformacionEmpresaForm from "../../../components/catalogos/InformacionEmpresaForm";
import { 
    getInformacionEmpresa, 
    updateInformacionEmpresa,
    createInformacionEmpresa // Asumimos un servicio para la lógica de API
} from "@/components/services/configuracionWebService"; 


export default function InformacionEmpresaPage() {
    const [initialData, setInitialData] = useState<InformacionEmpresa | null>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type?: "success"|"error" } | null>(null);
    const [isNewRecord, setIsNewRecord] = useState(false); // Flag para saber si se está creando por primera vez

    // -------------------------------------------------------------------
    // FUNCIÓN DE CARGA DE DATOS
    // -------------------------------------------------------------------
    const loadInfo = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getInformacionEmpresa();
            setInitialData(data);
            setIsNewRecord(false);
        } catch (err: any) {
            // Si la API devuelve 404 (el servicio backend que creamos),
            // significa que el registro único no existe, y debemos crear el primero.
            if (err.response && err.response.status === 404) {
                console.log("No existe registro inicial. Listo para crear.");
                setIsNewRecord(true);
                setInitialData(null); // Asegurar que el formulario esté vacío
            } else {
                console.error("[InformacionEmpresaPage] load error", err);
                setNotification({ message: "Error cargando la configuración: " + (err.message || 'Error desconocido'), type: "error" });
                setInitialData(null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInfo();
    }, [loadInfo]);

    // -------------------------------------------------------------------
    // RENDERIZADO DEL COMPONENTE
    // -------------------------------------------------------------------

    // Función para manejar el guardado exitoso y recargar la data
    const handleSaved = async () => {
        await loadInfo(); // Recarga los datos y cambia la bandera isNewRecord
        setNotification({ 
            message: `Información de Empresa ${isNewRecord ? 'creada' : 'actualizada'} correctamente`, 
            type: "success" 
        });
    };


    return (
        <AuthenticatedLayout>
            <div className="space-y-6">
                
                {/* Stats (Opcional - Puedes usarlo para mostrar el estado del servidor si quieres) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CardStat 
                        title="Estado de Configuración" 
                        value={isNewRecord ? "PENDIENTE" : "CONFIGURADA"} 
                        color={isNewRecord ? "text-red-600" : "text-green-600"} 
                        icon={<Settings className="w-5 h-5"/>} 
                    />
                    {/* Puedes agregar otros CardStat aquí si son relevantes */}
                </div>

                {/* Main container: Contiene el Formulario Único */}
                <div className="bg-white shadow rounded-2xl p-6 border border-gray-300">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isNewRecord ? "Crear Configuración Inicial" : "Información de Empresa"}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {isNewRecord 
                                    ? "Este registro es único. Por favor, ingrese la información base de la empresa."
                                    : "Actualiza los datos de contacto, horarios, redes sociales y logos de tu sitio web."
                                }
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center p-10 text-gray-500">Cargando datos...</div>
                    ) : (
                        // Pasamos los datos iniciales y el flag isNewRecord al formulario
                        <InformacionEmpresaForm
                            initialData={initialData}
                            isCreation={isNewRecord}
                            onSaved={handleSaved}
                            // Si es nuevo, el botón de Cancelar puede desaparecer o hacer un alert
                            onCancel={() => { 
                                if (isNewRecord) {
                                    alert("Debe completar la configuración inicial.");
                                }
                            }}
                        />
                    )}
                </div>
            </div>

            {/* NOTIFICACIONES */}
            {notification && (
                <div className="fixed top-10 right-4 z-[9999]">
                    <Alert message={notification.message} type={notification.type ?? "success"} onClose={()=>setNotification(null)} />
                </div>
            )}
        </AuthenticatedLayout>
    );
}
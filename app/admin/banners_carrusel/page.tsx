// app/admin/configuracion-banners/page.tsx
"use client";
import React, { useEffect, useCallback, useState } from "react";
// Asegúrate de que los siguientes componentes existen en tu proyecto
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import CardStat from "../../../components/ui/CardStat";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import ActionButton from "../../../components/common/ActionButton";
import FilterBar from "../../../components/common/FilterBar"; 

import { Plus, LayoutTemplate, Eye, XCircle } from "lucide-react";

import BannerForm from "../../../components/catalogos/BannerForm";

import { Banner } from "../../../types/configuracion";
import { getBanners, deleteBanner } from "../../../components/services/bannerService";

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Banner | null>(null);

    const [notification, setNotification] = useState<{ message: string; type?: "success"|"error" } | null>(null);

    const [search, setSearch] = useState(""); 
    
    // Función de carga de datos
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const items = await getBanners(); 
            
            // Filtrado simple por título/subtítulo en el frontend
            const filteredItems = items.filter(b => 
                b.titulo.toLowerCase().includes(search.toLowerCase()) || 
                b.subtitulo?.toLowerCase().includes(search.toLowerCase()) ||
                b.urlLink?.toLowerCase().includes(search.toLowerCase())
            );

            setBanners(filteredItems);
            setTotal(items.length); 
        } catch (err) {
            console.error("[BannersPage] load error", err);
            setNotification({ message: "Error cargando banners", type: "error" });
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        load();
    }, [load]);

    const handleAdd = () => {
        setEditing(null);
        setShowModal(true);
    };

    const handleEdit = (item: Banner) => {
        setEditing(item);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de eliminar este banner? Esta acción es irreversible.")) return;
        try {
            await deleteBanner(id);
            setNotification({ message: "Banner eliminado exitosamente", type: "success" });
            load();
        } catch (err) {
            console.error("delete error", err);
            setNotification({ message: "Error al eliminar el banner", type: "error" });
        }
    };
    
    const handleSaved = async () => {
        setShowModal(false); 
        await load(); 
        setNotification({ 
            message: `Banner ${editing ? 'actualizado' : 'creado'} correctamente`, 
            type: "success" 
        });
    };
    
    const totalActivos = banners.filter(b => b.activo).length;

    return (
        <AuthenticatedLayout>
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CardStat 
                        title="Banners Totales" 
                        value={String(total)} 
                        color="text-indigo-600" 
                        icon={<LayoutTemplate className="w-5 h-5"/>} 
                    />
                    <CardStat 
                        title="Banners Activos" 
                        value={String(totalActivos)} 
                        color="text-green-600" 
                        icon={<Eye className="w-5 h-5"/>} 
                    />
                    <CardStat 
                        title="Banners Inactivos" 
                        value={String(total - totalActivos)} 
                        color="text-yellow-600" 
                        icon={<XCircle className="w-5 h-5"/>} 
                    />
                </div>

                {/* Main container */}
                <div className="bg-white shadow rounded-2xl p-6 border border-gray-300">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Banners y Carrusel Web</h1>
                            <p className="text-gray-600 mt-2">Gestiona las imágenes promocionales y el orden de visualización del carrusel principal.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <ActionButton icon={<Plus className="w-5 h-5 mr-1" />} label="Nuevo Banner" onClick={handleAdd} color="primary" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <FilterBar 
                            searchTerm={search} 
                            onSearchChange={(v)=>{ setSearch(v); }} 
                            searchPlaceholder="Buscar por título o link..." 
                        />
                    </div>


                    {/* Footer de la tabla */}
                    {!loading && banners.length > 0 && (
                        <p className="text-sm text-gray-600 mt-4">Mostrando {banners.length} de {total} banners (Ordenados por campo 'Orden').</p>
                    )}
                    {loading && <p className="text-sm text-gray-600 mt-4">Cargando...</p>}
                </div>
            </div>

            {/* Modal crear/editar */}
            {showModal && (
                <ModalVentana isOpen={showModal} onClose={()=>setShowModal(false)} title={editing ? "Editar Banner" : "Nuevo Banner"}>
                    <BannerForm
                        initialData={editing}
                        onCancel={()=>{ setShowModal(false); }}
                        onSaved={handleSaved}
                    />
                </ModalVentana>
            )}

            {notification && (
                <div className="fixed top-10 right-4 z-[9999]">
                    <Alert message={notification.message} type={notification.type ?? "success"} onClose={()=>setNotification(null)} />
                </div>
            )}
        </AuthenticatedLayout>
    );
}
"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "../../../../components/layout/AuthenticatedLayout";
import ActionButton from "../../../../components/common/ActionButton";
import { Upload, Trash, Image as ImageIcon, Loader2 } from "lucide-react";
import {
    getBanners,
    createBanner,
    uploadBannerImagen,
    deleteBannerImagen,
    updateBannerImagen,
    Banner,
    BannerImagen,
} from "../../../../components/services/bannersService";
import Image from "next/image";

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<number>(1); // 1 = Principal, 2 = Marcas

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        setLoading(true);
        try {
            const data = await getBanners();
            setBanners(data);
        } catch (error) {
            console.error("Error loading banners:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBanner = async (id: number, nombre: string) => {
        try {
            setLoading(true);
            // El backend asigna IDs autoincrementales, pero idealmente buscaríamos por nombre o tipo.
            // Para simplificar y dado que el usuario pidió específicamente ID 2, intentaremos crear uno.
            // Nota: En SQL normal no forzamos ID en INSERT, pero aquí asumimos que si creamos
            // será el siguiente. Si la lógica de negocio requiere IDs fijos, debería manejarse en backend con 'Seeds'.
            // Por ahora, crearemos con un nombre descriptivo.
            await createBanner({ nombre });
            await loadBanners();
        } catch (error) {
            console.error("Error creating banner:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;

        // Buscar el banner activo por ID (o el que corresponda a la pestaña)
        // Asumimos que la pestaña 1 es el primer banner encontrado o el ID 1 si coincidiera
        // Mejor enfoque: Filtrar banners por su ID real si coincide con la pestaña, O
        // si la pestaña es puramente UI, mapear Pestaña 1 -> Banner ID 1, Pestaña 2 -> Banner ID 2

        // Estrategia Robustez:
        // Tab 1 -> Intenta buscar banner con ID = 1.
        // Tab 2 -> Intenta buscar banner con ID = 2.

        const targetBanner = banners.find(b => b.id === activeTab);

        if (!targetBanner) {
            alert(`El banner con ID ${activeTab} no existe. Por favor créalo primero.`);
            return;
        }

        const file = event.target.files[0];
        setUploading(true);
        try {
            await uploadBannerImagen(targetBanner.id, file);
            await loadBanners();
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error al subir la imagen");
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    const handleDeleteImage = async (imagenId: number) => {
        if (!confirm("¿Está seguro de eliminar esta imagen?")) return;

        try {
            await deleteBannerImagen(imagenId);
            await loadBanners();
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    };

    const handleToggleActive = async (imagen: BannerImagen) => {
        try {
            const updatedBanners = banners.map(b => {
                if (b.id !== activeTab) return b;
                return {
                    ...b,
                    imagenes: b.imagenes.map(img => img.id === imagen.id ? { ...img, activo: !img.activo } : img)
                }
            });
            setBanners(updatedBanners);
            await updateBannerImagen(imagen.id, !imagen.activo);
        } catch (error) {
            console.error("Error toggling image:", error);
            loadBanners();
        }
    };

    const currentBanner = banners.find(b => b.id === activeTab);

    return (
        <AuthenticatedLayout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-indigo-600" />
                    Gestión de Banners
                </h1>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 1 ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab(1)}
                    >
                        Carrusel Principal
                    </button>
                    <button
                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 2 ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab(2)}
                    >
                        Barra de Marcas
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    {loading && banners.length === 0 ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                        </div>
                    ) : !currentBanner ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 mb-4">
                                {activeTab === 1 ? "El carrusel principal no está inicializado." : "La barra de marcas no está inicializada."}
                            </p>
                            <ActionButton
                                label={`Inicializar ${activeTab === 1 ? "Carrusel" : "Barra de Marcas"}`}
                                onClick={() => handleCreateBanner(activeTab, activeTab === 1 ? "Principal" : "Marcas")}
                                color="primary"
                                icon={<Upload className="w-4 h-4" />}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Esto creará el Banner ID {activeTab} en la base de datos.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        {activeTab === 1 ? "Imágenes del Carrusel Principal" : "Imagen de Marcas Aliadas (Única)"}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        ID del Banner: {currentBanner.id}
                                    </p>
                                </div>
                                <div>
                                    {/* Para el banner de marcas (ID 2), solo permitimos 1 imagen */}
                                    {activeTab === 2 && (currentBanner.imagenes || []).length >= 1 ? (
                                        <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                                            Solo se permite 1 imagen para marcas
                                        </span>
                                    ) : (
                                        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow inline-flex items-center gap-2 transition">
                                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            <span>Subir Imagen</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Grid de Imágenes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {(currentBanner.imagenes || []).map((img) => (
                                    <div key={img.id} className={`group relative border rounded-lg overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition ${!img.activo ? 'opacity-60' : ''}`}>
                                        <div className="aspect-[3/1] relative">
                                            <Image
                                                src={img.urlImagen}
                                                alt="Banner"
                                                fill
                                                className="object-cover"
                                            />
                                            {!img.activo && (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">Inactivo</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 flex justify-between items-center bg-white">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {img.activo ? 'Visible' : 'Oculto'}
                                                </span>
                                                <button
                                                    onClick={() => handleToggleActive(img)}
                                                    className={`
                                    relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                                    ${img.activo ? 'bg-green-500' : 'bg-gray-300'}
                                `}
                                                    role="switch"
                                                    aria-checked={img.activo}
                                                >
                                                    <span className="sr-only">Use setting</span>
                                                    <span
                                                        aria-hidden="true"
                                                        className={`
                                        pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                        ${img.activo ? 'translate-x-4' : 'translate-x-0'}
                                    `}
                                                    />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteImage(img.id)}
                                                className="p-1.5 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                                                title="Eliminar imagen"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(currentBanner.imagenes || []).length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-gray-500">No hay imágenes cargadas para este banner.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

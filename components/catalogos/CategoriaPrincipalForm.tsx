// components/catalogos/CategoriaPrincipalForm.tsx

"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import FormInput from "../common/form/FormInput";
import Button from "../ui/button";

import {
    CategoriaPrincipal,
    CreateCategoriaPrincipalData,
    uploadImagenCategoriaPrincipal,
} from "../services/categoriasPrincipalesService";

type FormData = CreateCategoriaPrincipalData;

interface Props {
    initialData?: Partial<CategoriaPrincipal> | null;
    onSubmit: (data: FormData) => void;
    onCancel: () => void;
}

export default function CategoriaPrincipalForm({ initialData, onSubmit, onCancel }: Props) {
    const [nombre, setNombre] = useState(initialData?.nombre || "");
    const [activo, setActivo] = useState(String(initialData?.activo ?? 1));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = Boolean(initialData?.id);
    
    // Estados para la imagen
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagen_url || null);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Sincronizar cuando initialData cambia
    useEffect(() => {
        setNombre(initialData?.nombre || "");
        setActivo(String(initialData?.activo ?? 1));
        setImagePreview(initialData?.imagen_url || null);
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload: FormData = {
                nombre,
                activo: Number(activo),
            };
            
            // Si hay un archivo de imagen nuevo, subirlo primero
            if (selectedImageFile) {
                setUploadingImage(true);
                try {
                    // Si estamos editando, usar el ID existente para subir
                    if (isEditing && initialData?.id) {
                        const res = await uploadImagenCategoriaPrincipal(initialData.id, selectedImageFile);
                        const url = res?.url || res?.imagen_url;
                        if (url) {
                            payload.imagen_url = url;
                            console.log('[CategoriaPrincipalForm] Imagen subida, URL del backend:', url);
                        }
                    }
                } catch (error) {
                    console.error("Error al subir imagen:", error);
                } finally {
                    setUploadingImage(false);
                }
            } else if (!selectedImageFile && imagePreview && !imagePreview.startsWith('blob:')) {
                // Si no hay archivo nuevo pero hay una URL válida existente (no blob), mantenerla
                payload.imagen_url = imagePreview;
            }
            
            onSubmit(payload);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        if (name === "nombre") setNombre(value);
        else if (name === "activo") setActivo(value);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
                label="Nombre de la Categoría"
                name="nombre"
                value={nombre}
                onChange={handleChange}
                placeholder="Ej: Electrónica"
                required
            />
            <div>
                <label htmlFor="activo" className="block text-sm font-medium text-gray-700">
                    Activo
                </label>
                <select
                    id="activo"
                    name="activo"
                    value={activo}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value={1}>Sí</option>
                    <option value={0}>No</option>
                </select>
            </div>

            {/* Campo de Imagen */}
            <div className="grid grid-cols-1 gap-4">
                <label className="block text-sm font-medium text-gray-700">
                    Imagen de la Categoría (Opcional)
                </label>

                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        id="imagenCategoria"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setSelectedImageFile(file);
                                setImagePreview(URL.createObjectURL(file));
                            }
                        }}
                        disabled={uploadingImage}
                    />

                    <label
                        htmlFor="imagenCategoria"
                        className="px-4 py-2 border rounded-md bg-white cursor-pointer w-fit hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploadingImage ? "Subiendo imagen..." : "Seleccionar Imagen"}
                    </label>

                    {imagePreview && (
                        <div className="mt-2 relative w-32 h-32">
                            <Image
                                src={imagePreview}
                                alt="Preview"
                                width={128}
                                height={128}
                                className="w-full h-full object-cover rounded border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setImagePreview(null);
                                    setSelectedImageFile(null);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    color="secondary"
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isEditing ? "Guardar Cambios" : "Crear Categoría"}
                </Button>
            </div>
        </form>
    );
}
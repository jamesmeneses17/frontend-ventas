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
    updateCategoriaPrincipal,
} from "../services/categoriasPrincipalesService";

type FormData = CreateCategoriaPrincipalData;

interface Props {
    initialData?: Partial<CategoriaPrincipal> | null;
    onSubmit: (data: FormData) => void;
    onSuccess?: (result: any) => Promise<void> | void;
    onCancel: () => void;
}

export default function CategoriaPrincipalForm({ initialData, onSubmit, onSuccess, onCancel }: Props) {
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
            let recordId = initialData?.id;
            
            const payload: FormData = {
                nombre,
                activo: Number(activo),
            };
            
            // Si no hay archivo nuevo pero hay URL existente válida, mantenerla
            if (!selectedImageFile && imagePreview && !imagePreview.startsWith('blob:')) {
                payload.imagen_url = imagePreview;
            }
            
            // Primero enviar el formulario (crear o actualizar)
            const result = await onSubmit(payload);
            console.log('[CategoriaPrincipalForm] Resultado de onSubmit:', result);
            
            // Verificar si hubo error
            if (!result) {
                setIsSubmitting(false);
                return; // No continuar si hubo error
            }
            
            // Si es creación, obtener el ID del resultado
            if (!recordId) {
                recordId = result?.id || result?.data?.id;
            }
            
            console.log('[CategoriaPrincipalForm] ID del registro:', recordId, 'Tiene imagen?', !!selectedImageFile);
            
            // Si hay un archivo nuevo y tenemos un ID, subir la imagen después
            if (selectedImageFile && recordId) {
                console.log('[CategoriaPrincipalForm] Subiendo imagen para ID:', recordId);
                setUploadingImage(true);
                try {
                    const res = await uploadImagenCategoriaPrincipal(recordId, selectedImageFile);
                    console.log('[CategoriaPrincipalForm] Respuesta de upload:', res);
                    // El backend puede devolver imagenUrl (camelCase) o imagen_url (snake_case)
                    const url = res?.url || res?.imagen_url || res?.imagenUrl;
                    if (url) {
                        console.log('[CategoriaPrincipalForm] Imagen subida exitosamente, URL:', url);
                        // Actualizar el registro con la nueva URL de imagen
                        await updateCategoriaPrincipal(recordId, { imagen_url: url });
                    }
                } catch (error) {
                    console.error("Error al subir imagen:", error);
                } finally {
                    setUploadingImage(false);
                }
            }
            
            // Notificar éxito y refrescar lista antes de cerrar
            if (onSuccess) {
                await onSuccess(result);
            }

            // Cerrar el modal después de completar todo
            if (onCancel) {
                onCancel();
            }
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

            <div className="flex justify-end gap-3 pt-2">
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
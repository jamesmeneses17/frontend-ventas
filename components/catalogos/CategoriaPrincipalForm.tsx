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
    onSubmit: (data: FormData) => Promise<any> | any;
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
            
            // Si hubo resultado, potencialmente extraer ID; si no, continuar y confiar en excepciones
            
            // Si es creación, obtener el ID del resultado
            if (!recordId && result) {
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
                    // El backend puede devolver imagenUrl (camelCase) o imagen_url (snake_case). Forzar a any para evitar error de tipos.
                    const r: any = res as any;
                    const url = r?.url || r?.imagen_url || r?.imagenUrl;
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
            } else if (onCancel) {
                onCancel();
            }
        } catch (error) {
            console.error("Error al guardar:", error);
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
        <div className="relative">
            {/* Overlay de carga */}
            {(isSubmitting || uploadingImage) && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-700 font-medium">
                            {uploadingImage ? "Subiendo imagen..." : "Guardando..."}
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="Nombre de la Categoría"
                    name="nombre"
                    value={nombre}
                    onChange={handleChange}
                    placeholder="Ej: Electrónica"
                    required
                    disabled={isSubmitting || uploadingImage}
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
                        disabled={isSubmitting || uploadingImage}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                            disabled={uploadingImage || isSubmitting}
                        />

                        <label
                            htmlFor="imagenCategoria"
                            className={`px-4 py-2 border rounded-md bg-white w-fit ${
                                uploadingImage || isSubmitting
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer hover:bg-gray-50"
                            }`}
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
                                    unoptimized
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setSelectedImageFile(null);
                                    }}
                                    disabled={uploadingImage || isSubmitting}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={isSubmitting || uploadingImage}
                        color="secondary"
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting || uploadingImage}>
                        {isEditing ? "Guardar Cambios" : "Crear Categoría"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
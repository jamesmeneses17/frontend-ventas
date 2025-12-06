// src/components/configuracion-web/BannerForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { useForm, SubmitHandler } from "react-hook-form";
// Asegúrate de que los siguientes componentes existen en tu proyecto
import FormInput from "../common/form/FormInput"; 
import FormSwitch from "../common/form/FormSwitch"; 
import Button from "../ui/button";

import { Banner, CreateBannerData, UpdateBannerData } from "../../types/configuracion";
import { createBanner, updateBanner } from "../services/bannerService"; // Importamos las funciones del servicio correcto

type FormData = CreateBannerData;

interface Props {
    initialData?: Partial<Banner> | null;
    onSaved: () => void;
    onCancel: () => void;
}

export default function BannerForm({ initialData, onSaved, onCancel }: Props) {
    const [formError, setFormError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { isSubmitting },
        watch,
    } = useForm<FormData>({
        defaultValues: {
            titulo: initialData?.titulo || "",
            subtitulo: initialData?.subtitulo || "",
            urlLink: initialData?.urlLink || "",
            textoBoton: initialData?.textoBoton || "",
            urlImagen: initialData?.urlImagen || "",
            orden: initialData?.orden || 0,
            activo: initialData?.activo ?? true,
        },
    });

    const formValues = watch();

    // Reset preview cuando cambia la URL de la imagen
    useEffect(() => {
        setShowPreview(Boolean(formValues.urlImagen));
    }, [formValues.urlImagen]);

    const submitForm: SubmitHandler<FormData> = async (data) => {
        setFormError(null);
        const isEditing = Boolean(initialData?.id);
        
        const payload: any = { 
            ...data, 
            orden: Number(data.orden), // Aseguramos que la orden es un número
        };

        try {
            if (isEditing) {
                await updateBanner(initialData!.id as number, payload as UpdateBannerData);
            } else {
                await createBanner(payload as CreateBannerData);
            }
            onSaved();
        } catch (err: any) {
            console.error('[BannerForm] Error en submit:', err);
            const errorMessage = err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el banner.`;
            setFormError(errorMessage);
        }
    };

    return (
        <form 
            onSubmit={handleSubmit(submitForm)}
            className="space-y-6 p-4 max-w-3xl mx-auto max-h-[80vh] overflow-y-auto"
        >

            <h3 className="text-lg font-semibold border-b pb-2">Contenido y Acción</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    label="Título Principal"
                    {...register('titulo')}
                    required
                />
                <FormInput
                    label="Subtítulo/Descripción (Opcional)"
                    {...register('subtitulo')}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    label="URL de Enlace (Link)"
                    {...register('urlLink')}
                    placeholder="/productos/ofertas o https://externo.com"
                />
                <FormInput
                    label="Texto del Botón (CTA)"
                    {...register('textoBoton')}
                    placeholder="Comprar ahora"
                />
            </div>

            <h3 className="text-lg font-semibold border-b pb-2 pt-4">Media y Configuración</h3>
            <div className="grid grid-cols-1 gap-6">
                <FormInput
                    label="URL de la Imagen (Obligatorio) *"
                    {...register('urlImagen')}
                    required
                    placeholder="https://tudominio.com/banner-principal.jpg"
                />
                {/* Vista previa de la imagen */}
                {formValues.urlImagen && showPreview && (
                    <div className="w-full h-40 relative border rounded-md overflow-hidden">
                        <Image
                            src={formValues.urlImagen}
                            alt="Vista Previa del Banner"
                            fill
                            style={{ objectFit: 'cover' }}
                            onError={() => setShowPreview(false)}
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormInput
                    label="Orden de Visualización"
                    type="number"
                    {...register('orden')}
                    required
                    min={0}
                />
                <div className="col-span-2 flex items-center pt-6">
                    <FormSwitch
                        label="Banner Activo"
                        name="activo"
                        checked={!!formValues.activo}
                        onChange={(e) => setValue('activo', e.target.checked)}
                    />
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} color="primary">
                    {initialData?.id ? "Guardar Cambios" : "Crear Banner"}
                </Button>
            </div>

            {formError && (
                <p className="text-red-600 text-center text-sm mt-4">{formError}</p>
            )}
        </form>
    );
}
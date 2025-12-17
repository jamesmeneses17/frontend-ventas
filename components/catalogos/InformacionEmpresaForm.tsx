// src/components/configuracion-web/InformacionEmpresaForm.tsx

"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import Button from "../ui/button";
import FormTextArea from "../common/form/FormTextArea"; // Asumiendo este componente

import { 
    InformacionEmpresa, 
    UpdateInformacionEmpresaData, 
    CreateInformacionEmpresaData 
} from "../../types/configuracion";
import { 
    createInformacionEmpresa, 
    updateInformacionEmpresa 
} from "@/components/services/configuracionWebService";

type FormData = UpdateInformacionEmpresaData;

interface Props {
    initialData: InformacionEmpresa | null;
    isCreation: boolean;
    onSaved: () => void;
    onCancel: () => void;
}

export default function InformacionEmpresaForm({ initialData, isCreation, onSaved, onCancel }: Props) {
    const [formError, setFormError] = useState<string | null>(null);

    const defaultValues: FormData = {
        nombreEmpresa: initialData?.nombreEmpresa || "",
        razonSocial: initialData?.razonSocial || "",
        nit: initialData?.nit || "",
        telefonoFijo: initialData?.telefonoFijo || "",
        whatsapp: initialData?.whatsapp || "",
        emailInfo: initialData?.emailInfo || "",
        emailVentas: initialData?.emailVentas || "",
        direccionPrincipal: initialData?.direccionPrincipal || "",
        horarioLunesViernes: initialData?.horarioLunesViernes || "",
        horarioSabados: initialData?.horarioSabados || "",
        horarioDomingos: initialData?.horarioDomingos || "",
        urlFacebook: initialData?.urlFacebook || "",
        urlInstagram: initialData?.urlInstagram || "",
        urlLinkedIn: initialData?.urlLinkedIn || "",
        urlLogo: initialData?.urlLogo || "",
        urlFavicon: initialData?.urlFavicon || "",
    };

    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
        watch,
    } = useForm<FormData>({
        defaultValues,
        mode: "onBlur"
    });

    const formValues = watch();

    const submitForm: SubmitHandler<FormData> = async (data) => {
        setFormError(null);
        try {
            if (isCreation) {
                // Forzar la validación de campos obligatorios para la creación
                const creationData: CreateInformacionEmpresaData = {
                    nombreEmpresa: data.nombreEmpresa!,
                    telefonoFijo: data.telefonoFijo!,
                    whatsapp: data.whatsapp!,
                    emailInfo: data.emailInfo!,
                    direccionPrincipal: data.direccionPrincipal!,
                    horarioLunesViernes: data.horarioLunesViernes || "L-V: 8-6",
                    horarioSabados: data.horarioSabados || "S: 9-2",
                    horarioDomingos: data.horarioDomingos || "D: Cerrado",
                    urlLogo: data.urlLogo!,
                    ...data, // Incluye el resto de campos opcionales
                };
                await createInformacionEmpresa(creationData);
            } else {
                await updateInformacionEmpresa(data);
            }
            onSaved();
        } catch (err: any) {
            console.error('[InformacionEmpresaForm] Error en submit:', err);
            const errorMessage = err.response?.data?.message || "Error al guardar la información. Verifique los datos.";
            setFormError(errorMessage);
        }
    };

    return (
        <form 
            onSubmit={handleSubmit(submitForm)}
            className="space-y-8 p-4"
        >
            

            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 pt-4">1. Contacto y Ubicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput
                    label="Teléfono Fijo *"
                    {...register('telefonoFijo', {
                        required: "El teléfono fijo es obligatorio",
                        minLength: { value: 1, message: "No puede estar vacío" },
                        maxLength: { value: 50, message: "Máximo 50 caracteres" },
                    })}
                    required
                />
                <FormInput
                    label="WhatsApp *"
                    {...register('whatsapp', {
                        required: "El WhatsApp es obligatorio"
                    })}
                    required
                />
                <FormInput
                    label="Email Info *"
                    {...register('emailInfo', {
                        required: "El email es obligatorio",
                        minLength: { value: 1, message: "No puede estar vacío" },
                        maxLength: { value: 100, message: "Máximo 100 caracteres" },
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Debe ser un email válido"
                        }
                    })}
                    type="email"
                    required
                />
               
            </div>
            <div className="grid grid-cols-1 gap-6">
                <FormInput 
                    label="Dirección Principal *"
                    {...register('direccionPrincipal', {
                        required: "La dirección es obligatoria"
                    })}
                    required
                />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 pt-4">3. Horarios y Redes Sociales</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput
                    label="Horario Lunes - Viernes"
                    {...register('horarioLunesViernes')}
                />
                <FormInput
                    label="Horario Sábados"
                    {...register('horarioSabados')}
                />
                <FormInput
                    label="Horario Domingos"
                    {...register('horarioDomingos')}
                />
                <FormInput
                    label="URL Facebook"
                    {...register('urlFacebook')}
                    placeholder="https://facebook.com/..."
                />
                <FormInput
                    label="URL Instagram"
                    {...register('urlInstagram')}
                    placeholder="https://instagram.com/..."
                />
                <FormInput
                    label="URL LinkedIn"
                    {...register('urlLinkedIn')}
                    placeholder="https://linkedin.com/..."
                />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-8">
                <Button type="button" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isCreation ? "Crear Configuración Inicial" : "Guardar Cambios"}
                </Button>
            </div>

            {formError && (
                <p className="text-red-600 text-center text-sm mt-4">{formError}</p>
            )}
        </form>
    );
}
// components/catalogos/CategoriaPrincipalForm.tsx

"use client";
import React, { useEffect, useState } from "react";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { 
    CategoriaPrincipal, 
    CreateCategoriaPrincipalData, 
    UpdateCategoriaPrincipalData, 
    Estado
} from "../services/categoriasPrincipalesService";
import { 
    createCategoriaPrincipal, 
    updateCategoriaPrincipal,
    getEstados
} from "../services/categoriasPrincipalesService";

type FormData = CreateCategoriaPrincipalData;

interface Props {
    initialData?: Partial<CategoriaPrincipal> | null;
    onSubmit: (data: FormData) => void;
    onCancel: () => void;
}

export default function CategoriaPrincipalForm({ initialData, onSubmit, onCancel }: Props) {
    const [nombre, setNombre] = useState(initialData?.nombre || "");
    const [estadoId, setEstadoId] = useState(String(initialData?.estadoId || 1));
    const [estados, setEstados] = useState<Estado[]>([]);
    const [loadingEstados, setLoadingEstados] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = Boolean(initialData?.id);

    useEffect(() => {
        const loadEstados = async () => {
            setLoadingEstados(true);
            try {
                const data = await getEstados();
                setEstados(data);
            } catch (err) {
                console.error('Error cargando estados:', err);
            } finally {
                setLoadingEstados(false);
            }
        };
        loadEstados();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload: FormData = {
                nombre,
                estadoId: Number(estadoId),
            };
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
        else if (name === "estadoId") setEstadoId(value);
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
            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting || loadingEstados}
                    color="secondary"
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || loadingEstados}>
                    {isEditing ? "Guardar Cambios" : "Crear Categoría"}
                </Button>
            </div>
        </form>
    );
}
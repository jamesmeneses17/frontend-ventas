"use client";

import React, { useState, useEffect } from "react";
// Importamos los tipos de datos necesarios para la creación/actualización
import { CreateMarcaData, UpdateMarcaData } from "../services/marcasService"; 
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";

// 1. INTERFAZ DE PROPIEDADES CORREGIDA
interface Props {
    
    initialData?: {
        id?: number; // Es opcional para la creación
        nombre: string;
        estadoId: number; // Usamos el ID del estado (número)
    };
    onSubmit: (values: CreateMarcaData | UpdateMarcaData & { id?: number }) => void;
    onCancel: () => void;
}

interface FormValues {
    nombre: string;
    estadoId: number;
}


export default function MarcasForm({ initialData, onSubmit, onCancel }: Props) {
    // 2. ESTADO INICIAL CORREGIDO
    const [values, setValues] = useState<FormValues>(
        initialData 
            ? { nombre: initialData.nombre, estadoId: initialData.estadoId }
            : { nombre: "", estadoId: 1 } // 1 = Activo (asumiendo que es el ID)
    );

    const handleChange = (field: keyof FormValues, value: any) => {
        // Convertimos el estadoId a número si viene de un FormSelect que usa strings
        const finalValue = field === 'estadoId' ? parseInt(value, 10) : value;
        setValues({ ...values, [field]: finalValue });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (initialData?.id) {
             onSubmit({ ...values, id: initialData.id });
        } else {
             onSubmit(values);
        }
    };

      const [loading, setLoading] = useState(false);
    

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
                label="Nombre de la Marca"
                name="nombre"
                value={values.nombre}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("nombre", e.target.value)}
                required // El nombre es obligatorio
            />

            
            <FormSelect
                label="Estado"
                name="estadoId" // Cambiamos el nombre del campo a estadoId
                value={values.estadoId.toString()} 
                options={[
                    { label: "Activo", value: "1" }, 
                    { label: "Inactivo", value: "2" },
                ]}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("estadoId", e.target.value)}
            />

        <div className="flex items-center justify-end gap-4">
                <button
            type="button"
            onClick={() => onCancel?.()}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            Cancelar
          </button>
               <button
            type="submit"
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
            </div>
        </form>
    );
}
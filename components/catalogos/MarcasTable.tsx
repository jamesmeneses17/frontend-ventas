"use client";

import React from "react";
// 🛑 Importar la interfaz Marca desde el servicio
import { Marca } from "../services/marcasService";
// 🛑 Asumo que ActionButtons es el componente que renderiza lápiz/basura
import ActionButton from "../common/ActionButton";

// 🛑 NOTA: Si usas un componente genérico llamado 'CrudTable', necesitaré su código para asegurarme
// de que los tipos son compatibles. Por ahora, asumiré que tienes un componente de tabla más simple
// o usaré la estructura que te proporcioné anteriormente, ya que el 'CrudTable' aquí parece ser un 
// componente no provisto en el contexto. Usaré la estructura de la tabla simple para evitar la dependencia.

interface MarcasTableProps {
    // 🛑 Usamos la interfaz Marca importada del servicio
    data: Marca[];
    loading: boolean; // Agregamos loading que es usada en el page.tsx
    // 🛑 onEdit debe recibir el objeto Marca completo para editar, no solo el ID
    onEdit: (marca: Marca) => void;
    onDelete: (id: number) => void;
}

export default function MarcasTable({ data, loading, onEdit, onDelete }: MarcasTableProps) {
    if (loading) {
        return <div className="text-center py-12 text-gray-500">Cargando marcas...</div>;
    }

    if (data.length === 0) {
        return <div className="text-center py-12 text-gray-500">No se encontraron marcas.</div>;
    }
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOMBRE</th>
                        {/* 🛑 Eliminamos la columna de DESCRIPCIÓN */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTADO</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ACCIONES</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((marca) => (
                        <tr key={marca.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{marca.nombre}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {/* 🛑 Accedemos al nombre del estado anidado */}
                                {marca.estado.nombre}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                <ActionButton
                                    icon="edit"
                                    label="Editar"
                                    onClick={() => onEdit(marca)}
                                />
                                <ActionButton
                                    icon="delete"
                                    label="Eliminar"
                                    onClick={() => onDelete(marca.id)}
                                    color="danger"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
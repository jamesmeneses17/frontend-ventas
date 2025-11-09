// components/precios/PreciosTable.tsx
"use client";

import React from "react";
import CrudTable from "../common/CrudTable";
import ActionButton from "../common/ActionButton";
import { PrecioConProducto } from "../services/preciosService"; // 🔑 Importamos el tipo específico
import { Trash, Pencil } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

// Interfaces de soporte
interface Props {
    data: PrecioConProducto[];
    loading?: boolean;
    onEdit: (precio: PrecioConProducto) => void;
    onDelete: (id: number) => void;
}

export default function PreciosTable({ data, loading, onEdit, onDelete }: Props) {
    // Función de ayuda para determinar la clase de estilo según el estado (Normal/Promoción)
    const getEstadoPrecioClasses = (estado: string) => {
        switch (estado) {
            case "En Promoción":
        return "bg-[#00c951] text-white px-3 py-1 rounded-full text-sm font-semibold";
            case "Normal":
return "bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold";            default:
                return "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold";
        }
    };

    const columns = [
        {
            key: "producto.codigo",
            label: "Código",
            render: (row: PrecioConProducto) => row.producto?.codigo || "N/A",
        },
        {
            key: "producto.nombre",
            label: "Producto",
            render: (row: PrecioConProducto) => row.producto?.nombre || "N/A",
        },
        {
            key: "producto.precio",
            label: "Costo",
            render: (row: PrecioConProducto) => (
                <span className="font-semibold text-gray-700">
                    {formatCurrency(Number(((row.producto as any)?.precio) ?? row.valor_unitario ?? 0))}
                </span>
            ),
        },
        {
            key: "valor_unitario",
            label: "Precio Base",
            render: (row: PrecioConProducto) => (
                <span className="font-semibold text-gray-700">{formatCurrency(row.valor_unitario)}</span>
            ),
        },
        {
            key: "descuento_porcentaje",
            label: "Desc. (%)",
            render: (row: PrecioConProducto) => {
                const descuentoNum =
                    Number(row.descuento_porcentaje ?? 0) ||
                    (row.valor_unitario ? Math.round((1 - Number(row.valor_final || 0) / Number(row.valor_unitario || 1)) * 100) : 0);
                const clase = descuentoNum > 0 ? "font-bold text-red-600" : "text-gray-500";
                return <span className={clase}>{descuentoNum}%</span>;
            },
        },
        {
            key: "valor_final",
            label: "Precio Final",
            render: (row: PrecioConProducto) => (
                <span className="font-bold text-xl text-blue-600">{formatCurrency(row.valor_final)}</span>
            ),
        },
        {
            key: "estado",
            label: "Estado",
            render: (row: PrecioConProducto) => {
                const descuentoNum =
                    Number(row.descuento_porcentaje ?? 0) ||
                    (row.valor_unitario ? Math.round((1 - Number(row.valor_final || 0) / Number(row.valor_unitario || 1)) * 100) : 0);
                const estadoLabel = descuentoNum > 0 ? "En Promoción" : "Normal";
                return <span className={`inline-flex items-center ${getEstadoPrecioClasses(estadoLabel)}`}>{estadoLabel}</span>;
            },
        },
    ];

    return (
        <CrudTable
            columns={columns}
            data={data}
            loading={loading}
            renderRowActions={(row: PrecioConProducto) => (
                <div className="flex items-center justify-end gap-2">
                    <ActionButton icon={<Pencil className="w-4 h-4" />} onClick={() => onEdit(row)} />
                    {row.id && Number(row.id) > 0 && (
                        <ActionButton icon={<Trash className="w-4 h-4" />} onClick={() => onDelete(row.id)} color="danger" />
                    )}
                </div>
            )}
        />
    );
}
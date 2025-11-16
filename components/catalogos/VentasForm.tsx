"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { getProductos, Producto } from "../services/productosService";
import { getClientes } from "../services/clientesServices";
import { CreateVentaDTO } from "../services/ventasService";

import { formatCurrency } from "../../utils/formatters";

type FormData = {
    id?: number;
    productoId: number;
    clienteId: number;
    cantidad: number;
    precio_unitario: number;
    precio_total: number;
    fecha_venta: string;
    observacion?: string;
};

interface Props {
    initialData?: Partial<FormData> | null;
    onSubmit: (data: CreateVentaDTO) => void;
    onCancel: () => void;
    formError?: string;
}

export default function VentasForm({
    initialData,
    onSubmit,
    onCancel,
    formError,
}: Props) {
    const {
        handleSubmit,
        formState: { isSubmitting },
        setValue,
        watch,
        reset,
    } = useForm<FormData>({
        defaultValues: {
            id: initialData?.id,
            productoId: initialData?.productoId ?? 0,
            clienteId: initialData?.clienteId ?? 0,
            cantidad: initialData?.cantidad ?? 1,
            precio_unitario: initialData?.precio_unitario ?? 0,
            precio_total: initialData?.precio_total ?? 0,
            fecha_venta:
                initialData?.fecha_venta ??
                new Date().toISOString().substring(0, 10),
            observacion: initialData?.observacion ?? "",
        },
    });

    const formValues = watch();

    const [productos, setProductos] = useState<Producto[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loadingLookups, setLoadingLookups] = useState(false);

    // 🔎 Cargar productos y clientes
    useEffect(() => {
        const loadLookups = async () => {
            setLoadingLookups(true);
            try {
                const listProd = await getProductos(1, 100, "", "");
                const productosList = Array.isArray(listProd)
                    ? listProd
                    : listProd?.data ?? [];

                const listCli = await getClientes(1, 100, "", "");
                const clientesList = Array.isArray(listCli)
                    ? listCli
                    : listCli?.data ?? [];

                setProductos(productosList);
                setClientes(clientesList);

                reset({
                    id: initialData?.id,
                    productoId:
                        initialData?.productoId ??
                        (productosList[0]?.id || 0),
                    clienteId:
                        initialData?.clienteId ??
                        (clientesList[0]?.id || 0),
                    cantidad: initialData?.cantidad ?? 1,
                    precio_unitario: initialData?.precio_unitario ?? 0,
                    precio_total: initialData?.precio_total ?? 0,
                    fecha_venta:
                        initialData?.fecha_venta ??
                        new Date().toISOString().substring(0, 10),
                    observacion: initialData?.observacion ?? "",
                });
            } finally {
                setLoadingLookups(false);
            }
        };

        loadLookups();
    }, [initialData, reset]);

    // 📌 Calcular precio_total en vivo
    useEffect(() => {
        const total =
            Number(formValues.cantidad || 0) *
            Number(formValues.precio_unitario || 0);
        setValue("precio_total", total);
    }, [formValues.cantidad, formValues.precio_unitario]);

    // 📌 Control universal de cambios
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;

        // 💰 Formateo automático para precio_unitario
        if (name === "precio_unitario") {
            let cleaned = String(value).replace(/[^0-9.,-]/g, "");
            cleaned = cleaned.replace(/,/g, ".");
            const parsed = parseFloat(cleaned || "0");
            setValue(name as keyof FormData, Number.isNaN(parsed) ? 0 : parsed, {
                shouldValidate: true,
            });
            return;
        }

        const parsed =
            type === "number" || name === "productoId" || name === "clienteId"
                ? Number(value)
                : value;

        setValue(name as keyof FormData, parsed, { shouldValidate: true });
    };

    const submitForm: SubmitHandler<FormData> = (data) => {
        const productoSel = productos.find((p) => p.id === Number(data.productoId));
        if (!productoSel) throw new Error("Selecciona un producto válido.");

        const clienteSel = clientes.find((c) => c.id === Number(data.clienteId));
        if (!clienteSel) throw new Error("Selecciona un cliente válido.");

        const payload: CreateVentaDTO = {
            fecha: data.fecha_venta ? new Date(data.fecha_venta).toISOString() : new Date().toISOString(),
            producto_id: Number(data.productoId),
            cliente_id: Number(data.clienteId),
            cantidad: Math.max(1, Number(data.cantidad) || 0),
            precio_unitario: Number(String(data.precio_unitario).replace(/[^0-9.\-]/g, "")) || 0,
        };

        onSubmit(payload);
    };

    const productoOptions = productos.map((p) => ({
        value: String(p.id),
        label: `${p.codigo} - ${p.nombre}`,
    }));

    const clienteOptions = clientes.map((c) => ({
        value: String(c.id),
        label: `${c.nombre} ${c.apellido ?? ""} (${c.documento})`,
    }));

    return (
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
            {/* ===================== FILA 1 ===================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormSelect
                    label="Producto"
                    name="productoId"
                    value={String(formValues.productoId)}
                    onChange={handleChange}
                    options={productoOptions}
                    disabled={loadingLookups}
                    required
                />

                <FormSelect
                    label="Cliente"
                    name="clienteId"
                    value={String(formValues.clienteId)}
                    onChange={handleChange}
                    options={clienteOptions}
                    disabled={loadingLookups}
                    required
                />

                <FormInput
                    label="Cantidad"
                    name="cantidad"
                    type="number"
                    value={String(formValues.cantidad)}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* ===================== FILA 2 ===================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Precio Unitario"
                    name="precio_unitario"
                    type="text"
                    value={formatCurrency(formValues.precio_unitario)}
                    onChange={handleChange}
                    placeholder="$50,000"
                    required
                />

                <FormInput
                    label="Precio Total"
                    name="precio_total"
                    type="text"
                    value={formatCurrency(formValues.precio_total)}
                    disabled
                />
            </div>

            {/* ===================== FILA 3 ===================== */}
            <FormInput
                label="Fecha de Venta"
                name="fecha_venta"
                type="date"
                value={formValues.fecha_venta}
                onChange={handleChange}
                required
            />

            <FormInput
                label="Observación (Opcional)"
                name="observacion"
                type="textarea"
                value={formValues.observacion}
                onChange={handleChange}
            />

            {/* ===================== BOTONES ===================== */}
            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting || loadingLookups}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || loadingLookups}>
                    {initialData?.id ? "Actualizar Venta" : "Registrar Venta"}
                </Button>
            </div>

            {formError && (
                <div className="text-red-600 text-sm mt-2 text-center">
                    {formError}
                </div>
            )}
        </form>
    );
}

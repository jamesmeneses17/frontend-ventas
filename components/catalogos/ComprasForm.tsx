"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { getProductos, Producto } from "../services/productosService";
import { CreateCompraDTO } from "../services/comprasService";
import { formatCurrency } from "../../utils/formatters";

type FormData = {
    id?: number;
    productoId: number;
    cantidad: number;
    costo_unitario: number;
    costo_total: number;
    fecha_compra: string;
    observacion?: string;
};

interface Props {
    initialData?: Partial<FormData> | null;
    onSubmit: (data: CreateCompraDTO) => void;
    onCancel: () => void;
    formError?: string;
}

export default function ComprasForm({
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
            cantidad: initialData?.cantidad ?? 1,
            costo_unitario: initialData?.costo_unitario ?? 0,
            costo_total: initialData?.costo_total ?? 0,
            fecha_compra:
                initialData?.fecha_compra ??
                new Date().toISOString().substring(0, 10),
            observacion: initialData?.observacion ?? "",
        },
    });

    const formValues = watch();

    const [productos, setProductos] = useState<Producto[]>([]);
    const [loadingLookups, setLoadingLookups] = useState(false);

    // 🔎 Cargar productos
    useEffect(() => {
        const loadProductos = async () => {
            setLoadingLookups(true);
            try {
                const list = await getProductos(1, 100, "", "");
                const productosList = Array.isArray(list)
                    ? list
                    : list?.data ?? [];

                setProductos(productosList);

                reset({
                    id: initialData?.id,
                    productoId:
                        initialData?.productoId ??
                        (productosList[0]?.id || 0),
                    cantidad: initialData?.cantidad ?? 1,
                    costo_unitario: initialData?.costo_unitario ?? 0,
                    costo_total: initialData?.costo_total ?? 0,
                    fecha_compra:
                        initialData?.fecha_compra ??
                        new Date().toISOString().substring(0, 10),
                    observacion: initialData?.observacion ?? "",
                });
            } finally {
                setLoadingLookups(false);
            }
        };

        loadProductos();
    }, [initialData, reset]);

    // 📌 Calcular costo_total en vivo
    useEffect(() => {
        const total =
            Number(formValues.cantidad || 0) *
            Number(formValues.costo_unitario || 0);
            setValue("costo_total", total);
        }, [formValues.cantidad, formValues.costo_unitario, setValue]);

    // 📌 Control universal de cambios
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;

        // 💰 Formateo automático para costo_unitario
        if (name === "costo_unitario") {
            // Permitir decimales (p. ej. 2222.50) y aceptar entradas con comas o símbolos.
            // 1) Eliminar caracteres que no sean dígitos, punto o coma
            let cleaned = String(value).replace(/[^0-9.,-]/g, "");
            // 2) Reemplazar coma por punto para parseFloat
            cleaned = cleaned.replace(/,/g, ".");
            const parsed = parseFloat(cleaned || "0");
            setValue(name as keyof FormData, Number.isNaN(parsed) ? 0 : parsed, {
                shouldValidate: true,
            });
            return;
        }

        const parsed =
            type === "number" || name === "productoId"
                ? Number(value)
                : value;

        setValue(name as keyof FormData, parsed, { shouldValidate: true });
    };

    const submitForm: SubmitHandler<FormData> = (data) => {
        // Buscar producto seleccionado para obtener categoria
        const productoSel = productos.find((p) => p.id === Number(data.productoId));
        if (!productoSel) {
            // No debería ocurrir (select obliga a elegir), pero prevenir envío inválido
            throw new Error("Selecciona un producto válido antes de enviar la compra.");
        }

        // Construir payload mínimo tal como pide el backend: fecha, producto_id, cantidad, costo_unitario
        const payload: any = {
            fecha: data.fecha_compra ? new Date(data.fecha_compra).toISOString() : new Date().toISOString(),
            producto_id: Number(data.productoId),
            cantidad: Math.max(1, Number(data.cantidad) || 0),
            // Asegurar número puro (permitir decimales)
            costo_unitario: Number(String(data.costo_unitario).replace(/[^0-9.\-]/g, "")) || 0,
        };

        onSubmit(payload as CreateCompraDTO);
    };

    const productoOptions = productos.map((p) => ({
        value: String(p.id),
        label: `${p.codigo} - ${p.nombre}`,
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

                <FormInput
                    label="Cantidad"
                    name="cantidad"
                    type="number"
                    value={String(formValues.cantidad)}
                    onChange={handleChange}
                    required
                />

                <FormInput
                    label="Costo Unitario"
                    name="costo_unitario"
                    type="text"
                    value={formatCurrency(formValues.costo_unitario)}
                    onChange={handleChange}
                    placeholder="$50,000"
                    required
                />
            </div>

            {/* ===================== FILA 2 ===================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Costo Total"
                    name="costo_total"
                    type="text"
                    value={formatCurrency(formValues.costo_total)}
                    disabled
                />

                <FormInput
                    label="Fecha de Compra"
                    name="fecha_compra"
                    type="date"
                    value={formValues.fecha_compra}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* ===================== FILA 3 ===================== */}
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
                <Button
                    type="submit"
                    disabled={isSubmitting || loadingLookups}
                >
                    {initialData?.id ? "Actualizar Compra" : "Registrar Compra"}
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

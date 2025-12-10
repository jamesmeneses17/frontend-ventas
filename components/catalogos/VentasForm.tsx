"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { getProductos, Producto } from "../services/productosService";
import { Cliente, getClientes } from "../services/clientesServices";
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
    const [productoSearchTerm, setProductoSearchTerm] = useState("");

    // 🔎 Cargar productos y clientes
    useEffect(() => {
        const loadLookups = async () => {
            setLoadingLookups(true);
            try {
                const listProd = await getProductos(1, 100, "", "");
                const productosList = Array.isArray(listProd)
                    ? listProd
                    : listProd?.data ?? [];

                const listCli = await getClientes("", 1, 100);
                const clientesList = Array.isArray(listCli) ? listCli : listCli ?? [];

                setProductos(productosList);
                setClientes(clientesList);

                reset({
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
                });
            } finally {
                setLoadingLookups(false);
            }
        };

        loadLookups();
    }, [initialData, reset]);

    // 🔄 Buscar productos y autoseleccionar con precio
    useEffect(() => {
        const term = productoSearchTerm.trim();
        if (!term) return;

        const normalized = term.toLowerCase();
        const exactLocal = productos.find((p) => p.codigo?.toLowerCase() === normalized);
        const partialLocal = productos.find((p) => p.codigo?.toLowerCase().startsWith(normalized));
        const localTarget = exactLocal || partialLocal;
        
        if (localTarget) {
            setValue("productoId", localTarget.id, { shouldValidate: true });
            // Auto-rellenar precio de venta del producto
            const precioVenta = Number(
                (localTarget as any).precio_venta ?? 
                (localTarget as any).precioVenta ?? 
                localTarget.precio ?? 
                0
            );
            setValue("precio_unitario", precioVenta, { shouldValidate: true });
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await getProductos(1, 10, "", term);
                const list = Array.isArray(res) ? res : res?.data ?? [];

                if (list.length > 0) {
                    setProductos((prev) => {
                        const merged = [...prev];
                        list.forEach((item: any) => {
                            if (!merged.some((p) => p.id === item.id)) {
                                merged.push(item);
                            }
                        });
                        return merged;
                    });

                    const exact = list.find((p: any) => p.codigo?.toLowerCase() === normalized);
                    const partial = list.find((p: any) => p.codigo?.toLowerCase().startsWith(normalized));
                    const target = exact || partial || list[0];
                    
                    if (target) {
                        setValue("productoId", target.id, { shouldValidate: true });
                        const precioVenta = Number(
                            (target as any).precio_venta ?? 
                            (target as any).precioVenta ?? 
                            target.precio ?? 
                            0
                        );
                        setValue("precio_unitario", precioVenta, { shouldValidate: true });
                    }
                }
            } catch (err) {
                console.error("Error buscando producto por código", err);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [productoSearchTerm, productos, setValue]);

    // 📌 Calcular precio_total en vivo
    useEffect(() => {
        const total =
            Number(formValues.cantidad || 0) *
            Number(formValues.precio_unitario || 0);
            setValue("precio_total", total);
        }, [formValues.cantidad, formValues.precio_unitario, setValue]);

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

        // Sincronizar búsqueda y autocompletar precio al seleccionar producto
        if (name === "productoId") {
            const selected = productos.find((p) => p.id === Number(value));
            if (selected) {
                if (selected.codigo) setProductoSearchTerm(selected.codigo);
                const precioVenta = Number(
                    (selected as any).precio_venta ?? 
                    (selected as any).precioVenta ?? 
                    selected.precio ?? 
                    0
                );
                setValue("precio_unitario", precioVenta, { shouldValidate: true });
            }
        }
    };

    const submitForm: SubmitHandler<FormData> = (data) => {
        const productoSel = productos.find((p) => p.id === Number(data.productoId));
        if (!productoSel || !data.productoId || data.productoId === 0) {
            throw new Error("Selecciona un producto válido antes de registrar la venta.");
        }

        // Validar stock disponible
        const stockDisponible = Number(productoSel.stock ?? 0);
        const cantidadVenta = Number(data.cantidad) || 0;

        if (cantidadVenta > stockDisponible) {
            throw new Error(
                `Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${cantidadVenta}`
            );
        }

        if (stockDisponible <= 0) {
            throw new Error("No hay stock disponible para este producto.");
        }

        const precioVenta = Number(data.precio_unitario) || 0;
        const costoCosto = Number((productoSel as any).precio_costo ?? 0);

        console.log("[VentasForm] Submit payload:", {
            fecha: data.fecha_venta,
            productoId: Number(data.productoId),
            cantidad: Number(data.cantidad),
            costo_unitario: costoCosto,
            precio_venta: precioVenta,
            stockDisponible,
        });

        const payload: CreateVentaDTO = {
            fecha: data.fecha_venta ? new Date(data.fecha_venta).toISOString() : new Date().toISOString(),
            productoId: Number(data.productoId),
            cantidad: Math.max(1, cantidadVenta),
            costo_unitario: costoCosto,
            precio_venta: precioVenta,
        };

        onSubmit(payload);
    };

    const productosFiltrados = productos.filter((p) => {
        const searchLower = productoSearchTerm.toLowerCase();
        return (
            p.codigo?.toLowerCase().includes(searchLower) ||
            p.nombre?.toLowerCase().includes(searchLower)
        );
    });

    const productoOptionsFiltered = productosFiltrados.map((p) => ({
        value: String(p.id),
        label: `${p.codigo} - ${p.nombre}`,
    }));

    // Obtener producto seleccionado y su stock
    const productoSeleccionado = productos.find((p) => p.id === Number(formValues.productoId));
    const stockDisponible = Number(productoSeleccionado?.stock ?? 0);
    const cantidadSolicitada = Number(formValues.cantidad) || 0;
    const stockInsuficiente = cantidadSolicitada > stockDisponible;

    return (
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
            {/* ===================== BÚSQUEDA + SELECCIÓN ===================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Buscar Producto por Código o Nombre"
                    name="productoSearch"
                    value={productoSearchTerm}
                    onChange={(e) => setProductoSearchTerm(e.target.value)}
                    placeholder="Ej: LC209 o Teclado..."
                />

                <FormSelect
                    label="Producto"
                    name="productoId"
                    value={String(formValues.productoId)}
                    onChange={handleChange}
                    options={productoOptionsFiltered}
                    disabled={loadingLookups}
                    required
                />
            </div>

            {/* ===================== ALERTA DE STOCK ===================== */}
            {productoSeleccionado && (
                <div className={`p-3 rounded-md text-sm ${
                    stockDisponible <= 0 
                        ? 'bg-red-50 border border-red-300 text-red-800'
                        : stockInsuficiente
                        ? 'bg-yellow-50 border border-yellow-300 text-yellow-800'
                        : 'bg-blue-50 border border-blue-300 text-blue-800'
                }`}>
                    <strong>Stock disponible:</strong> {stockDisponible} unidades
                    {stockInsuficiente && cantidadSolicitada > 0 && (
                        <span className="ml-2 font-semibold">
                             Cantidad solicitada ({cantidadSolicitada}) excede el stock
                        </span>
                    )}
                </div>
            )}

            {/* ===================== FILA 1: CANTIDAD Y PRECIO ===================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Cantidad"
                    name="cantidad"
                    type="number"
                    value={String(formValues.cantidad)}
                    onChange={handleChange}
                    required
                />

                <FormInput
                    label="Precio de Venta (Unitario)"
                    name="precio_unitario"
                    type="text"
                    value={formatCurrency(formValues.precio_unitario)}
                    disabled
                />
            </div>

            {/* ===================== FILA 2: TOTAL Y FECHA ===================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Total Venta"
                    name="precio_total"
                    type="text"
                    value={formatCurrency(formValues.precio_total)}
                    disabled
                />

                <FormInput
                    label="Fecha de Venta"
                    name="fecha_venta"
                    type="date"
                    value={formValues.fecha_venta}
                    onChange={handleChange}
                    required
                />
            </div>

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

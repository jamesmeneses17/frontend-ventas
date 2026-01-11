"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";

import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { getProductos, Producto } from "../services/productosService";
import { getClientes, Cliente } from "../services/clientesServices";
import { CreateVentaDTO } from "../services/ventasService";
import { formatCurrency } from "../../utils/formatters";

type FormData = {
    fecha_venta: string;
    clienteId: string;
    productoId: string;
    cantidad: number;
    precio_unitario: number;
    productoSearch: string;
    clienteSearch: string;
};

interface Props {
    initialData?: any;
    onSubmit: (data: CreateVentaDTO) => Promise<any> | void;
    onCancel: () => void;
    onSuccess?: () => void;
    formError?: string;
}

export default function VentasForm({
    initialData,
    onSubmit,
    onCancel,
    onSuccess,
    formError,
}: Props) {
    const {
        handleSubmit,
        watch,
        setValue,
        formState: { isSubmitting },
    } = useForm<FormData>({
        defaultValues: {
            fecha_venta: new Date().toISOString().substring(0, 10),
            clienteId: "",
            productoId: "",
            cantidad: 1,
            precio_unitario: 0,
            productoSearch: "",
            clienteSearch: "",
        },
    });

    const formValues = watch();

    const [productos, setProductos] = useState<Producto[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [loadingLookups, setLoadingLookups] = useState(false);

    // Estado para el buscador de productos
    const [productoSearchTerm, setProductoSearchTerm] = useState("");
    // Estado para el buscador de clientes
    const [clienteSearchTerm, setClienteSearchTerm] = useState("");
    const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);

    const clienteInputRef = useRef<HTMLDivElement>(null);

    // 🔄 Cargar productos iniciales y clientes
    useEffect(() => {
        const loadData = async () => {
            setLoadingLookups(true);
            try {
                const prodRes = await getProductos(1, 100);
                const cliRes = await getClientes("", 1, 100);

                const loadedProducts = Array.isArray(prodRes) ? prodRes : prodRes?.data ?? [];
                setProductos(loadedProducts);

                // Fix: cliRes is Cliente[], so just check array
                const loadedClientes = Array.isArray(cliRes) ? cliRes : [];
                setClientes(loadedClientes);
                setFilteredClientes(loadedClientes);
            } catch (err) {
                console.error("Error cargando datos iniciales", err);
            } finally {
                setLoadingLookups(false);
            }
        };

        loadData();
    }, []);

    // 📝 Cargar datos iniciales si es edición
    useEffect(() => {
        if (initialData) {
            if (initialData.fecha) {
                setValue("fecha_venta", String(initialData.fecha).split('T')[0]);
            }
            if (initialData.cliente) {
                setValue("clienteId", String(initialData.cliente.id));
                setClienteSearchTerm(initialData.cliente.nombre);
            } else if (initialData.clienteId) {
                setValue("clienteId", String(initialData.clienteId));
            }

            if (initialData.detalles && Array.isArray(initialData.detalles)) {
                const mappedCart = initialData.detalles.map((det: any) => ({
                    producto_id: det.producto?.id || det.productoId,
                    nombre: det.producto?.nombre || "Producto",
                    codigo: det.producto?.codigo || "",
                    cantidad: Number(det.cantidad),
                    precio_unitario: Number(det.precio_venta),
                    subtotal: Number(det.cantidad) * Number(det.precio_venta),
                }));
                setCart(mappedCart);
            }
        }
    }, [initialData, setValue]);

    // Sincronizar nombre cliente si solo tenemos ID
    useEffect(() => {
        if (initialData?.clienteId && clientes.length > 0 && !clienteSearchTerm) {
            const found = clientes.find(c => String(c.id) === String(initialData.clienteId));
            if (found) setClienteSearchTerm(found.nombre);
        }
    }, [clientes, initialData, clienteSearchTerm]);

    // Cerrar sugerencias al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (clienteInputRef.current && !clienteInputRef.current.contains(event.target as Node)) {
                setShowClienteSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 🔍 Filtro Clientes
    useEffect(() => {
        const term = clienteSearchTerm.toLowerCase();
        if (!term) {
            setFilteredClientes(clientes);
            return;
        }
        const filtered = clientes.filter(c =>
            c.nombre.toLowerCase().includes(term) ||
            c.numero_documento?.includes(term)
        );
        setFilteredClientes(filtered);
        setShowClienteSuggestions(true);
    }, [clienteSearchTerm, clientes]);

    // 🔍 Búsqueda Productos
    useEffect(() => {
        const timer = setTimeout(async () => {
            const term = productoSearchTerm.trim();
            if (!term) return;

            // 1. Local
            const normalized = term.toLowerCase();
            const exactLocal = productos.find(p => p.codigo?.toLowerCase() === normalized);
            if (exactLocal) {
                setValue("productoId", String(exactLocal.id));
                updatePrice(exactLocal);
            }

            // 2. API
            try {
                const res = await getProductos(1, 20, "", term);
                const list = Array.isArray(res) ? res : res?.data ?? [];

                if (list.length > 0) {
                    setProductos(prev => {
                        const map = new Map(prev.map(p => [p.id, p]));
                        list.forEach((p: Producto) => map.set(p.id, p));
                        return Array.from(map.values());
                    });

                    // Autoselect
                    if (!formValues.productoId) {
                        const exact = list.find(p => p.codigo?.toLowerCase() === normalized);
                        if (exact) {
                            setValue("productoId", String(exact.id));
                            updatePrice(exact);
                        }
                    }
                }
            } catch (e) { console.error(e); }
        }, 500);

        return () => clearTimeout(timer);
    }, [productoSearchTerm, setValue]);

    const updatePrice = (prod: Producto) => {
        const precioBase = Number((prod as any).precio_venta ?? prod.precio ?? 0);
        const promo = Number((prod as any).promocion_porcentaje ?? 0);
        const final = promo > 0 ? precioBase - (precioBase * promo / 100) : precioBase;
        setValue("precio_unitario", final);
    };

    const handleProductoSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setValue("productoId", val);
        const prod = productos.find(p => String(p.id) === val);
        if (prod) {
            setProductoSearchTerm(prod.codigo || prod.nombre);
            updatePrice(prod);
        }
    };

    const selectCliente = (c: Cliente) => {
        setValue("clienteId", String(c.id));
        setClienteSearchTerm(c.nombre);
        setShowClienteSuggestions(false);
    };

    const addToCart = () => {
        if (!formValues.productoId) return;

        const prod = productos.find(p => String(p.id) === formValues.productoId);
        if (!prod) return;

        if (formValues.cantidad <= 0) return alert("Cantidad inválida");
        if (formValues.precio_unitario < 0) return alert("Precio inválido");

        // Validar Stock
        const stock = Number(prod.stock || 0);
        const inCart = cart.find(x => x.producto_id === prod.id);
        const currentQty = inCart ? inCart.cantidad : 0;

        if (currentQty + formValues.cantidad > stock) {
            return alert(`Stock insuficiente. Disponible: ${stock}`);
        }

        const item = {
            producto_id: prod.id,
            nombre: prod.nombre,
            codigo: prod.codigo,
            cantidad: Number(formValues.cantidad),
            precio_unitario: Number(formValues.precio_unitario),
            subtotal: Number(formValues.cantidad) * Number(formValues.precio_unitario)
        };

        setCart(prev => {
            const exists = prev.find(p => p.producto_id === item.producto_id);
            if (exists) {
                return prev.map(p => p.producto_id === item.producto_id ? {
                    ...p,
                    cantidad: p.cantidad + item.cantidad,
                    subtotal: (p.cantidad + item.cantidad) * p.precio_unitario
                } : p);
            }
            return [...prev, item];
        });

        // Reset fields
        setValue("productoId", "");
        setValue("cantidad", 1);
        setValue("precio_unitario", 0);
        setProductoSearchTerm("");
    };

    const removeItem = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const submitForm = (data: FormData) => {
        if (!data.clienteId) return alert("Selecciona un cliente");
        if (cart.length === 0) return alert("Carrito vacío");

        const payload: CreateVentaDTO = {
            fecha: data.fecha_venta,
            clienteId: Number(data.clienteId),
            items: cart.map(item => ({
                productoId: item.producto_id,
                cantidad: item.cantidad,
                precio_venta: item.precio_unitario
            }))
        };

        const res = onSubmit(payload);
        if (res instanceof Promise) res.then(onSuccess);
        else if (onSuccess) onSuccess();
    };

    const totalVenta = cart.reduce((acc, item) => acc + item.subtotal, 0);

    const productosOpciones = productos.filter(p => {
        if (!productoSearchTerm) return true;
        const term = productoSearchTerm.toLowerCase();
        return p.codigo?.toLowerCase().includes(term) || p.nombre?.toLowerCase().includes(term);
    }).map(p => ({
        value: String(p.id),
        label: `${p.codigo} - ${p.nombre}`
    }));

    return (
        <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ===================== CLIENTE (AUTOCOMPLETE) ===================== */}
                <div className="relative" ref={clienteInputRef}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente (Cédula o Nombre) *</label>
                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Buscar cliente..."
                        value={clienteSearchTerm}
                        onChange={(e) => {
                            setClienteSearchTerm(e.target.value);
                            setValue("clienteId", "");
                        }}
                        onFocus={() => setShowClienteSuggestions(true)}
                    />

                    {showClienteSuggestions && filteredClientes.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                            {filteredClientes.map(c => (
                                <div
                                    key={c.id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-0"
                                    onClick={() => selectCliente(c)}
                                >
                                    <div className="font-bold text-gray-800">{c.nombre}</div>
                                    <div className="text-xs text-gray-500">
                                        CC: {c.numero_documento}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <input type="hidden" name="clienteId" value={formValues.clienteId} />
                </div>

                {/* ===================== FECHA ===================== */}
                <FormInput
                    label="Fecha de Venta"
                    type="date"
                    name="fecha_venta"
                    value={formValues.fecha_venta}
                    onChange={(e) => setValue("fecha_venta", e.target.value)}
                    required
                />
            </div>

            {/* ===================== AGREGAR PRODUCTO ===================== */}
            <div className="border p-4 rounded-md bg-gray-50 space-y-4">
                <h3 className="font-semibold text-gray-700">Agregar producto</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Buscar Producto (Código o Nombre)"
                        name="productoSearch"
                        value={productoSearchTerm}
                        onChange={(e) => setProductoSearchTerm(e.target.value)}
                        placeholder="Escribe para buscar..."
                    />

                    <FormSelect
                        label="Producto *"
                        name="productoId"
                        value={formValues.productoId}
                        onChange={handleProductoSelectChange}
                        options={productosOpciones}
                        disabled={loadingLookups}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <FormInput
                        label="Cantidad *"
                        type="number"
                        name="cantidad"
                        value={String(formValues.cantidad)}
                        onChange={(e) => setValue("cantidad", Number(e.target.value))}
                    />
                </div>

                <Button type="button" onClick={addToCart}>
                    Agregar a la lista
                </Button>
            </div>

            {/* ===================== CARRITO ===================== */}
            {cart.length > 0 && (
                <div className="space-y-3">
                    <table className="w-full text-sm border bg-white rounded-md shadow-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">Código</th>
                                <th className="p-2 text-left">Producto</th>
                                <th className="p-2 text-center">Cantidad</th>
                                <th className="p-3 text-right">Subtotal</th>
                                <th className="p-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, i) => (
                                <tr key={i} className="border-t">
                                    <td className="p-2">{item.codigo}</td>
                                    <td className="p-2">{item.nombre}</td>
                                    <td className="p-2 text-center">{item.cantidad}</td>
                                    <td className="p-3 text-right font-medium">
                                        {formatCurrency(item.subtotal)}
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            type="button"
                                            className="text-red-500 hover:text-red-700 text-xs font-semibold"
                                            onClick={() => removeItem(i)}
                                        >
                                            Quitar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="text-right font-bold text-xl text-gray-800 mt-2">
                        Total Venta: <span className="text-green-600">{formatCurrency(totalVenta)}</span>
                    </div>
                </div>
            )}

            {/* ===================== BOTONES ===================== */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-600">
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar Venta"}
                </Button>
            </div>

            {formError && (
                <div className="text-red-600 text-sm text-center font-medium bg-red-50 p-2 rounded-md border border-red-200">
                    {formError}
                </div>
            )}
        </form>
    );
}

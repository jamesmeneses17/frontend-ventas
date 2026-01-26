// components/services/ventasService.ts
import axios from "axios";
import { API_URL } from "./apiConfig";
const ENDPOINT_BASE = `${API_URL}/ventas`;

// ------------------------------------------------------
// Interfaces
// ------------------------------------------------------
export interface VentaDetalle {
    id?: number;
    productoId: number;
    cantidad: number;
    costo_unitario?: number; // Added back
    precio_venta: number;
    subtotal?: number;
    producto?: any; // Para mostrar nombre en tabla
}

export interface Venta {
    id: number;
    fecha: string;
    clienteId: number;
    total: number;

    // Relaciones
    cliente?: any;
    detalles?: VentaDetalle[];
}

export interface CreateVentaDTO {
    fecha: string;
    clienteId: number;
    items: {
        productoId: number;
        cantidad: number;
        // costo_unitario will be handled by backend, but we can keep it here if needed for optimistic UI. 
        // For CreateDTO usually we don't send it, backend fetches it.
        // Pero el user pidio revisar "frontend-ventas". El DTO de creacion NO manda costo.
        // Solo la interfaz de lectura VentaDetalle lo necesita.
        precio_venta: number;
    }[];
}

export interface UpdateVentaDTO extends Partial<CreateVentaDTO> { }

export interface PaginacionResponse<T> {
    data: T[];
    total: number;
}

// ------------------------------------------------------
// CRUD COMPLETO
// ------------------------------------------------------

/**
 * Obtener ventas con paginación y búsqueda.
 */
export const getVentas = async (
    page: number = 1,
    size: number = 10,
    search: string = ""
): Promise<PaginacionResponse<Venta>> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(size));
    if (search) params.append("search", search);

    const endpoint = `${ENDPOINT_BASE}?${params.toString()}`;

    try {
        const res = await axios.get(endpoint);
        let items = res.data;
        let ventas: Venta[] = [];
        let total = 0;

        if (items && Array.isArray(items.data)) {
            ventas = items.data;
            total = items.total || ventas.length;
        } else if (Array.isArray(items)) {
            ventas = items;
            total = ventas.length;
        }

        return { data: ventas, total };
    } catch (err: any) {
        console.error("Error al obtener ventas:", err);
        throw err;
    }
};

export const getVentaById = async (id: number): Promise<Venta> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    try {
        const res = await axios.get(endpoint);
        return res.data as Venta;
    } catch (err: any) {
        console.error("[getVentaById] Error:", err);
        throw err;
    }
};

/**
 * Crear venta (Cabecera + Detalles).
 */
export const createVenta = async (data: CreateVentaDTO): Promise<Venta> => {
    const payload = {
        fecha: data.fecha,
        clienteId: Number(data.clienteId),
        items: data.items.map(item => ({
            productoId: Number(item.productoId),
            cantidad: Number(item.cantidad),
            precio_venta: Number(item.precio_venta)
        }))
    };

    console.log("[createVenta] POST Payload:", payload);

    try {
        const res = await axios.post(ENDPOINT_BASE, payload);
        return res.data as Venta;
    } catch (err: any) {
        console.error("[createVenta] Error:", err?.response?.data || err.message);
        throw err;
    }
};

export const updateVenta = async (id: number, data: UpdateVentaDTO): Promise<Venta> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    try {
        const res = await axios.patch(endpoint, data);
        return res.data as Venta;
    } catch (err: any) {
        console.error("[updateVenta] Error:", err);
        throw err;
    }
};

/**
 * Eliminar venta.
 */
export const deleteVenta = async (id: number): Promise<void> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    console.log("[deleteVenta] DELETE", endpoint);

    try {
        await axios.delete(endpoint);
    } catch (err: any) {
        console.error("[deleteVenta] Error:", err);
        throw err;
    }
};

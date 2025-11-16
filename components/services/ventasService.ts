// components/services/ventasService.ts
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
const ENDPOINT_BASE = `${API_URL}/ventas`;

// ------------------------------------------------------
// Interfaces
// ------------------------------------------------------
export interface Venta {
    id: number;
    fecha: string;

    productoId: number;
    cantidad: number;
    costo_unitario: number;
    precio_venta: number;

    // relaciones opcionales (si backend envía JOIN)
    producto?: any;
}

export interface CreateVentaDTO {
    fecha: string;
    productoId: number;
    cantidad: number;
    costo_unitario: number;
    precio_venta: number;
}

export interface UpdateVentaDTO extends Partial<CreateVentaDTO> {}

export interface PaginacionResponse<T> {
    data: T[];
    total: number;
}

// ------------------------------------------------------
// CRUD COMPLETO (MISMO FORMATO QUE comprasService)
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

    console.log("[getVentas] Endpoint:", endpoint);

    try {
        const res = await axios.get(endpoint);

        // Manejo de errores tipo body
        if (res.data && typeof res.data === "object" && (res.data.statusCode || res.data.status)) {
            const code = res.data.statusCode ?? res.data.status;
            if (code >= 400) {
                console.error("[getVentas] API error body", code, res.data);
                return { data: [], total: 0 };
            }
        }

        let items = res.data;
        let ventas: Venta[] = [];
        let total = 0;

        // Si backend usa paginación estilo NestJS
        if (items && Array.isArray(items.data)) {
            ventas = items.data;
            total = items.total || ventas.length;
        } 
        // Si backend devuelve array plano
        else if (Array.isArray(items)) {
            ventas = items;
            total = ventas.length;
        }

        return { data: ventas, total };
    } catch (err: any) {
        console.error("Error al obtener ventas:", err?.message ?? err, err?.response?.data ?? err);
        throw err;
    }
};

/**
 * Obtener una venta por ID.
 */
export const getVentaById = async (id: number): Promise<Venta> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    console.log("[getVentaById] GET", endpoint);

    try {
        const res = await axios.get(endpoint);
        return res.data as Venta;
    } catch (err: any) {
        console.error("[getVentaById] Error:", err);
        throw err;
    }
};

/**
 * Crear venta.
 */
export const createVenta = async (data: CreateVentaDTO): Promise<Venta> => {
    const payload = {
        fecha: data.fecha,
        productoId: Number(data.productoId),
        cantidad: Number(data.cantidad),
        costo_unitario: Number(String(data.costo_unitario).replace(/[^0-9.\-]/g, "")) || 0,
        precio_venta: Number(String(data.precio_venta).replace(/[^0-9.\-]/g, "")) || 0,
    };

    console.log("[createVenta] POST", ENDPOINT_BASE, payload);

    try {
        const res = await axios.post(ENDPOINT_BASE, payload);
        return res.data as Venta;
    } catch (err: any) {
        console.error("[createVenta] Error:", err?.message ?? err, err?.response?.data ?? err);
        throw err;
    }
};

/**
 * Actualizar venta.
 */
export const updateVenta = async (id: number, data: UpdateVentaDTO): Promise<Venta> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;

    console.log("[updateVenta] PATCH", endpoint, data);

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

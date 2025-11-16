// components/services/comprasService.ts
import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
const ENDPOINT_BASE = `${API_URL}/compras`;

// ------------------------------------------------------
// Interfaces de soporte
// ------------------------------------------------------
export interface Compra {
    id: number;
    codigo: string;
    fecha: string;

    producto_id: number;
    categoria_id: number;

    cantidad: number;
    costo_unitario: number;

    // relaciones opcionales (si el backend envía con join)
    producto?: any;
    categoria?: any;
}

export interface CreateCompraDTO {
    codigo: string;
    fecha: string;
    producto_id: number;
    categoria_id: number;
    cantidad: number;
    costo_unitario: number;
}

export interface UpdateCompraDTO extends Partial<CreateCompraDTO> {}

export interface PaginacionResponse<T> {
    data: T[];
    total: number;
}

// ------------------------------------------------------
// CRUD COMPLETO SIGUIENDO EL ESTILO DE productosService
// ------------------------------------------------------

/**
 * Obtener compras con paginación y filtros.
 */
export const getCompras = async (
    page: number = 1,
    size: number = 10,
    search: string = ""
): Promise<PaginacionResponse<Compra>> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(size));
    if (search) params.append("search", search);

    const endpoint = `${ENDPOINT_BASE}?${params.toString()}`;

    console.log("[getCompras] Endpoint:", endpoint);

    try {
        const res = await axios.get(endpoint);

        // Manejo de errores tipo body
        if (res.data && typeof res.data === "object" && (res.data.statusCode || res.data.status)) {
            const code = res.data.statusCode ?? res.data.status;
            if (code >= 400) {
                console.error("[getCompras] API error body", code, res.data);
                return { data: [], total: 0 };
            }
        }

        let items: any = res.data;
        let compras: Compra[] = [];
        let total = 0;

        // Si backend usa paginación estándar
        if (items && Array.isArray(items.data)) {
            compras = items.data;
            total = items.total || compras.length;
        } else if (Array.isArray(items)) {
            compras = items;
            total = compras.length;
        }

        return { data: compras, total };
    } catch (err: any) {
        console.error("Error al obtener compras:", err?.message ?? err, err?.response?.data ?? err);
        throw err;
    }
};

/**
 * Obtener 1 compra por ID.
 */
export const getCompraById = async (id: number): Promise<Compra> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    console.log("[getCompraById] GET", endpoint);

    try {
        const res = await axios.get(endpoint);
        return res.data as Compra;
    } catch (err: any) {
        console.error("[getCompraById] Error:", err);
        throw err;
    }
};

/**
 * Crear una compra.
 */
export const createCompra = async (data: CreateCompraDTO): Promise<Compra> => {
    console.log("[createCompra] POST", ENDPOINT_BASE, data);

    try {
        const res = await axios.post(ENDPOINT_BASE, data);
        return res.data as Compra;
    } catch (err: any) {
        console.error("[createCompra] Error:", err);
        throw err;
    }
};

/**
 * Actualizar compra.
 */
export const updateCompra = async (id: number, data: UpdateCompraDTO): Promise<Compra> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;

    console.log("[updateCompra] PATCH", endpoint, data);

    try {
        const res = await axios.patch(endpoint, data);
        return res.data as Compra;
    } catch (err: any) {
        console.error("[updateCompra] Error:", err);
        throw err;
    }
};

/**
 * Eliminar compra.
 */
export const deleteCompra = async (id: number): Promise<void> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    console.log("[deleteCompra] DELETE", endpoint);

    try {
        await axios.delete(endpoint);
    } catch (err: any) {
        console.error("[deleteCompra] Error:", err);
        throw err;
    }
};

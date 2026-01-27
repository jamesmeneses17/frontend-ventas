// components/services/comprasService.ts
import axios from "axios";
import { API_URL } from "./apiConfig";

const ENDPOINT_BASE = `${API_URL}/compras`;

// ------------------------------------------------------
// Interfaces de soporte
// ------------------------------------------------------

export interface CompraDetalle {
    id: number;
    compra_id: number;
    producto_id: number;
    cantidad: number;
    costo_unitario: number;
    subtotal: number;
    producto?: any; // Incluye datos del producto si el backend hace join
}

export interface Compra {
    id: number;
    fecha: string;
    cliente_id: number; // Ahora se relaciona con el contacto/proveedor
    total: number;      // Total calculado en la cabecera
    cliente?: any;      // Datos del proveedor vinculados
    detalles: CompraDetalle[]; // Lista de productos vinculados
}

export interface CreateCompraDetalleDTO {
    producto_id: number;
    cantidad: number;
    costo_unitario: number;
}

export interface CreateCompraDTO {
    fecha: string;
    cliente_id: number; // ID del proveedor
    items: CreateCompraDetalleDTO[]; // Arreglo de productos para multiproducto
}

export interface UpdateCompraDTO extends Partial<CreateCompraDTO> { }

export interface PaginacionResponse<T> {
    data: T[];
    total: number;
}

// ------------------------------------------------------
// CRUD COMPLETO
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

    try {
        const res = await axios.get(endpoint);

        // Manejo de respuesta con estructura de paginación
        let items: any = res.data;
        let compras: Compra[] = [];
        let total = 0;

        if (items && Array.isArray(items.data)) {
            compras = items.data;
            total = items.total || compras.length;
        } else if (Array.isArray(items)) {
            compras = items;
            total = compras.length;
        }

        return { data: compras, total };
    } catch (err: any) {
        console.error("Error al obtener compras:", err?.message ?? err);
        return { data: [], total: 0 };
    }
};

/**
 * Obtener 1 compra por ID con sus detalles.
 */
export const getCompraById = async (id: number): Promise<Compra> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    try {
        const res = await axios.get(endpoint);
        return res.data as Compra; // Retorna cabecera y detalles
    } catch (err: any) {
        console.error("[getCompraById] Error:", err);
        throw err;
    }
};

/**
 * Crear una compra multiproducto.
 */
export const createCompra = async (data: CreateCompraDTO): Promise<Compra> => {
    // El payload ahora envía el cliente_id y el arreglo de productos (items)
    const payload = {
        fecha: data.fecha,
        cliente_id: Number(data.cliente_id),
        items: data.items.map(item => ({
            producto_id: Number(item.producto_id),
            cantidad: Number(item.cantidad),
            costo_unitario: Number(item.costo_unitario)
        }))
    };

    console.log("[createCompra] POST", ENDPOINT_BASE, payload);

    try {
        const res = await axios.post(ENDPOINT_BASE, payload);
        console.log("[createCompra] ✅ Compra y detalles registrados exitosamente");
        return res.data as Compra;
    } catch (err: any) {
        console.error("[createCompra] Error:", err?.response?.data || err.message);
        throw err;
    }
};

/**
 * Actualizar datos generales de la compra (Cabecera).
 */
export const updateCompra = async (id: number, data: UpdateCompraDTO): Promise<Compra> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    try {
        const res = await axios.patch(endpoint, data);
        return res.data as Compra;
    } catch (err: any) {
        console.error("[updateCompra] Error:", err);
        throw err;
    }
};

/**
 * Eliminar compra (Borra cabecera y detalles por CASCADE).
 */
export const deleteCompra = async (id: number): Promise<void> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    try {
        await axios.delete(endpoint);
    } catch (err: any) {
        console.error("[deleteCompra] Error:", err);
        throw err;
    }
};

/**
 * Sincronizar Movimientos de Caja para Compras faltantes
 */
export const syncCajaCompras = async (): Promise<any> => {
    try {
        const res = await axios.post(`${ENDPOINT_BASE}/sync-caja`);
        return res.data;
    } catch (err: any) {
        console.error("[syncCajaCompras] Error:", err);
        throw err;
    }
};
// components/services/comprasService.ts
import axios from "axios";
import { API_URL } from "./apiConfig";
import { getProductoById } from "./productosService";

const ENDPOINT_BASE = `${API_URL}/compras`;

// ------------------------------------------------------
// Interfaces de soporte
// ------------------------------------------------------
export interface Compra {
    id: number;
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
 * 
 * El backend automáticamente:
 * 1. Registra la compra
 * 2. Recalcula y actualiza precio_costo con promedio ponderado
 * 3. Actualiza inventario (stock y compras)
 * 
 * El frontend después refrescaría los datos del producto si es necesario.
 */
export const createCompra = async (data: CreateCompraDTO): Promise<Compra> => {
    // Construir payload explícito con sólo los campos que el backend espera
    const payload: any = {
        fecha: data.fecha,
        producto_id: Number(data.producto_id),
        cantidad: Number(data.cantidad),
        // Aceptar decimales; eliminar cualquier carácter no numérico salvo '.' y '-'
        costo_unitario: Number(String(data.costo_unitario).replace(/[^0-9.\-]/g, "")) || 0,
    };

    console.log("[createCompra] POST", ENDPOINT_BASE, payload);

    try {
        // 1. Crear la compra
        const res = await axios.post(ENDPOINT_BASE, payload);
        const nuevaCompra = res.data as Compra;
        
        console.log("[createCompra] ✅ Compra registrada exitosamente");
        console.log("[createCompra] El backend actualizó: precio_costo (promedio ponderado) e inventario (stock + compras)");
        
        // 2. Refrescar el producto para ver los cambios en precio_costo e inventario
        try {
            const productoId = Number(data.producto_id);
            const productoActualizado = await getProductoById(productoId);
            console.log("[createCompra] 🔄 Producto refrescado:", {
                id: productoActualizado.id,
                precio_costo: (productoActualizado as any).precio_costo,
                stock: productoActualizado.stock,
            });
        } catch (refreshError: any) {
            console.warn("[createCompra] ⚠️ No se pudo refrescar el producto, pero la compra se registró correctamente:", refreshError?.message);
        }
        
        return nuevaCompra;
    } catch (err: any) {
        console.error("[createCompra] Error:", err?.message ?? err, err?.response?.data ?? err?.response);
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

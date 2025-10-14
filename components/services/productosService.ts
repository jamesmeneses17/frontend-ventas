import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");

// --- Interfaces de Soporte ---
export interface Estado {
    id: number;
    nombre: string;
}

export interface Categoria {
    id: number;
    nombre: string;
}

// Interfaz simplificada para la relación de precios
export interface Precio {
    id: number;
    valor_unitario: number;
    fecha_inicio: string;
    fecha_fin: string | null;
    productoId: number;
}

// 1. INTERFAZ PRODUCTO (Alineada con tu backend)
export interface Producto {
    id: number;
    nombre: string;
    descripcion?: string; // Opcional
    sku?: string;
    stock?: number;

    // Relaciones (El findAll() del backend NO las incluye por defecto, son opcionales aquí)
    caracteristicas?: any[];
    precios?: Precio[]; // Usaremos esto para el precio en el frontend
    inventario?: any[];

    // Campos obligatorios/de relación
    estadoId: number;
    categoriaId: number;
}

// 2. TIPO DE DATOS PARA CREACIÓN/ACTUALIZACIÓN
export type CreateProductoData = {
    nombre: string;
    descripcion: string;
    // ... otros campos DTO
    categoriaId: number;
    estadoId?: number;
};
export type UpdateProductoData = Partial<CreateProductoData>;



/**
 * Obtener productos activos (el endpoint del backend filtra por estadoId: 1).
 * @param subcategoriaId Opcional. Si se pasa, filtra productos por subcategoría.
 */


export const getProductos = async (subcategoriaId?: number, categoriaId?: number): Promise<Producto[]> => {
    let endpoint = `${API_URL}/productos`;
    const params = new URLSearchParams();

    if (subcategoriaId && !isNaN(subcategoriaId) && subcategoriaId > 0) {
        params.append('subcategoriaId', String(subcategoriaId));
        console.log(`[getProductos] Filtrando por subcategoría ID: ${subcategoriaId}`);
    } else if (categoriaId && !isNaN(categoriaId) && categoriaId > 0) { 
        params.append('categoriaId', String(categoriaId));
        console.log(`[getProductos] Filtrando por CATEGORÍA ID: ${categoriaId}`);
    } else {
        console.log('[getProductos] Trayendo todos los productos (sin filtro).');
    }

    if (params.toString()) {
        endpoint += `?${params.toString()}`;
    }


    try {
        const res = await axios.get(endpoint);
        let items: any = res.data;

        if (!Array.isArray(items)) {
            if (items && Array.isArray(items.data)) {
                items = items.data;
            } else if (items && Array.isArray(items.productos)) {
                items = items.productos;
            } else if (items && Array.isArray(items.items)) {
                items = items.items;
            } else {
                console.debug('[getProductos] respuesta inesperada, intentando normalizar:', res.data);
                return [];
            }
        }

        // Asegurarnos de que los precios tengan valor_unitario como number
        const normalized = items.map((it: any) => {
            const precios = Array.isArray(it.precios)
                ? it.precios.map((p: any) => ({ ...p, valor_unitario: Number(p.valor_unitario) }))
                : [];
            return { ...it, precios };
        });

        return normalized as Producto[];

    } catch (err: any) {
        console.error("[getProductos] Error al obtener productos:", err?.message ?? err);
        // Usar axios.isAxiosError para un mejor manejo de errores de red/API
        if (axios.isAxiosError(err) && err.response) {
            console.error("Respuesta del API:", err.response.data);
            throw new Error(`Error en el API: ${err.response.statusText}.`);
        }
        throw new Error("No se pudo conectar al servicio de productos. Verifique API_URL.");
    }
};

/**
 * Obtener un producto por ID.
 */
export const getProductoById = async (id: number): Promise<Producto> => {
    const res = await axios.get(`${API_URL}/productos/${id}`);
    return res.data;
};


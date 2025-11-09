/**
 * Obtener estadísticas de productos por estado.
 * Ejemplo de respuesta esperada del backend:
 * {
 *   total: 168,
 *   stockBajo: 3,
 *   agotado: 1
 * }
 */
export const getProductosStats = async (): Promise<{ total: number; stockBajo: number; agotado: number }> => {
    const endpoint = `${ENDPOINT_BASE}/stats`;
    try {
        const res = await axios.get(endpoint);
        return res.data;
    } catch (err: any) {
        console.error("Error al obtener estadísticas de productos:", err);
        return { total: 0, stockBajo: 0, agotado: 0 };
    }
};
/**
 * Crea un nuevo producto.
 */
export const createProducto = async (data: CreateProductoData): Promise<Producto> => {
    const res = await axios.post(ENDPOINT_BASE, data);
    return res.data as Producto;
};

/**
 * Actualiza un producto existente.
 */
export const updateProducto = async (id: number, data: UpdateProductoData): Promise<Producto> => {
    const res = await axios.patch(`${ENDPOINT_BASE}/${id}`, data);
    return res.data as Producto;
};

/**
 * Elimina un producto.
 */
export const deleteProducto = async (id: number): Promise<void> => {
    await axios.delete(`${ENDPOINT_BASE}/${id}`);
};
// components/services/productosService.ts

import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
const ENDPOINT_BASE = `${API_URL}/productos`;

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

// 1. INTERFAZ PRODUCTO (CORREGIDA)
export interface Producto {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string; 
    ficha_tecnica_url?: string;
    
    // ✅ Campos aplanados/calculados que vienen del backend
    stock: number;             // DEBE SER OBLIGATORIO si siempre viene del backend
    precio: number;            // DEBE SER OBLIGATORIO
    // ✅ Campo de Stock Mínimo (Necesario para el formulario de edición)
    stockMinimo?: number;
    estado_stock: 'Disponible' | 'Stock Bajo' | 'Agotado'; // DEBE SER OBLIGATORIO
    
    // Relaciones 
    caracteristicas?: any[];
    precios?: Precio[]; 
    inventario?: any[]; // La entidad inventario completa

    // Campos obligatorios/de relación
    estadoId: number;
    categoriaId: number;
    estado?: Estado;
    categoria?: Categoria; // Añadido: Útil para mostrar en la tabla o editar
}
export interface PaginacionResponse<T> {
  data: T[];
  total: number;
}

// 2. TIPO DE DATOS PARA CREACIÓN/ACTUALIZACIÓN (ASUMIENDO STOCK MÍNIMO)
export type CreateProductoData = {
    nombre: string;
    codigo: string;
    descripcion: string;
    ficha_tecnica_url?: string;
    
    // Se espera que el DTO reciba estos datos
    stock: number;
    precio: number;
    stockMinimo?: number; // ✅ Asumiendo que agregaste esto al DTO
    
    categoriaId: number;
    estadoId?: number;
};
export type UpdateProductoData = Partial<CreateProductoData>;


// --------------------------------------------------------------------------------
// --- FUNCIONES CRUD ---
// --------------------------------------------------------------------------------

/**
 * Obtener productos activos con paginación y filtro.
 */
export const getProductos = async (
    page: number = 1,
    size: number = 5,
    stockFiltro: string = "",
    searchTerm: string = ""
): Promise<PaginacionResponse<Producto>> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", size.toString());
    if (stockFiltro) params.append("estado_stock", stockFiltro);
    if (searchTerm) params.append("search", searchTerm);

    const endpoint = `${ENDPOINT_BASE}?${params.toString()}`;
    // Log para depuración del filtro de estado
    console.log('[getProductos] Endpoint:', endpoint);
    console.log('[getProductos] Parámetros:', {
        page,
        size,
        estado_stock: stockFiltro,
        search: searchTerm
    });

    try {
        const res = await axios.get(endpoint);
        // Si el servidor responde con un código HTTP de error, registrar y devolver vacío
        if (res.status >= 400) {
            console.error('[getProductos] HTTP error', res.status, res.data);
            return { data: [], total: 0 };
        }
        // Algunos backends devuelven { statusCode: 500, message: '...' } dentro del body
        if (res.data && typeof res.data === 'object' && (res.data.statusCode || res.data.status)) {
            const code = res.data.statusCode ?? res.data.status;
            if (code >= 400) {
                console.error('[getProductos] API error body', code, res.data);
                return { data: [], total: 0 };
            }
        }
        let items: any = res.data;
        let productos: Producto[] = [];
        let total = 0;

        // Si el backend responde con paginación
        if (items && Array.isArray(items.data)) {
            productos = items.data;
            total = items.total || productos.length;
        } else if (Array.isArray(items)) {
            productos = items;
            total = productos.length;
        }

        // Normalizar los campos numéricos y mapear 'precio' al nuevo campo 'precio_costo'
        const normalized = productos.map((it: any) => {
            // El backend ahora envía `precio_costo` como el valor de costo del producto.
            // Si no existe, caemos a `it.precio` por compatibilidad.
            const finalPrice = Number(it.precio_costo ?? it.precio ?? 0);
            const finalStock = Number(it.stock) || 0;
            const finalStockMinimo = Number(it.stockMinimo) || 5;
            return {
                ...it,
                // 🛑 CAMBIO CRÍTICO: la columna 'precio' que muestra la tabla
                // debe tomar el valor de 'precio_costo' proporcionado por el backend.
                precio: finalPrice,
                stock: finalStock,
                stockMinimo: finalStockMinimo,
            };
        });

        return { data: normalized, total };
    } catch (err: any) {
        // Mostrar detalles del error para el desarrollador y relanzarlo para que
        // el hook useCrudCatalog pueda mostrar la notificación en la UI.
        console.error("Error al obtener productos:", err?.message ?? err, err?.response?.data ?? err);
        // Lanzamos el error para que la capa superior (useCrudCatalog) lo capture y muestre notificación
        throw err;
    }
};

/**
 * Obtener un producto por ID.
 */
export const getProductoById = async (id: number): Promise<Producto> => {
    const res = await axios.get(`${ENDPOINT_BASE}/${id}/with-relations`); 
    // Asegurarse de que el precio y stock sean números para RHF
    const data = res.data;
    data.precio = Number(data.precio) || 0;
    data.stock = Number(data.stock) || 0;
    data.stockMinimo = Number(data.stockMinimo) || 5;

    return data as Producto;
};

// --------------------------------------------------
// Helpers: calcular estado de stock y normalizar lista
// --------------------------------------------------
const calcularEstadoStock = (stock: number, stockMinimo: number) => {
    const s = Number(stock || 0);
    const min = Number(stockMinimo || 0);
    if (s <= 0) return 'Agotado';
    if (s <= min) return 'Stock Bajo';
    return 'Disponible';
};

/**
 * Normaliza un array simple de productos que vienen del backend.
 * Mapea `precio` al nuevo campo `precio_costo` y normaliza stock.
 */
export const getProductosSimple = async (productosArray: any[]): Promise<Producto[]> => {
    const normalized = productosArray.map((p: any) => {
        const finalStockMinimo = Number(p.stockMinimo ?? 0);
        const calculated_estado_stock = calcularEstadoStock(Number(p.stock ?? 0), finalStockMinimo);

        return {
            ...p,
            // CAMBIO: Usar precio_costo para mostrar en la tabla
            precio: Number(p.precio_costo ?? p.precio ?? 0),
            stock: Number(p.stock ?? 0),
            stockMinimo: finalStockMinimo,
            estado_stock: calculated_estado_stock,
        } as Producto;
    });

    // Ordenar por nombre por defecto
    const ordenado = normalized.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
    return ordenado as Producto[];
};

// ... (createProducto, updateProducto, deleteProducto se mantienen)
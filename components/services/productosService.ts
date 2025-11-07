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

    try {
        const res = await axios.get(endpoint);
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

        // Normalizar los campos numéricos
        const normalized = productos.map((it: any) => {
            const finalPrice = Number(it.precio) || 0;
            const finalStock = Number(it.stock) || 0;
            const finalStockMinimo = Number(it.stockMinimo) || 5;
            return {
                ...it,
                precio: finalPrice,
                stock: finalStock,
                stockMinimo: finalStockMinimo,
            };
        });

        return { data: normalized, total };
    } catch (err: any) {
        console.error("Error al obtener productos:", err);
        return { data: [], total: 0 };
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

// ... (createProducto, updateProducto, deleteProducto se mantienen)
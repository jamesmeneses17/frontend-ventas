import axios from "axios";

// 🛑 Usa la variable de entorno NEXT_PUBLIC_API_URL
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
    valor: number; // Suponemos que este es el campo del precio
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
 */
export const getProductos = async (): Promise<Producto[]> => {
    const endpoint = `${API_URL}/productos`; 
    
    try {
        const res = await axios.get(endpoint);
        
        if (Array.isArray(res.data)) {
            return res.data;
        }
        
        return res.data; 
        
    } catch (err: any) {
        console.error("[getProductos] Error al obtener productos:", err?.message ?? err);
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

// ... (Las funciones create, update y delete se omiten aquí por ser de administración, 
// pero están definidas en el código anterior si las necesitas).
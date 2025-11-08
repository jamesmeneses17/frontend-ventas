// /components/services/preciosService.ts

import axios from "axios";
// Asumiendo que tienes tu Producto interface importable o definida.
import { Producto, Categoria } from "./productosService"; 

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
const ENDPOINT_BASE = `${API_URL}/precios`;

// --- Interfaces Necesarias ---

// 1. Tipo que usará el CRUD (extiende el tipo de datos de precio)
export interface PrecioConProducto {
    id: number;
    valor_unitario: number;
    valor_final: number; // Precio después de descuento/promoción
    descuento_porcentaje: number;
    estado: 'Normal' | 'En Promoción'; // Estado calculado
    
    // Campos necesarios para la tabla y el formulario
    fecha_inicio: string;
    fecha_fin: string | null;
    productoId: number;
    
    // Datos del producto relacionados
    producto: {
        id: number;
        nombre: string;
        codigo: string;
        categoria: Categoria;
    }
}

// 2. Tipos para la paginación
export interface PaginacionResponse<T> {
    data: T[];
    total: number;
}

// 3. Tipos para el formulario
export type CreatePrecioData = {
    productoId: number;
    valor_unitario: number;
    descuento_porcentaje?: number;
    fecha_inicio: string; // Puede ser un Date o string según tu backend
    fecha_fin?: string;
};
export type UpdatePrecioData = Partial<CreatePrecioData>;


// 4. Tipos para las estadísticas
export interface PrecioStats {
    totalProductos: number;
    productosEnPromocion: number;
    precioPromedio: number;
}


// --- FUNCIONES CRUD ---

/**
 * Obtiene la lista de precios con paginación y búsqueda.
 */
export const getPrecios = async (
    page: number = 1,
    size: number = 5,
    searchTerm: string = ""
): Promise<PaginacionResponse<PrecioConProducto>> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", size.toString());
    if (searchTerm) params.append("search", searchTerm);

    const endpoint = `${ENDPOINT_BASE}?${params.toString()}`;

    try {
        const res = await axios.get(endpoint);
        // Asume que el backend devuelve { data: PrecioConProducto[], total: number }
        return res.data; 
    } catch (err) {
        console.error("Error al obtener precios:", err);
        return { data: [], total: 0 };
    }
};

/**
 * Obtiene las estadísticas para los widgets.
 */
export const getPreciosStats = async (): Promise<PrecioStats> => {
    // 💡 NOTA: DEBES IMPLEMENTAR ESTE ENDPOINT EN EL BACKEND
    // Ejemplo: /precios/stats
    try {
        const res = await axios.get(`${ENDPOINT_BASE}/stats`);
        return res.data as PrecioStats;
    } catch (err) {
        console.error("Error al obtener estadísticas de precios:", err);
        return { totalProductos: 0, productosEnPromocion: 0, precioPromedio: 0 };
    }
};

// --- CRUD BÁSICO ---

export const createPrecio = async (data: CreatePrecioData): Promise<any> => {
    const res = await axios.post(ENDPOINT_BASE, data);
    return res.data;
};

export const updatePrecio = async (id: number, data: UpdatePrecioData): Promise<any> => {
    // Asume que el backend tiene un endpoint para actualizar precios existentes
    const res = await axios.patch(`${ENDPOINT_BASE}/${id}`, data);
    return res.data;
};

export const deletePrecio = async (id: number): Promise<void> => {
    await axios.delete(`${ENDPOINT_BASE}/${id}`);
};
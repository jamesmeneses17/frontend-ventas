// /components/services/subcategoriasService.ts

import axios from "axios";

// Reutiliza la lógica de URL y la interfaz Estado si es compartida
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");

// Definición del objeto Estado que viene del backend
// NOTA: Asumo que esta interfaz (Estado) ya está definida o importada en tu proyecto.
export interface Estado {
    id: number;
    nombre: string;
}

// Interfaz para la Categoría (necesaria para la relación de Subcategoría)
// NOTA: Si ya la importas desde el otro servicio, puedes omitir esta definición.
export interface Categoria {
    id: number;
    nombre: string;
}

// 1. INTERFAZ SUBCATEGORIA (Incluye las relaciones Categoria y Estado)
export interface Subcategoria {
    id: number;
    nombre: string;
    // Campos para la relación de estado
    estadoId: number;
    estado: Estado;
    // Campos para la relación con Categoría Padre
    categoriaId: number;
    categoria: Categoria;
}

// 2. TIPO DE DATOS PARA CREACIÓN
export type CreateSubcategoriaData = {
    nombre: string;
    categoriaId: number; // Requerido al crear una subcategoría
    estadoId?: number; // Es opcional porque el backend le pone 1 por defecto
};

// 3. TIPO DE DATOS PARA ACTUALIZACIÓN
export type UpdateSubcategoriaData = Partial<CreateSubcategoriaData>;


/**
 * Obtener subcategorías.
 * @param all 
 */
export const getSubcategorias = async (all: boolean = false): Promise<Subcategoria[]> => {
    const endpoint = `${API_URL}/subcategorias`;

    if (!all) {
        const res = await axios.get(endpoint);
        return res.data;
    }

    const attempts = [
        "?all=true",
        "?all=1",
        "?include_inactive=true",
        "?per_page=1000",
        "?limit=1000",
    ];

    for (const q of attempts) {
        try {
            const url = `${endpoint}${q}`;
            const res = await axios.get(url);
            if (Array.isArray(res.data) && res.data.length > 0) {
                console.debug(`[getSubcategorias] intento "${q}" devolvió ${res.data.length} elementos`);
                return res.data;
            } else {
                console.debug(`[getSubcategorias] intento "${q}" devolvió 0 elementos`);
            }
        } catch (err) {
            const e: any = err;
            console.debug(`[getSubcategorias] intento "${q}" fallo:`, e?.message ?? e);
        }
    }

    // Fallback: petición sin query
    const fallback = await axios.get(endpoint);
    return fallback.data;
};

export const getSubcategoriaById = async (id: number): Promise<Subcategoria> => {
    const res = await axios.get(`${API_URL}/subcategorias/${id}`);
    return res.data;
};

export const createSubcategoria = async (data: CreateSubcategoriaData): Promise<Subcategoria> => {
    const payload: any = { ...data };
    console.debug("[createSubcategoria] payload:", payload);
    try {
        const res = await axios.post(`${API_URL}/subcategorias`, payload);
        console.debug("[createSubcategoria] response:", res.data);
        return res.data;
    } catch (err: any) {
        console.error("[createSubcategoria] error response:", err?.response?.data ?? err?.toString());
        throw err;
    }
};

// ✅ ACTUALIZACIÓN: data espera Partial<{ nombre: string, categoriaId: number, estadoId: number }>
export const updateSubcategoria = async (id: number, data: UpdateSubcategoriaData): Promise<Subcategoria> => {
    const payload: any = { ...data };
    console.debug("[updateSubcategoria] id:", id, "payload:", payload);
    try {
        const res = await axios.patch(`${API_URL}/subcategorias/${id}`, payload);
        console.debug("[updateSubcategoria] response:", res.data);
        return res.data;
    } catch (err: any) {
        console.error("[updateSubcategoria] error response:", err?.response?.data ?? err?.toString());
        throw err;
    }
};

export const deleteSubcategoria = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/subcategorias/${id}`);
};
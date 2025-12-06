// src/components/services/categoriaPrincipalService.ts

import axios from "axios";
// Asume que tienes un archivo de configuración para la URL base de la API
import { API_URL } from "./apiConfig"; 

// ===================================================================
// TIPADO (Basado en la entidad CategoriaPrincipal del backend)
// ===================================================================
export interface CategoriaPrincipal {
    id: number;
    nombre: string;
    // La relación 'categorias' que devuelve el backend
    categorias?: any[]; 
}

export type CreateCategoriaPrincipalData = Omit<CategoriaPrincipal, 'id' | 'categorias'>; // Solo necesitamos el nombre
export type UpdateCategoriaPrincipalData = Partial<CreateCategoriaPrincipalData>;

// Asumimos un ENDPOINT BASE para la gestión de esta entidad
const ENDPOINT_BASE = `${API_URL}/categorias-principales`; // URL: /api/categorias-principales


// ===================================================================
// CATEGORÍAS PRINCIPALES: CRUD
// ===================================================================

/**
 * Obtiene todas las Categorías Principales.
 * RUTA: GET /categorias-principales
 */
export const getCategoriasPrincipales = async (): Promise<CategoriaPrincipal[]> => {
    try {
        // Tu backend usa find() sin condiciones, que devuelve todas las categorías principales.
        const res = await axios.get(ENDPOINT_BASE); 
        return res.data;
    } catch (err: any) {
        console.error("Error al obtener Categorías Principales:", err);
        // En lugar de relanzar, devolvemos un array vacío para manejarlo elegantemente en la UI.
        return []; 
    }
};

/**
 * Obtiene una Categoría Principal por ID.
 * RUTA: GET /categorias-principales/:id
 */
export const getCategoriaPrincipalById = async (id: number): Promise<CategoriaPrincipal> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    try {
        const res = await axios.get(endpoint);
        return res.data as CategoriaPrincipal;
    } catch (err: any) {
        console.error(`Error al obtener Categoría Principal ID ${id}:`, err);
        throw err; // Relanzamos para que la UI capture el error (ej: NotFoundException)
    }
};

/**
 * Crea una nueva Categoría Principal.
 * RUTA: POST /categorias-principales
 */
export const createCategoriaPrincipal = async (data: CreateCategoriaPrincipalData): Promise<CategoriaPrincipal> => {
    // El payload solo necesita el nombre
    const payload = { nombre: data.nombre };
    
    try {
        const res = await axios.post(ENDPOINT_BASE, payload);
        return res.data as CategoriaPrincipal;
    } catch (err: any) {
        console.error("Error al crear Categoría Principal:", err?.response?.data || err);
        throw err;
    }
};

/**
 * Actualiza una Categoría Principal existente.
 * RUTA: PATCH /categorias-principales/:id
 */
export const updateCategoriaPrincipal = async (id: number, data: UpdateCategoriaPrincipalData): Promise<CategoriaPrincipal> => {
    // Tu backend usa PATCH (update), por lo que enviamos solo los campos que cambian.
    const payload = { nombre: data.nombre };
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    
    try {
        const res = await axios.patch(endpoint, payload); // Usamos PATCH para actualizar
        return res.data as CategoriaPrincipal;
    } catch (err: any) {
        console.error(`Error al actualizar Categoría Principal ID ${id}:`, err?.response?.data || err);
        throw err;
    }
};

/**
 * Elimina una Categoría Principal.
 * RUTA: DELETE /categorias-principales/:id
 */
export const deleteCategoriaPrincipal = async (id: number): Promise<void> => {
    try {
        // Tu backend usa delete, que retorna { message: '...' }
        await axios.delete(`${ENDPOINT_BASE}/${id}`);
    } catch (err: any) {
        console.error(`Error al eliminar Categoría Principal ID ${id}:`, err?.response?.data || err);
        throw err;
    }
};
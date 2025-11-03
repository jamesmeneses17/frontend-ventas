// components/services/estadosService.ts

import axios from "axios";

// Configuración de la URL base de la API
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");

// --- Interfaces de Soporte ---
// Alineado con tu entidad de TypeORM
export interface Estado {
    id: number;
    nombre: string;
}

export type CreateEstadoData = Omit<Estado, 'id'>;
export type UpdateEstadoData = Partial<CreateEstadoData>;

// --- ENDPOINT BASE ---
const ENDPOINT = `${API_URL}/catalogos/estados`;

// --- FUNCIONES CRUD (Consumiendo el endpoint) ---

/**
 * Obtiene la lista de todos los estados.
 * Consume GET /catalogos/estados
 * @returns {Promise<Estado[]>} Lista de estados.
 */
export const getEstados = async (): Promise<Estado[]> => {
    try {
        console.log('[getEstados] Trayendo todos los estados.');
        const res = await axios.get(ENDPOINT);
        let items: any = res.data;

        if (!Array.isArray(items)) {
            if (items && Array.isArray(items.data)) {
                items = items.data;
            } else if (items && Array.isArray(items.items)) {
                items = items.items;
            } else {
                console.debug('[getEstados] Respuesta inesperada, intentando normalizar:', res.data);
                return []; 
            }
        }

        console.log('[getEstados] Estados recibidos:', items);
        return items as Estado[];

    } catch (err: any) {
        console.error("[getEstados] Error al obtener estados:", err?.message ?? err);
        if (axios.isAxiosError(err) && err.response) {
            console.error("Respuesta del API:", err.response.data);
        }
        // Log extra para depuración
        console.error('[getEstados] Error completo:', err);
        throw new Error("No se pudo conectar al servicio de estados. Verifique API_URL.");
    }
};

/**
 * Crea un nuevo estado.
 * Consume POST /catalogos/estados
 * @param {CreateEstadoData} data - Datos del nuevo estado.
 * @returns {Promise<Estado>} El estado creado.
 */
export const createEstado = async (data: CreateEstadoData): Promise<Estado> => {
    const res = await axios.post(ENDPOINT, data);
    return res.data as Estado;
};

/**
 * Actualiza un estado existente.
 * Consume PATCH /catalogos/estados/:id
 * @param {number} id - ID del estado a actualizar.
 * @param {UpdateEstadoData} data - Datos a actualizar.
 * @returns {Promise<Estado>} El estado actualizado.
 */
export const updateEstado = async (id: number, data: UpdateEstadoData): Promise<Estado> => {
    const res = await axios.patch(`${ENDPOINT}/${id}`, data);
    return res.data as Estado;
};

/**
 * Elimina un estado.
 * Consume DELETE /catalogos/estados/:id
 * @param {number} id - ID del estado a eliminar.
 */
export const deleteEstado = async (id: number): Promise<void> => {
    await axios.delete(`${ENDPOINT}/${id}`);
};
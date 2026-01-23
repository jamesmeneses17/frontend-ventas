import axios from "axios";
import { API_URL } from "./apiConfig";

const AJUSTES_BASE_URL = `${API_URL}/ajustes-inventario`;

export interface CreateAjusteData {
    producto_id: number;
    stock_fisico: number;
    motivo?: string;
}

/**
 * Registra un ajuste de inventario (auditoría).
 */
export const createAjuste = async (data: CreateAjusteData): Promise<any> => {
    try {
        const res = await axios.post(AJUSTES_BASE_URL, data);
        return res.data;
    } catch (err: any) {
        console.error("[createAjuste] Error:", err?.response?.data ?? err.message);
        throw err;
    }
};

/**
 * Elimina (revierte) un ajuste de inventario.
 */
export const deleteAjuste = async (id: number): Promise<void> => {
    try {
        await axios.delete(`${AJUSTES_BASE_URL}/${id}`);
    } catch (err: any) {
        console.error("[deleteAjuste] Error:", err?.response?.data ?? err.message);
        throw err;
    }
};

/**
 * Obtiene los ajustes recientes con paginación.
 */
export const getRecentAjustes = async (page: number = 1, limit: number = 10): Promise<{ data: any[], total: number }> => {
    try {
        const res = await axios.get(`${AJUSTES_BASE_URL}/recientes`, {
            params: { page, limit }
        });
        return res.data; // { data: [], total: 0 }
    } catch (err: any) {
        console.error("[getRecentAjustes] Error:", err?.response?.data ?? err.message);
        return { data: [], total: 0 };
    }
};

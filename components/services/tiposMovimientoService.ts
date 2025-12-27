import axios from "axios";
import { API_URL } from "./apiConfig";

const ENDPOINT_BASE = `${API_URL}/tipos-movimiento`;

export interface TipoMovimiento {
    id: number;
    nombre: string;
}

/**
 * Obtiene todos los tipos (Ingreso, Egreso, Gasto) para los selectores.
 */
export const getTiposMovimiento = async (): Promise<TipoMovimiento[]> => {
    try {
        const res = await axios.get(ENDPOINT_BASE);
        return Array.isArray(res.data) ? res.data : [];
    } catch (err: any) {
        console.error("[getTiposMovimiento] Error:", err.message);
        return [];
    }
};
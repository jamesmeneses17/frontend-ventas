import axios from "axios";
import { API_URL } from "./apiConfig";

const BASE_URL = `${API_URL}/tipo-contacto-cliente`;

export interface TipoContacto {
    id: number;
    nombre: string;
}

/**
 * Obtiene la lista de tipos de contacto disponibles.
 */
export const getTiposContacto = async (): Promise<TipoContacto[]> => {
    try {
        const res = await axios.get(BASE_URL);
        return res.data;
    } catch (error) {
        console.error("Error fetching tipos contacto:", error);
        throw error;
    }
};

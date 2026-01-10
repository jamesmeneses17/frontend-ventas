import axios from "axios";
import { API_URL } from "./apiConfig";

const BASE_URL = `${API_URL}/tipo-persona`;

export interface TipoPersona {
    id: number;
    nombre: string;
}

/**
 * Obtiene la lista de tipos de persona disponibles.
 */
export const getTiposPersona = async (): Promise<TipoPersona[]> => {
    try {
        const res = await axios.get(BASE_URL);
        return res.data;
    } catch (error) {
        console.error("Error fetching tipos persona:", error);
        throw error;
    }
};

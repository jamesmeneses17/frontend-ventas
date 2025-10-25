// /components/services/tiposDocumentoService.ts

import axios from "axios";

// Reutiliza la lógica de URL de tu proyecto
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");

// 1. INTERFAZ TIPODOCUMENTO (Mínima necesaria para el select)
export interface TipoDocumento {
    id: number;
    nombre: string;
    // Si tu backend retorna otros campos (como estado), agrégalos aquí.
    // estadoId?: number; 
}


/**
 * Obtener la lista de Tipos de Documento.
 * Se asume que este endpoint no necesita paginación ni parámetros complejos.
 * @returns {Promise<TipoDocumento[]>} Lista de tipos de documento.
 */
export const getTiposDocumento = async (): Promise<TipoDocumento[]> => {
    const endpoint = `${API_URL}/tipos-documento`; // El endpoint que creaste en el backend

    try {
        const res = await axios.get(endpoint);
        // Opcional: Logging para verificar la data en desarrollo
        console.debug(`[getTiposDocumento] éxito, devolvió ${res.data.length} elementos`);
        return res.data;
    } catch (err) {
        const e: any = err;
        console.error("[getTiposDocumento] fallo:", e?.response?.data ?? e?.toString());
        // Relanzar el error para que el componente (ClientesForm) lo capture y muestre el error.
        throw err; 
    }
};

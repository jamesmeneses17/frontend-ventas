// /components/services/configuracionWebService.ts

import axios from "axios";
import { 
    InformacionEmpresa, 
    UpdateInformacionEmpresaData, 
    CreateInformacionEmpresaData 
} from "../../types/configuracion";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
  .replace(/\/+$/g, "");

// La URL base para el controlador de InfoEmpresa
const BASE_URL = `${API_URL}/configuracion/empresa`; 

// ======================================
// OBTENER INFORMACIÓN ÚNICA (GET)
// ======================================
/**
 * Obtiene el registro único de Información de Empresa.
 * Si el registro no existe, el backend devuelve 404.
 */
export const getInformacionEmpresa = async (): Promise<InformacionEmpresa> => {
    try {
        // Llama a GET /configuracion/empresa
        const res = await axios.get(BASE_URL); 
        return res.data;
    } catch (err: any) {
        // En este caso, el error 404 es una respuesta esperada si es el primer uso.
        console.error("[getInformacionEmpresa] error:", err?.response?.data ?? err);
        throw err; 
    }
};

// ======================================
// CREAR REGISTRO INICIAL (POST)
// ======================================
/**
 * Crea el registro inicial (singleton). Solo debe ser llamado si no existe.
 */
export const createInformacionEmpresa = async (
  data: CreateInformacionEmpresaData
): Promise<InformacionEmpresa> => {
    const payload = { ...data };

    try {
        // Llama a POST /configuracion/empresa
        const res = await axios.post(BASE_URL, payload);
        return res.data;
    } catch (err: any) {
        console.error("[createInformacionEmpresa] error:", err?.response?.data ?? err);
        throw err;
    }
};

// ======================================
// ACTUALIZAR REGISTRO EXISTENTE (PUT)
// ======================================
/**
 * Actualiza el registro existente (singleton).
 */
export const updateInformacionEmpresa = async (
  data: UpdateInformacionEmpresaData
): Promise<InformacionEmpresa> => {
    const payload = { ...data };

    try {
        // Llama a PUT /configuracion/empresa (el backend usa ID=1 implícitamente)
        const res = await axios.put(BASE_URL, payload); 
        return res.data;
    } catch (err: any) {
        console.error("[updateInformacionEmpresa] error:", err?.response?.data ?? err);
        throw err;
    }
};
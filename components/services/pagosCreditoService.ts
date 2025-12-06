import axios from "axios";
import { API_URL } from "./apiConfig";
const ENDPOINT_BASE = `${API_URL}/pagos-credito`;

// ------------------------------------------------------
// Interfaces
// ------------------------------------------------------
export interface PagoCredito {
    id: number;
    credito_id: number;
    monto_pago: number;
    fecha_pago: string;
}

export interface CreatePagoCreditoDTO {
    credito_id: number;
    monto_pago: number;
}

// ------------------------------------------------------
// Registrar un pago
// ------------------------------------------------------
export const registrarPago = async (
    data: any
): Promise<{
    mensaje: string;
    nuevo_saldo: number;
    estado: "PENDIENTE" | "PAGADO";
}> => {

    // Normalizar y forzar el payload esperado por el backend
    const payload = {
        credito_id: Number(data.credito_id ?? data.creditoId ?? data.credito_id),
        monto_pago: Number(String(data.monto_pago ?? data.montoPago ?? data.monto).replace(/[^0-9.\-]/g, "")) || 0,
    };

    console.log("[registrarPago] POST (normalized payload):", ENDPOINT_BASE, payload);

    try {
        const res = await axios.post(ENDPOINT_BASE, payload);
        console.log("[registrarPago] response:", res.status, res.data);
        return res.data;
    } catch (err: any) {
        console.error("[registrarPago] Error: Request failed", err?.response?.status, err?.response?.data ?? err?.message ?? err);
        throw err;
    }
};

// ------------------------------------------------------
// Obtener pagos por crédito (opcional si los usas en UI)
// ------------------------------------------------------
export const getPagosByCredito = async (creditoId: number): Promise<PagoCredito[]> => {
    const endpoint = `${ENDPOINT_BASE}/credito/${creditoId}`;

    console.log("[getPagosByCredito] GET:", endpoint);

    try {
        const res = await axios.get(endpoint);
        console.log("[getPagosByCredito] response:", res.status, res.data);
        // Aceptar distintas formas de respuesta: array directo o { data: [...] }
        if (Array.isArray(res.data)) return res.data as PagoCredito[];
        if (res.data && Array.isArray(res.data.data)) return res.data.data as PagoCredito[];
        // Si viene un objeto con la lista en otra propiedad, intentar devolver lo que tenga
        if (res.data && typeof res.data === 'object') {
            // buscar la primera propiedad que sea array
            for (const key of Object.keys(res.data)) {
                if (Array.isArray((res.data as any)[key])) return (res.data as any)[key] as PagoCredito[];
            }
        }
        // fallback: devolver vacío
        return [];
    } catch (err: any) {
        console.error("[getPagosByCredito] Error:", err);
        throw err;
    }
};

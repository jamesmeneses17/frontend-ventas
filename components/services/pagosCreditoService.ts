import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
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
    data: CreatePagoCreditoDTO
): Promise<{
    mensaje: string;
    nuevo_saldo: number;
    estado: "PENDIENTE" | "PAGADO";
}> => {

    const payload = {
        credito_id: Number(data.credito_id),
        monto_pago: Number(String(data.monto_pago).replace(/[^0-9.\-]/g, "")) || 0,
    };

    console.log("[registrarPago] POST:", ENDPOINT_BASE, payload);

    try {
        const res = await axios.post(ENDPOINT_BASE, payload);
        return res.data;
    } catch (err: any) {
        console.error("[registrarPago] Error:", err?.message ?? err);
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
        return res.data as PagoCredito[];
    } catch (err: any) {
        console.error("[getPagosByCredito] Error:", err);
        throw err;
    }
};

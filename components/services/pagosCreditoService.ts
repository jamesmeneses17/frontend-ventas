import axios from "axios";
import { API_URL } from "./apiConfig";

// 1. Base del endpoint para este módulo
const ENDPOINT_BASE = `${API_URL}/pagos-credito`;

// ------------------------------------------------------
// Interfaces
// ------------------------------------------------------
export interface PagoCredito {
  id: number;
  credito_id: number;
  monto_pago: number;
  fecha_pago: string;
  notas?: string;
}

export interface RegistrarPagoResponse {
  mensaje: string;
  nuevo_saldo: number;
  estado: "PENDIENTE" | "PAGADO";
}

// ------------------------------------------------------
// Registrar un pago (Abono)
// ------------------------------------------------------
export const registrarPago = async (
  data: any
): Promise<RegistrarPagoResponse> => {
  // Normalizar payload para que coincida exactamente con el CreatePagoDto del Backend
  const payload = {
    credito_id: Number(data.credito_id ?? data.creditoId),
    monto_pago: Number(data.monto_pago ?? data.montoPago ?? data.monto),
    notas: data.notas || "",
  };

  // URL CORREGIDA: ENDPOINT_BASE ya incluye "/pagos-credito"
  const endpointAbono = `${ENDPOINT_BASE}/abono`;

  console.log("[registrarPago] POST:", endpointAbono, payload);

  try {
    const res = await axios.post(endpointAbono, payload);
    return res.data;
  } catch (err: any) {
    console.error(
      "[registrarPago] Error:",
      err?.response?.data || err.message
    );
    throw err;
  }
};

// ------------------------------------------------------
// Obtener historial de pagos
// ------------------------------------------------------
export const getPagosByCredito = async (
  creditoId: number
): Promise<PagoCredito[]> => {
  // URL CORREGIDA: /pagos-credito/historial/{id}
  const endpoint = `${ENDPOINT_BASE}/historial/${creditoId}`;

  console.log("[getPagosByCredito] GET:", endpoint);

  try {
    const res = await axios.get(endpoint);
    
    // Manejo flexible de la respuesta del backend
    if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    
    return [];
  } catch (err: any) {
    console.error("[getPagosByCredito] Error:", err.message);
    return [];
  }
};
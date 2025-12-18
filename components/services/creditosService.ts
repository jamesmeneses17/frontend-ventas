// components/services/creditosService.ts
import axios from "axios";
import { API_URL } from "./apiConfig";

const ENDPOINT_BASE = `${API_URL}/creditos`;

/* ============================
   INTERFACES
============================ */

// Detalle del crédito
export interface DetalleCredito {
  id?: number;
  producto_id: number;
  cantidad: number;
  precio_unitario?: number;
  subtotal?: number;
}

// Crédito principal
export interface Credito {
  id: number;
  numero_factura?: string;
  cliente_id: number;
  saldo_pendiente: number;
  fecha_inicial: string;
  fecha_final?: string;
  estado: "PENDIENTE" | "PAGADO";
  detalles: DetalleCredito[];
}

/* ============================
   PAYLOADS
============================ */

export interface CreateCreditoPayload {
  numero_factura?: string;
  cliente_id: number;
  saldo_pendiente: number;
  fecha_inicial: string;
  fecha_final?: string;
  estado?: "PENDIENTE" | "PAGADO";
  detalles: DetalleCredito[];
}

export type UpdateCreditoPayload = Partial<CreateCreditoPayload>;

/* ============================
   RESPUESTAS
============================ */

export interface GetCreditosResponse {
  data: Credito[];
  total: number;
}

/* ============================
   CRUD
============================ */

/**
 * Crear crédito
 */
export const createCredito = async (
  data: CreateCreditoPayload
): Promise<Credito> => {
  const payload: any = {
    ...data,
    cliente_id: Number(data.cliente_id),
    saldo_pendiente: Number(data.saldo_pendiente) || 0,
  };

  Object.keys(payload).forEach(
    (k) => payload[k] === undefined && delete payload[k]
  );

  const res = await axios.post(ENDPOINT_BASE, payload);
  return res.data;
};

/**
 * Obtener créditos (paginado + búsqueda)
 */
export const getCreditos = async (
  page: number,
  limit: number,
  search: string
): Promise<GetCreditosResponse> => {
  const res = await axios.get(ENDPOINT_BASE, {
    params: {
      page,
      limit,
      search,
    },
  });

  return {
    data: res.data.data ?? res.data,
    total: res.data.total ?? res.data.length ?? 0,
  };
};

/**
 * Obtener crédito por ID
 */
export const getCreditoById = async (id: number): Promise<Credito> => {
  const res = await axios.get(`${ENDPOINT_BASE}/${id}`);
  return res.data;
};

/**
 * Actualizar crédito
 */
export const updateCredito = async (
  id: number,
  data: UpdateCreditoPayload
): Promise<Credito> => {
  const payload: any = { ...data };

  Object.keys(payload).forEach(
    (k) => payload[k] === undefined && delete payload[k]
  );

  const res = await axios.put(`${ENDPOINT_BASE}/${id}`, payload);
  return res.data;
};

/**
 * Eliminar crédito
 */
export const deleteCredito = async (id: number): Promise<void> => {
  await axios.delete(`${ENDPOINT_BASE}/${id}`);
};

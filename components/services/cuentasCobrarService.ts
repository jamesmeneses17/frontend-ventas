import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
const BASE = `${API_URL}/creditos`;

// Interfaces (simplified)
export interface Credito {
  id:number;
  cliente_id:number;
  articulo:string;
  valor_credito:number;
  saldo_pendiente:number;
  fecha_inicial:string;
  fecha_final:string;
  estado: "PENDIENTE"|"PAGADO";
}

export interface Pago {
  id:number;
  credito_id:number;
  monto_pago:number;
  fecha_pago:string;
}

export const getCreditos = async (page=1, limit=10, search="") => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("limit", String(limit));
  if (search) params.append("search", search);
  const url = `${BASE}?${params.toString()}`;
  const res = await axios.get(url);
  // support both paginated or array responses
  if (res.data && Array.isArray(res.data.data)) return { data: res.data.data, total: res.data.total ?? res.data.data.length };
  if (Array.isArray(res.data)) return { data: res.data, total: res.data.length };
  return { data: [], total: 0 };
};

export const getCreditoById = async (id:number) => {
  const res = await axios.get(`${BASE}/${id}`);
  return res.data as Credito;
};

export const createCredito = async (data: any) => {
  const payload = { ...data };
  const res = await axios.post(BASE, payload);
  return res.data as Credito;
};

export const updateCredito = async (id:number, data:any) => {
  const res = await axios.patch(`${BASE}/${id}`, data);
  return res.data as Credito;
};

export const deleteCredito = async (id:number) => {
  await axios.delete(`${BASE}/${id}`);
};

export const registrarPago = async (dto:{ credito_id:number; monto_pago:number }) => {
  const res = await axios.post(`${API_URL}/pagos-credito`, dto);
  return res.data;
};

export const getPagosByCredito = async (credito_id:number) => {
  const res = await axios.get(`${API_URL}/pagos-credito/credito/${credito_id}`);
  return res.data as Pago[];
};

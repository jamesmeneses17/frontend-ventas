// /components/services/metodosPagoService.ts

import axios from "axios";

// 1. CONFIGURACIÓN BASE
// Asume que NEXT_PUBLIC_API_URL está disponible
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
// El endpoint en el backend es 'metodos-pago'
const METODOS_PAGO_BASE_URL = `${API_URL}/metodos-pago`; 

// --- INTERFACES DE DATOS ---

// 1. INTERFAZ PRINCIPAL DE MetodoPago (coincide con la entidad de NestJS)
export interface MetodoPago {
  id: number;
  nombre: string;
}

// 2. TIPO DE DATOS PARA CREACIÓN (solo nombre)
export type CreateMetodoPagoData = {
  nombre: string;
};

// 3. TIPO DE DATOS PARA ACTUALIZACIÓN (parcial, pero solo nombre es relevante)
export type UpdateMetodoPagoData = Partial<CreateMetodoPagoData>;


// --- FUNCIONES CRUD ---

/**
 * Obtiene la lista de métodos de pago.
 * Nota: Para catálogos pequeños, se omite la paginación en el BE, pero
 * mantenemos los parámetros por si se usa paginación/búsqueda en el frontend (useCrudCatalog).
 */
export const getMetodosPago = async (searchTerm: string = "", page: number = 1, pageSize: number = 10): Promise<MetodoPago[]> => {
  // Si el backend no soporta paginación/búsqueda, los parámetros se ignoran aquí,
  // pero los mantenemos para la consistencia con useCrudCatalog.

  // Dado que es un catálogo pequeño, usualmente se llama sin parámetros, pero
  // si se usa el hook de catálogo, se necesita el URLSearchParams.
  const params = new URLSearchParams({
    page: page.toString(),
    limit: pageSize.toString(),
    search: searchTerm,
  });

  const url = `${METODOS_PAGO_BASE_URL}?${params.toString()}`;

  try {
    const res = await axios.get(url);
    // Asumimos que el backend devuelve un array directamente si no hay paginación.
    return res.data; 
  } catch (err: any) {
    console.error(`[getMetodosPago] Error fetching methods from ${url}:`, err?.response?.data ?? err?.toString());
    return []; // Devolvemos un array vacío en caso de error
  }
};

/**
 * Obtener un método de pago por ID.
 */
export const getMetodoPagoById = async (id: number): Promise<MetodoPago> => {
  const res = await axios.get(`${METODOS_PAGO_BASE_URL}/${id}`);
  return res.data;
};

/**
 * Crea un nuevo método de pago.
 */
export const createMetodoPago = async (data: CreateMetodoPagoData): Promise<MetodoPago> => {
  const payload: CreateMetodoPagoData = { ...data };
  console.debug("[createMetodoPago] payload:", payload);
  try {
    const res = await axios.post(METODOS_PAGO_BASE_URL, payload);
    console.debug("[createMetodoPago] response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("[createMetodoPago] error response:", err?.response?.data ?? err?.toString());
    throw err; // Re-lanzar el error para ser capturado por useCrudCatalog
  }
};

/**
 * Actualiza un método de pago existente.
 * Usamos PATCH para actualizaciones parciales.
 */
export const updateMetodoPago = async (id: number, data: UpdateMetodoPagoData): Promise<MetodoPago> => {
  const payload: UpdateMetodoPagoData = { ...data };
  console.debug("[updateMetodoPago] id:", id, "payload:", payload);
  try {
    const res = await axios.patch(`${METODOS_PAGO_BASE_URL}/${id}`, payload);
    console.debug("[updateMetodoPago] response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("[updateMetodoPago] error response:", err?.response?.data ?? err?.toString());
    throw err; // Re-lanzar el error para ser capturado por useCrudCatalog
  }
};

/**
 * Elimina un método de pago.
 */
export const deleteMetodoPago = async (id: number): Promise<void> => {
  // El backend de NestJS devuelve 204 No Content, lo cual es manejado correctamente por axios.
  await axios.delete(`${METODOS_PAGO_BASE_URL}/${id}`);
};
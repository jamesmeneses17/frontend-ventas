// /components/services/clientesService.ts

import axios from "axios";
import { API_URL } from "./apiConfig";
const CLIENTES_BASE_URL = `${API_URL}/clientes`;

// --- INTERFACES DE DATOS ---

// Asumo que el cliente también tiene una relación a tipo_documento_id 
// y posiblemente a un estado (si aplica), aunque lo dejaremos simple por ahora.

// Si necesitas un tipo de documento
export interface TipoDocumento {
  id: number;
  nombre: string;
}

// 1. INTERFAZ PRINCIPAL DE CLIENTE
export interface Cliente {
  id: number;
  nombre: string;
  tipo_documento_id: number;
  numero_documento: string;
  direccion: string;
  correo: string;
  telefono: string;
  tipo_contacto_id?: number;
  tipoContacto?: {
    id: number;
    nombre: string;
  };
  tipo_persona_id?: number;
  tipoPersona?: {
    id: number;
    nombre: string;
  };
  // Puedes añadir campos como:
  // tipoDocumento: TipoDocumento; 
}

// 2. TIPO DE DATOS PARA CREACIÓN
export type CreateClienteData = {
  nombre: string;
  tipo_documento_id: number;
  numero_documento: string;
  direccion: string;
  correo: string;
  telefono: string;
  tipo_contacto_id: number;
  tipo_persona_id: number;
};

// 3. TIPO DE DATOS PARA ACTUALIZACIÓN (Permite actualizar solo algunos campos)
export type UpdateClienteData = Partial<CreateClienteData>;


// --- FUNCIONES CRUD ---

export interface PaginacionResponse<T> {
  data: T[];
  total: number;
}

/**
 * Obtiene la lista de clientes.
 * Soporta paginación y búsqueda.
 */
export const getClientes = async (searchTerm: string = "", page: number = 1, pageSize: number = 10): Promise<PaginacionResponse<Cliente> | Cliente[]> => {
  // Aquí podemos añadir los query params para la paginación y búsqueda
  const params = new URLSearchParams({
    page: page.toString(),
    limit: pageSize.toString(),
    search: searchTerm,
  });

  const url = `${CLIENTES_BASE_URL}?${params.toString()}`;

  try {
    const res = await axios.get(url);
    // Si la API devuelve { data: [], total: 0 }, useCrudCatalog lo manejará correctamente.
    return res.data;
  } catch (err: any) {
    console.error(`[getClientes] Error fetching clients from ${url}:`, err?.response?.data ?? err?.toString());
    return [];
  }
};

/**
 * Obtener un cliente por ID.
 */
export const getClienteById = async (id: number): Promise<Cliente> => {
  const res = await axios.get(`${CLIENTES_BASE_URL}/${id}`);
  return res.data;
};

/**
 * Crea un nuevo cliente.
 */
export const createCliente = async (data: CreateClienteData): Promise<Cliente> => {
  const payload: CreateClienteData = { ...data };
  console.debug("[createCliente] payload:", payload);
  try {
    const res = await axios.post(CLIENTES_BASE_URL, payload);
    console.debug("[createCliente] response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("[createCliente] error response:", err?.response?.data ?? err?.toString());
    throw err;
  }
};

/**
 * Actualiza un cliente existente.
 * Usamos PATCH para actualizaciones parciales.
 */
export const updateCliente = async (id: number, data: UpdateClienteData): Promise<Cliente> => {
  const payload: UpdateClienteData = { ...data };
  console.debug("[updateCliente] id:", id, "payload:", payload);
  try {
    const res = await axios.patch(`${CLIENTES_BASE_URL}/${id}`, payload);
    console.debug("[updateCliente] response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("[updateCliente] error response:", err?.response?.data ?? err?.toString());
    throw err;
  }
};

/**
 * Elimina un cliente.
 */
export const deleteCliente = async (id: number): Promise<void> => {
  await axios.delete(`${CLIENTES_BASE_URL}/${id}`);
};
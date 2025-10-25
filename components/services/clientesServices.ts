// /components/services/clientesService.ts

import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
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
};

// 3. TIPO DE DATOS PARA ACTUALIZACIÓN (Permite actualizar solo algunos campos)
export type UpdateClienteData = Partial<CreateClienteData>;


// --- FUNCIONES CRUD ---

/**
 * Obtiene la lista de clientes.
 * NOTA: Esta versión asume que tu backend maneja el filtrado/paginación
 * a través de query params si se usan. Aquí solo devolvemos la lista completa.
 * @param all - Si es true, podría intentar obtener todos (incluyendo inactivos, si aplica).
 */
export const getClientes = async (searchTerm: string = "", page: number = 1, pageSize: number = 10): Promise<Cliente[]> => {
  // Aquí podemos añadir los query params para la paginación y búsqueda
  const params = new URLSearchParams({
    page: page.toString(),
    limit: pageSize.toString(),
    search: searchTerm,
  });

  const url = `${CLIENTES_BASE_URL}?${params.toString()}`;

  try {
    const res = await axios.get(url);
    // IMPORTANTE: Si tu API de NestJS devuelve un objeto de paginación
    // (ej: { items: [], total: 10 }), deberás ajustar la función de carga en useCrudCatalog
    // para manejar la respuesta. Pero si devuelve directamente el array (res.data), esta línea es correcta:
    return res.data; 
  } catch (err: any) {
    console.error(`[getClientes] Error fetching clients from ${url}:`, err?.response?.data ?? err?.toString());
    // En caso de error, devolvemos un array vacío para no romper la UI
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
// /components/services/inventarioService.ts

import axios from "axios";

// =====================================
// CONFIGURACIÓN DE URL BASE DEL API
// =====================================
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
const INVENTARIO_BASE_URL = `${API_URL}/inventario`;

// =====================================
// INTERFACES DEL INVENTARIO
// =====================================

export interface Inventario {
  id: number;
  productoId: number;  // FK hacia productos
  stock: number;
  ubicacion?: string;
  compras: number;
  ventas: number;
}

export type CreateInventarioData = {
  productoId: number;
  stock: number;
  ubicacion?: string;
  compras?: number;
  ventas?: number;
};

export type UpdateInventarioData = Partial<CreateInventarioData>;

// =====================================
// CRUD PARA INVENTARIO
// =====================================

/**
 * Obtener lista completa del inventario
 */
export const getInventario = async (): Promise<Inventario[]> => {
  try {
    const res = await axios.get(INVENTARIO_BASE_URL);
    return res.data;
  } catch (err: any) {
    console.error("[getInventario] Error:", err?.response?.data ?? err?.toString());
    return [];
  }
};

/**
 * Obtener inventario por ID
 */
export const getInventarioById = async (id: number): Promise<Inventario> => {
  const res = await axios.get(`${INVENTARIO_BASE_URL}/${id}`);
  return res.data;
};

/**
 * Crear registro de inventario
 */
export const createInventario = async (data: CreateInventarioData): Promise<Inventario> => {
  try {
    const res = await axios.post(INVENTARIO_BASE_URL, data);
    return res.data;
  } catch (err: any) {
    console.error("[createInventario] Error:", err?.response?.data ?? err?.toString());
    throw err;
  }
};

/**
 * Actualizar inventario por ID (PATCH = parcial)
 */
export const updateInventario = async (id: number, data: UpdateInventarioData): Promise<Inventario> => {
  try {
    const res = await axios.patch(`${INVENTARIO_BASE_URL}/${id}`, data);
    return res.data;
  } catch (err: any) {
    console.error("[updateInventario] Error:", err?.response?.data ?? err?.toString());
    throw err;
  }
};

/**
 * Eliminar inventario
 */
export const deleteInventario = async (id: number): Promise<void> => {
  await axios.delete(`${INVENTARIO_BASE_URL}/${id}`);
};


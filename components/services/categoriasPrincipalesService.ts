// /components/services/categoriasPrincipalesService.ts

import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
  .replace(/\/+$/g, "");

// ----------------------
// INTERFACES
// ----------------------
export interface Estado {
  id: number;
  nombre: string;
}

export interface CategoriaPrincipal {
  id: number;
  nombre: string;

  estadoId: number;
  estado: Estado;
}

// -------------------------
// DTO PARA CREAR
// -------------------------
export interface CreateCategoriaPrincipalData {
  nombre: string;
  estadoId?: number; // por defecto 1 en el backend
}

// ---------------------------
// DTO PARA ACTUALIZAR
// ---------------------------
export type UpdateCategoriaPrincipalData = Partial<CreateCategoriaPrincipalData>;

// ======================================
// OBTENER TODAS LAS CATEGORÍAS PRINCIPALES
// ======================================
export const getCategoriasPrincipales = async (
  all: boolean = false
): Promise<CategoriaPrincipal[]> => {
  if (!all) {
    const res = await axios.get(`${API_URL}/categorias-principales`);
    return res.data;
  }

  const variants = [
    "?all=true",
    "?all=1",
    "?include_inactive=true",
    "?includeInactive=true",
    "?limit=1000",
  ];

  for (const q of variants) {
    try {
      const res = await axios.get(`${API_URL}/categorias-principales${q}`);
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch {}
  }

  const fallback = await axios.get(`${API_URL}/categorias-principales`);
  return fallback.data;
};

// ======================================
// OBTENER UNA CATEGORÍA PRINCIPAL POR ID
// ======================================
export const getCategoriaPrincipalById = async (
  id: number
): Promise<CategoriaPrincipal> => {
  const res = await axios.get(`${API_URL}/categorias-principales/${id}`);
  return res.data;
};

// ======================================
// CREAR CATEGORÍA PRINCIPAL
// ======================================
export const createCategoriaPrincipal = async (
  data: CreateCategoriaPrincipalData
): Promise<CategoriaPrincipal> => {
  const payload = { ...data };

  try {
    const res = await axios.post(`${API_URL}/categorias-principales`, payload);
    return res.data;
  } catch (err: any) {
    console.error("[createCategoriaPrincipal] error:", err?.response?.data ?? err);
    throw err;
  }
};

// ======================================
// ACTUALIZAR
// ======================================
export const updateCategoriaPrincipal = async (
  id: number,
  data: UpdateCategoriaPrincipalData
): Promise<CategoriaPrincipal> => {
  const payload = { ...data };

  try {
    const res = await axios.patch(
      `${API_URL}/categorias-principales/${id}`,
      payload
    );
    return res.data;
  } catch (err: any) {
    console.error("[updateCategoriaPrincipal] error:", err?.response?.data ?? err);
    throw err;
  }
};

// ======================================
// ELIMINAR
// ======================================
export const deleteCategoriaPrincipal = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/categorias-principales/${id}`);
};

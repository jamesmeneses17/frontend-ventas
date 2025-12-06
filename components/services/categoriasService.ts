// /components/services/categoriasService.ts

import axios from "axios";
import { API_URL } from "./apiConfig";

// Definición del objeto Estado que viene del backend
export interface Estado {
  id: number;
  nombre: string;
}

// 1. ACTUALIZACIÓN DE LA INTERFAZ CATEGORIA
export interface Categoria {
  id: number;
  nombre: string;
  // Nuevos campos para la relación de estado
  estadoId: number; 
  estado: Estado; 
  // referencia a categoría principal (si aplica)
  categoriaPrincipalId?: number;
  categoriaPrincipal?: {
    id: number;
    nombre: string;
  };
}

// 2. TIPO DE DATOS PARA CREACIÓN (Ahora incluye estadoId)
export type CreateCategoriaData = { 
  nombre: string;
  estadoId?: number; // Es opcional porque el backend le pone 1 por defecto
};

// 3. TIPO DE DATOS PARA ACTUALIZACIÓN (Ahora incluye estadoId)
export type UpdateCategoriaData = Partial<CreateCategoriaData>;

export interface PaginacionResponse<T> {
  data: T[];
  total: number;
}

/**
 * Obtener categorías con paginación y búsqueda.
 * @param all - ignorado (mantenido por compatibilidad)
 * @param page - página actual (1-indexed)
 * @param size - tamaño de página
 * @param searchTerm - término de búsqueda
 */
export const getCategorias = async (
  all: boolean = false,
  page: number = 1,
  size: number = 10,
  searchTerm: string = ""
): Promise<PaginacionResponse<Categoria>> => {
  const params: any = {
    page,
    limit: size,
    ...(searchTerm ? { search: searchTerm } : {}),
  };

  try {
    const res = await axios.get(`${API_URL}/categorias`, { params });
    let items: any = res.data;
    let categorias: Categoria[] = [];
    let total = 0;

    // Manejar respuesta paginada o simple
    if (items && Array.isArray(items.data)) {
      categorias = items.data.map(normalizeCategoria);
      total = items.total || categorias.length;
    } else if (Array.isArray(items)) {
      categorias = items.map(normalizeCategoria);
      total = categorias.length;
    }

    return { data: categorias, total };
  } catch (err: any) {
    console.error('[getCategorias] error:', err);
    throw err;
  }
};

export const getCategoriaById = async (id: number): Promise<Categoria> => {
  const res = await axios.get(`${API_URL}/categorias/${id}`);
  return normalizeCategoria(res.data);
};

// ✅ CREACIÓN: data espera { nombre: string, estadoId?: number }
export const createCategoria = async (data: CreateCategoriaData): Promise<Categoria> => {
  // Enviar tanto camelCase como snake_case para compatibilidad con backends que esperan snake_case
  const payload: any = { ...data };
  if (data && (data as any).categoriaPrincipalId !== undefined) {
    payload.categoria_principal_id = (data as any).categoriaPrincipalId;
  }
  console.debug("[createCategoria] payload:", payload);
  try {
    const res = await axios.post(`${API_URL}/categorias`, payload);
    console.debug("[createCategoria] response:", res.data);
    return normalizeCategoria(res.data);
  } catch (err: any) {
    // Log raw server response for diagnóstico (puede ser JSON o HTML)
    console.error("[createCategoria] error response:", err?.response?.data ?? err?.toString());
    // Re-lanzamos para que el caller (form) lo capture
    throw err;
  }
};

// ✅ ACTUALIZACIÓN: data espera Partial<{ nombre: string, estadoId: number }>
export const updateCategoria = async (id: number, data: UpdateCategoriaData): Promise<Categoria> => {
  // Nota: Cambié .patch a .put si tu backend usa PUT, pero mantengo PATCH por convención de actualización parcial
  const payload: any = { ...data };
  if (data && (data as any).categoriaPrincipalId !== undefined) {
    payload.categoria_principal_id = (data as any).categoriaPrincipalId;
  }
  console.debug("[updateCategoria] id:", id, "payload:", payload);
  try {
    const res = await axios.patch(`${API_URL}/categorias/${id}`, payload);
    console.debug("[updateCategoria] response:", res.data);
    return normalizeCategoria(res.data);
  } catch (err: any) {
    console.error("[updateCategoria] error response:", err?.response?.data ?? err?.toString());
    throw err;
  }
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/categorias/${id}`);
};

// ----------------------
// Helpers
// ----------------------
function normalizeCategoria(raw: any): Categoria {
  if (!raw) return raw;
  const normalized: any = { ...raw };

  // map snake_case to camelCase
  if (raw.categoria_principal_id !== undefined) {
    normalized.categoriaPrincipalId = raw.categoria_principal_id;
  }
  if (raw.categoria_principal !== undefined) {
    // puede venir como objeto con id/nombre
    normalized.categoriaPrincipal = raw.categoria_principal;
  }
  // fallback: si viene categoriaPrincipal en camelCase
  if (raw.categoriaPrincipal !== undefined) {
    normalized.categoriaPrincipal = raw.categoriaPrincipal;
  }

  // map estado fields (ya están probablemente correctos)
  if (raw.estado_id !== undefined && !raw.estado) {
    normalized.estadoId = raw.estado_id;
  }

  return normalized as Categoria;
}
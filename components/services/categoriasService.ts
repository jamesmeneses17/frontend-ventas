// /components/services/categoriasService.ts

import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");

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


/**
 * Obtener categorías.
 * @param all - si true, pide todas las categorías (incluye inactivas) añadiendo `?all=true`.
 * Si no se pasa, se usa la ruta por defecto (normalmente devuelve sólo activos según el backend).
 */
export const getCategorias = async (all: boolean = false): Promise<Categoria[]> => {
  if (!all) {
    const res = await axios.get(`${API_URL}/categorias`);
    // Normalizar claves snake_case -> camelCase
    const data = Array.isArray(res.data)
      ? res.data.map(normalizeCategoria)
      : res.data;
    return data as Categoria[];
  }

  // Cuando pedimos todas las categorías, probamos varias convenciones de query
  const attempts = [
    "?all=true",
    "?all=1",
    "?include_inactive=true",
    "?includeInactive=true",
    "?activo=false",
    "?per_page=1000",
    "?limit=1000",
  ];

  for (const q of attempts) {
    try {
      const url = `${API_URL}/categorias${q}`;
      const res = await axios.get(url);
      // Si la respuesta parece contener más de 0 elementos, devolvemos
      if (Array.isArray(res.data) && res.data.length > 0) {
        // Log de diagnóstico: indicar qué intento funcionó
        console.debug(`[getCategorias] intento "${q}" devolvió ${res.data.length} elementos`);
        return res.data.map(normalizeCategoria);
      } else {
        console.debug(`[getCategorias] intento "${q}" devolvió 0 elementos`);
      }
    } catch (err) {
      // Ignoramos y probamos la siguiente variante
      const e: any = err;
      console.debug(`[getCategorias] intento "${q}" fallo:`, e?.message ?? e);
    }
  }

  // Fallback: petición sin query
  const fallback = await axios.get(`${API_URL}/categorias`);
  return (fallback.data || []).map(normalizeCategoria);
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
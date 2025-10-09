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
    return res.data;
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
        return res.data;
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
  return fallback.data;
};

export const getCategoriaById = async (id: number): Promise<Categoria> => {
  const res = await axios.get(`${API_URL}/categorias/${id}`);
  return res.data;
};

// ✅ CREACIÓN: data espera { nombre: string, estadoId?: number }
export const createCategoria = async (data: CreateCategoriaData): Promise<Categoria> => {
  const payload: any = { ...data };
  console.debug("[createCategoria] payload:", payload);
  try {
    const res = await axios.post(`${API_URL}/categorias`, payload);
    console.debug("[createCategoria] response:", res.data);
    return res.data;
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
  console.debug("[updateCategoria] id:", id, "payload:", payload);
  try {
    const res = await axios.patch(`${API_URL}/categorias/${id}`, payload);
    console.debug("[updateCategoria] response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("[updateCategoria] error response:", err?.response?.data ?? err?.toString());
    throw err;
  }
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/categorias/${id}`);
};
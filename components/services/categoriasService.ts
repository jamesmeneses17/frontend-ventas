// /components/services/categoriasService.ts

import axios from "axios";
import { API_URL } from "./apiConfig";

// 1. ACTUALIZACIÓN DE LA INTERFAZ CATEGORIA (usa campo activo)
export interface Categoria {
  id: number;
  nombre: string;
  activo: number; // 1 = activo, 0 = inactivo
  imagen_url?: string | null;
  // referencia a categoría principal (si aplica)
  categoriaPrincipalId?: number;
  categoriaPrincipal?: {
    id: number;
    nombre: string;
  };
}

// 2. TIPO DE DATOS PARA CREACIÓN (usa activo)
export type CreateCategoriaData = { 
  nombre: string;
  activo?: number; // default 1
  categoriaPrincipalId?: number | null;
  imagen_url?: string | null;
};

// 3. TIPO DE DATOS PARA ACTUALIZACIÓN
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

// ✅ CREACIÓN: data espera { nombre: string, activo?: number }
export const createCategoria = async (data: CreateCategoriaData): Promise<Categoria> => {
  // Enviar tanto camelCase como snake_case para compatibilidad con backends que esperan snake_case
  const payload: any = { ...data };
  if (data && (data as any).categoriaPrincipalId !== undefined) {
    payload.categoria_principal_id = (data as any).categoriaPrincipalId;
  }
  if (data.activo === undefined) payload.activo = 1;

  console.debug("[createCategoria] payload:", payload);
  try {
    const res = await axios.post(`${API_URL}/categorias`, payload);
    console.debug("[createCategoria] response:", res.data);
    return normalizeCategoria(res.data);
  } catch (err: any) {
    // Log raw server response para diagnóstico
    console.error("[createCategoria] error response:", err?.response?.data ?? err?.toString());
    throw err;
  }
};

// ✅ ACTUALIZACIÓN: data espera Partial<{ nombre: string, activo: number }>
export const updateCategoria = async (id: number, data: UpdateCategoriaData): Promise<Categoria> => {
  // PATCH para actualización parcial
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

  // map activo (tinyint) y defaults
  if (raw.activo === undefined && raw.active !== undefined) {
    normalized.activo = raw.active;
  }
  if (normalized.activo === undefined) {
    normalized.activo = Number(raw.activo ?? 1);
  } else {
    normalized.activo = Number(normalized.activo);
  }

  // map imagen url (snake/camel/backends diversos)
  if (raw.imagen_url !== undefined) {
    normalized.imagen_url = raw.imagen_url;
  } else if (raw.imagenUrl !== undefined) {
    normalized.imagen_url = raw.imagenUrl;
  } else if (raw.url !== undefined && typeof raw.url === 'string') {
    // algunos endpoints devuelven { url: '...' }
    normalized.imagen_url = raw.url;
  }

  return normalized as Categoria;
}

// ======================================
// SUBIR IMAGEN
// ======================================
export const uploadImagenCategoria = async (id: number, file: File | Blob) => {
  const endpoint = `${API_URL}/categorias/${id}/upload-imagen`;
  const form = new FormData();
  form.append('file', file as any, (file as any).name || 'upload');
  const res = await axios.post(endpoint, form);
  return res.data;
};
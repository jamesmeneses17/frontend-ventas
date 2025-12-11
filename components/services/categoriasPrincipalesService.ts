// /components/services/categoriasPrincipalesService.ts

import axios from "axios";
import { API_URL } from "./apiConfig";

// ----------------------
// INTERFACES
// ----------------------
export interface CategoriaPrincipal {
  id: number;
  nombre: string;
  activo: number; // 1 = activo, 0 = inactivo
  imagen_url?: string | null;
}

// -------------------------
// DTO PARA CREAR
// -------------------------
export interface CreateCategoriaPrincipalData {
  nombre: string;
  activo?: number; // por defecto 1
  imagen_url?: string | null;
}

// ---------------------------
// DTO PARA ACTUALIZAR
// ---------------------------
export type UpdateCategoriaPrincipalData = Partial<CreateCategoriaPrincipalData>;

// ======================================
// OBTENER TODAS LAS CATEGORÍAS PRINCIPALES
// ======================================
export interface PaginacionResponse<T> {
  data: T[];
  total: number;
}

// Normaliza la respuesta del backend para asegurar consistencia
function normalizeCategoriaPrincipal(raw: any): CategoriaPrincipal {
  if (!raw) return raw;
  const normalized: any = { ...raw };
  
  // Si viene imagenUrl (camelCase), convertir a imagen_url (snake_case)
  if (raw.imagenUrl !== undefined) {
    normalized.imagen_url = raw.imagenUrl;
    delete normalized.imagenUrl;
  }
  
  // Asegurar que activo sea número
  if (normalized.activo !== undefined) {
    normalized.activo = Number(normalized.activo);
  }
  
  return normalized as CategoriaPrincipal;
}

export const getCategoriasPrincipales = async (
  page: number = 1,
  size: number = 10,
  searchTerm: string = ""
): Promise<PaginacionResponse<CategoriaPrincipal>> => {
  const params = {
    page,
    limit: size,
    ...(searchTerm ? { search: searchTerm } : {}),
  } as any;

  try {
    const res = await axios.get(`${API_URL}/categorias-principales`, { params });
    
    let items: any = res.data;
    let categorias: CategoriaPrincipal[] = [];
    let total = 0;

    // Handle paginated or simple response
    if (items && Array.isArray(items.data)) {
      categorias = items.data.map(normalizeCategoriaPrincipal);
      total = items.total || categorias.length;
    } else if (Array.isArray(items)) {
      categorias = items.map(normalizeCategoriaPrincipal);
      total = categorias.length;
    }

    return { data: categorias, total };
  } catch (err: any) {
    console.error('[getCategoriasPrincipales] error:', err);
    throw err;
  }
};

// ======================================
// OBTENER UNA CATEGORÍA PRINCIPAL POR ID
// ======================================
export const getCategoriaPrincipalById = async (
  id: number
): Promise<CategoriaPrincipal> => {
  const res = await axios.get(`${API_URL}/categorias-principales/${id}`);
  return normalizeCategoriaPrincipal(res.data);
};

// ======================================
// CREAR CATEGORÍA PRINCIPAL
// ======================================
export const createCategoriaPrincipal = async (
  data: CreateCategoriaPrincipalData
): Promise<CategoriaPrincipal> => {
  const payload = { ...data };
  if (payload.activo === undefined) payload.activo = 1;

  try {
    const res = await axios.post(`${API_URL}/categorias-principales`, payload);
    return normalizeCategoriaPrincipal(res.data);
  } catch (err: any) {
    console.error("[createCategoriaPrincipal] error:", err?.response?.data ?? err);
    const message = extractDuplicateMessage(err) ?? err?.response?.data?.message;
    throw new Error(message || "No se pudo crear la categoría principal.");
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
    return normalizeCategoriaPrincipal(res.data);
  } catch (err: any) {
    console.error("[updateCategoriaPrincipal] error:", err?.response?.data ?? err);
    const message = extractDuplicateMessage(err) ?? err?.response?.data?.message;
    throw new Error(message || "No se pudo actualizar la categoría principal.");
  }
};

// Normaliza errores de duplicado para mostrar un mensaje claro en UI
function extractDuplicateMessage(err: any): string | null {
  const raw = err?.response?.data?.message || err?.message || "";
  const text = Array.isArray(raw) ? raw.join(" ") : String(raw);
  const lower = text.toLowerCase();
  if (lower.includes("duplicate") || lower.includes("duplicado") || lower.includes("ya existe")) {
    return "Ya existe una categoría principal con ese nombre.";
  }
  // Algunos backends retornan código 409 o 400 con detalle personalizado
  if (err?.response?.status === 409 || err?.response?.status === 400) {
    return "Ya existe una categoría principal con ese nombre.";
  }
  // En algunos entornos de Nest/Nginx se devuelve 500 con mensaje genérico
  if (err?.response?.status === 500 && lower.includes("internal server error")) {
    return "Ya existe una categoría principal con ese nombre.";
  }
  return null;
}

// ======================================
// ELIMINAR
// ======================================
export const deleteCategoriaPrincipal = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/categorias-principales/${id}`);
};

// ======================================
// SUBIR IMAGEN
// ======================================
export const uploadImagenCategoriaPrincipal = async (id: number, file: File | Blob) => {
  const endpoint = `${API_URL}/categorias-principales/${id}/upload-imagen`;
  const form = new FormData();
  form.append('file', file as any, (file as any).name || 'upload');
  const res = await axios.post(endpoint, form);
  return normalizeCategoriaPrincipal(res.data);
};

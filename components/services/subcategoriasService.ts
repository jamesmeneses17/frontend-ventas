// components/services/subcategoriasService.ts

import axios from "axios";
import { Categoria } from "./categoriasService"; // Reutilizamos el tipo Categoria

// Configuración de la URL base
// Nota: 'apiClient' (usado antes) es reemplazado por axios configurado aquí
import { API_URL } from "./apiConfig";
const ENDPOINT_BASE = `${API_URL}/subcategorias`;

// --- Interfaces de Datos ---
// -----------------------------------------------------

/**
 * Representación de la Entidad Subcategoría
 * Incluye el nombre de la Categoría Padre para la tabla/vista
 */
export interface Subcategoria {
    id: number;
    nombre: string;
    categoria_id: number; // Clave Foránea al Nivel 2
    categoria_nombre?: string; // Nombre de la categoría padre (para mostrar en la tabla, via JOIN)
    activo: number; // 1 = activo, 0 = inactivo
    imagen_url?: string | null;
    categoria?: Categoria;
}

/**
 * Datos requeridos para crear una nueva Subcategoría (Nivel 3).
 * Basado en CreateSubcategoriaDto.
 */
export interface CreateSubcategoriaData {
    nombre: string;
    categoria_id: number; 
    activo?: number;
    imagen_url?: string | null;
}

/**
 * Datos para actualizar una Subcategoría.
 * Basado en UpdateSubcategoriaDto.
 */
export type UpdateSubcategoriaData = Partial<CreateSubcategoriaData>;

/**
 * Interfaz para la respuesta de paginación del backend.
 */
export interface PaginacionResponse<T> {
    data: T[];
    total: number;
}

/**
 * Respuesta esperada para las estadísticas.
 */
export interface SubcategoriaStats {
    total: number;
    porCategoria: {
        categoriaId: number;
        categoriaNombre: string;
        count: number;
    }[];
    // Se pueden añadir más estadísticas si el backend las proporciona
}

// --------------------------------------------------------------------------------
// --- FUNCIONES DE API ---
// --------------------------------------------------------------------------------

// Normaliza la respuesta del backend para asegurar consistencia
function normalizeSubcategoria(raw: any): Subcategoria {
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
    
    return normalized as Subcategoria;
}

/**
 * Obtener estadísticas de subcategorías.
 * Ejemplo de respuesta esperada del backend:
 * { total: 10, porCategoria: [{ categoriaId: 1, categoriaNombre: 'Electrónica', count: 5 }] }
 */
export const getSubcategoriasStats = async (): Promise<SubcategoriaStats> => {
    const endpoint = `${ENDPOINT_BASE}/stats`;
    try {
        const res = await axios.get(endpoint);
        return res.data;
    } catch (err: any) {
        console.error("Error al obtener estadísticas de subcategorías:", err);
        return { total: 0, porCategoria: [] };
    }
};

/**
 * Obtener subcategorías con paginación y filtro.
 */
export const getSubcategorias = async (
    page: number = 1,
    size: number = 10,
    searchTerm: string = "",
    categoriaId?: number
): Promise<PaginacionResponse<Subcategoria>> => {
    const params = {
        page,
        limit: size,
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(typeof categoriaId !== 'undefined' ? { categoriaId } : {}),
    } as any;

    try {
        const res = await axios.get(ENDPOINT_BASE, { params });
        
        let items: any = res.data;
        let subcategorias: Subcategoria[] = [];
        let total = 0;

        // Manejar la respuesta paginada o simple
        if (items && Array.isArray(items.data)) {
            subcategorias = items.data.map(normalizeSubcategoria);
            total = items.total || subcategorias.length;
        } else if (Array.isArray(items)) {
            subcategorias = items.map(normalizeSubcategoria);
            total = subcategorias.length;
        }

        // Normalización básica (asegurar tipos si fuera necesario)
        const normalized: Subcategoria[] = subcategorias.map((it: any) => {
            // Obtener categoria_id de múltiples fuentes posibles
            const categoriaIdValue = 
              it.categoria_id ||
              it.categoriaId ||
              it.categoria?.id ||
              (it.categoria && typeof it.categoria === 'object' && it.categoria.id);
            
            return {
              ...it,
              id: Number(it.id),
              categoria_id: categoriaIdValue ? Number(categoriaIdValue) : undefined,
              categoriaId: categoriaIdValue ? Number(categoriaIdValue) : undefined,
              // Extraer categoriaPrincipalId desde la relación anidada
              categoriaPrincipalId: it.categoria?.categoria_principal?.id 
                ? Number(it.categoria.categoria_principal.id)
                : it.categoriaPrincipalId 
                  ? Number(it.categoriaPrincipalId)
                  : undefined,
              // Asegurar que el nombre de la categoría esté disponible
                            categoria_nombre: it.categoria_nombre ?? it.categoria?.nombre ?? 'N/A',
                            activo: Number(it.activo ?? 1),
            };
        });

        return { data: normalized, total };
    } catch (err: any) {
        console.error("Error al obtener subcategorías:", err?.message ?? err);
        throw err; // Relanzar para que el hook lo capture
    }
};

/**
 * Crea una nueva subcategoría.
 */
export const createSubcategoria = async (data: CreateSubcategoriaData): Promise<Subcategoria> => {
    try {
        const payload = { ...data };
        if (payload.activo === undefined) payload.activo = 1;
        const res = await axios.post(ENDPOINT_BASE, payload);
        return normalizeSubcategoria(res.data);
    } catch (err: any) {
        const message = normalizeSubcategoriaError(err);
        throw new Error(message);
    }
};

/**
 * Actualiza una subcategoría existente.
 */
export const updateSubcategoria = async (id: number, data: UpdateSubcategoriaData): Promise<Subcategoria> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    try {
        const res = await axios.patch(endpoint, data);
        return normalizeSubcategoria(res.data);
    } catch (err: any) {
        const message = normalizeSubcategoriaError(err);
        throw new Error(message);
    }
};

/**
 * Elimina una subcategoría.
 */
export const deleteSubcategoria = async (id: number): Promise<void> => {
    await axios.delete(`${ENDPOINT_BASE}/${id}`);
};

// Normaliza mensajes de error para surfacerlos en el toast del hook
function normalizeSubcategoriaError(err: any): string {
    const status = err?.response?.status;
    const raw = err?.response?.data?.message || err?.message || "Error al procesar la solicitud.";
    const text = Array.isArray(raw) ? raw.join(" | ") : String(raw);
    const lower = text.toLowerCase();

    if (lower.includes("duplicate") || lower.includes("duplicado") || lower.includes("ya existe")) {
        return "Ya existe una subcategoría con ese nombre.";
    }
    if (status === 409 || status === 400) {
        return "Ya existe una subcategoría con ese nombre.";
    }
    if (status === 500 && lower.includes("internal server error")) {
        return "No se pudo procesar la subcategoría. Revisa los datos o intenta de nuevo.";
    }
    return text || "No se pudo procesar la subcategoría.";
}

// ======================================
// SUBIR IMAGEN
// ======================================
export const uploadImagenSubcategoria = async (id: number, file: File | Blob) => {
    const endpoint = `${ENDPOINT_BASE}/${id}/upload-imagen`;
    const form = new FormData();
    form.append('file', file as any, (file as any).name || 'upload');
    const res = await axios.post(endpoint, form);
    return normalizeSubcategoria(res.data);
};
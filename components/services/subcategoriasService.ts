// /components/services/subcategoriasService.ts

import axios from "axios";

// Reutiliza la lógica de URL y la interfaz Estado si es compartida
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");

// Definición del objeto Estado que viene del backend
// NOTA: Asumo que esta interfaz (Estado) ya está definida o importada en tu proyecto.
export interface Estado {
    id: number;
    nombre: string;
}

// Interfaz para la Categoría (necesaria para la relación de Subcategoría)
// 🛑 AJUSTE CLAVE: Agregamos estadoId y estado al objeto Categoria, ya que tu API lo devuelve anidado.
export interface Categoria {
    id: number;
    nombre: string;
    estadoId?: number; // Agregado para coincidir con la respuesta del backend
    estado?: Estado;   // Agregado para coincidir con la respuesta del backend
}

// 1. INTERFAZ SUBCATEGORIA (Incluye las relaciones Categoria y Estado)
export interface Subcategoria {
    id: number;
    nombre: string;
    // Campos para la relación de estado
    estadoId: number;
    estado: Estado;
    // Campos para la relación con Categoría Padre
    categoriaId: number;
    categoria: Categoria; // Usa tu interfaz Categoria con las nuevas propiedades
}

// 2. TIPO DE DATOS PARA CREACIÓN
export type CreateSubcategoriaData = {
    nombre: string;
    categoriaId: number; // Requerido al crear una subcategoría
    estadoId?: number; // Es opcional porque el backend le pone 1 por defecto
};

// 3. TIPO DE DATOS PARA ACTUALIZACIÓN
export type UpdateSubcategoriaData = Partial<CreateSubcategoriaData>;


/**
 * Obtener subcategorías.
 * @param all 
 */
export const getSubcategorias = async (all: boolean = false): Promise<Subcategoria[]> => {
    // NOTE: En esta aplicación las "subcategorias" ya no existen en la base de datos.
    // Para evitar llamadas 404 desde múltiples componentes, devolvemos un arreglo
    // vacío y mostramos un aviso en consola. Si en el futuro se agregan
    // subcategorías en el backend, se puede restaurar la implementación.
    console.warn('[getSubcategorias] El backend no expone /subcategorias — devolviendo arreglo vacío');
    return [];
};

export const getSubcategoriaById = async (id: number): Promise<Subcategoria> => {
    throw new Error('getSubcategoriaById: subcategorías no soportadas por el backend');
};

export const createSubcategoria = async (data: CreateSubcategoriaData): Promise<Subcategoria> => {
    throw new Error('createSubcategoria: subcategorías no soportadas por el backend');
};

// ✅ ACTUALIZACIÓN: data espera Partial<{ nombre: string, categoriaId: number, estadoId: number }>
export const updateSubcategoria = async (id: number, data: UpdateSubcategoriaData): Promise<Subcategoria> => {
    throw new Error('updateSubcategoria: subcategorías no soportadas por el backend');
};

export const deleteSubcategoria = async (id: number): Promise<void> => {
    throw new Error('deleteSubcategoria: subcategorías no soportadas por el backend');
};
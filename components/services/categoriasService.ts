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


export const getCategorias = async (): Promise<Categoria[]> => {
  // El backend ya filtra solo los activos, no necesitamos hacer nada aquí.
  const res = await axios.get(`${API_URL}/categorias`);
  return res.data;
};

export const getCategoriaById = async (id: number): Promise<Categoria> => {
  const res = await axios.get(`${API_URL}/categorias/${id}`);
  return res.data;
};

// ✅ CREACIÓN: data espera { nombre: string, estadoId?: number }
export const createCategoria = async (data: CreateCategoriaData): Promise<Categoria> => {
  const res = await axios.post(`${API_URL}/categorias`, data);
  return res.data;
};

// ✅ ACTUALIZACIÓN: data espera Partial<{ nombre: string, estadoId: number }>
export const updateCategoria = async (id: number, data: UpdateCategoriaData): Promise<Categoria> => {
  // Nota: Cambié .patch a .put si tu backend usa PUT, pero mantengo PATCH por convención de actualización parcial
  const res = await axios.patch(`${API_URL}/categorias/${id}`, data);
  return res.data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/categorias/${id}`);
};
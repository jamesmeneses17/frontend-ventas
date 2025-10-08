// /components/services/categoriasService.ts

import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");

export interface Categoria {
  id: number;
  nombre: string;
}


export const getCategorias = async (): Promise<Categoria[]> => {
  const res = await axios.get(`${API_URL}/categorias`);
  return res.data;
};

export const getCategoriaById = async (id: number): Promise<Categoria> => {
  const res = await axios.get(`${API_URL}/categorias/${id}`);
  return res.data;
};

// ✅ CREACIÓN: data espera solo { nombre: string }
export const createCategoria = async (data: { nombre: string }): Promise<Categoria> => {
  const res = await axios.post(`${API_URL}/categorias`, data);
  return res.data;
};

// ✅ ACTUALIZACIÓN: data espera solo Partial<{ nombre: string }>
export const updateCategoria = async (id: number, data: Partial<Categoria>): Promise<Categoria> => {
  const res = await axios.patch(`${API_URL}/categorias/${id}`, data);
  return res.data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/categorias/${id}`);
};
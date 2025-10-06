import axios from "axios";

// Use environment variable (NEXT_PUBLIC_API_URL) when available, otherwise fall back to localhost for dev.
// Trim trailing slashes so `${API_URL}/categorias` never becomes `...//categorias`.
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: "Activo" | "Inactivo";
}

export const getCategorias = async (): Promise<Categoria[]> => {
  const res = await axios.get(`${API_URL}/categorias`);
  return res.data;
};

export const getCategoriaById = async (id: number): Promise<Categoria> => {
  const res = await axios.get(`${API_URL}/categorias/${id}`);
  return res.data;
};

export const createCategoria = async (data: Omit<Categoria, "id">): Promise<Categoria> => {
  const res = await axios.post(`${API_URL}/categorias`, data);
  return res.data;
};

export const updateCategoria = async (id: number, data: Partial<Categoria>): Promise<Categoria> => {
  const res = await axios.patch(`${API_URL}/categorias/${id}`, data);
  return res.data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/categorias/${id}`);
};

import axios from "axios";

// 🛑 IMPORTANTE: Asumo que la interfaz Estado ya existe y es re-utilizable.
import { Estado } from "./subcategoriasService"; // O donde la tengas definida

// La URL base de tu API
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
const ENDPOINT = `${API_URL}/marcas`;

// 1. INTERFAZ MARCA
// Basado en el patrón de Categorías/Subcategorías, una Marca probablemente tiene un ID, Nombre y un Estado.
export interface Marca {
    id: number;
    nombre: string;
    // La Marca probablemente tiene una relación de estado para activarla/desactivarla.
    estadoId: number; 
    estado: Estado; // Objeto anidado del estado
}

// 2. TIPO DE DATOS PARA CREACIÓN (Suficiente con nombre y el estado es opcional)
export type CreateMarcaData = {
    nombre: string;
    estadoId?: number; // Opcional si el backend le pone 1 por defecto
};

// 3. TIPO DE DATOS PARA ACTUALIZACIÓN
export type UpdateMarcaData = Partial<CreateMarcaData>;


// --- Funciones del Servicio ---

/** Obtener todas las marcas. */
export const getMarcas = async (all: boolean = false): Promise<Marca[]> => {
    // Si necesitas incluir inactivos, puedes replicar la lógica de getSubcategorias
    const res = await axios.get(`${ENDPOINT}${all ? '?all=true' : ''}`);
    return res.data;
};

/** Obtener una marca por ID. */
export const getMarcaById = async (id: number): Promise<Marca> => {
    const res = await axios.get(`${ENDPOINT}/${id}`);
    return res.data;
};

/** Crear una nueva marca. */
export const createMarca = async (data: CreateMarcaData): Promise<Marca> => {
    const res = await axios.post(ENDPOINT, data);
    return res.data;
};

/** Actualizar una marca existente. */
export const updateMarca = async (id: number, data: UpdateMarcaData): Promise<Marca> => {
    const res = await axios.patch(`${ENDPOINT}/${id}`, data);
    return res.data;
};

/** Eliminar una marca. */
export const deleteMarca = async (id: number): Promise<void> => {
    await axios.delete(`${ENDPOINT}/${id}`);
};
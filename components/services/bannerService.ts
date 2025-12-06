// src/components/services/bannerService.ts

import axios from "axios";
// Importamos las interfaces específicas de Banner
import { Banner, CreateBannerData, UpdateBannerData } from "../../types/configuracion";

// ===================================================================
// BASE DE CONEXIÓN
// ===================================================================

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
  .replace(/\/+$/g, "");

// Usaremos un cliente axios genérico
const api = axios; 

// Endpoint base para el módulo de Banners
const BANNERS_BASE_URL = `${API_URL}/configuracion/banners`;


// ===================================================================
// BANNERS: CRUD
// ===================================================================

/**
 * RUTA GET: /configuracion/banners
 * Obtiene todos los banners, ordenados por el campo 'orden'.
 */
export async function getBanners(): Promise<Banner[]> {
    try {
        const response = await api.get(BANNERS_BASE_URL);
        return response.data;
    } catch (err: any) {
        console.error("[getBanners] error:", err?.response?.data ?? err);
        throw err;
    }
}

/**
 * RUTA POST: /configuracion/banners
 * Crea un nuevo banner.
 */
export async function createBanner(data: CreateBannerData): Promise<Banner> {
    try {
        const response = await api.post(BANNERS_BASE_URL, data);
        return response.data;
    } catch (err: any) {
        console.error("[createBanner] error:", err?.response?.data ?? err);
        throw err;
    }
}

/**
 * RUTA PUT: /configuracion/banners/:id
 * Actualiza un banner existente.
 */
export async function updateBanner(id: number, data: UpdateBannerData): Promise<Banner> {
    try {
        const response = await api.put(`${BANNERS_BASE_URL}/${id}`, data);
        return response.data;
    } catch (err: any) {
        console.error("[updateBanner] error:", err?.response?.data ?? err);
        throw err;
    }
}

/**
 * RUTA DELETE: /configuracion/banners/:id
 * Elimina un banner.
 */
export async function deleteBanner(id: number): Promise<void> {
    try {
        await api.delete(`${BANNERS_BASE_URL}/${id}`);
    } catch (err: any) {
        console.error("[deleteBanner] error:", err?.response?.data ?? err);
        throw err;
    }
}
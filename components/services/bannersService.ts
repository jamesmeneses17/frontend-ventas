import axios from 'axios';
import { API_URL } from './apiConfig';

const ENDPOINT_BASE = `${API_URL}/configuracion/banners`;

export interface BannerImagen {
    id: number;
    urlImagen: string;
    orden: number;
    activo: boolean;
}

export interface Banner {
    id: number;
    nombre?: string;
    activo: boolean;
    imagenes: BannerImagen[];
}

export interface CreateBannerDto {
    nombre: string;
}

export const getBanners = async (): Promise<Banner[]> => {
    const response = await axios.get(ENDPOINT_BASE);
    return response.data;
};

export const getBannerById = async (id: number): Promise<Banner> => {
    const response = await axios.get(`${ENDPOINT_BASE}/${id}`);
    return response.data;
};

export const createBanner = async (data: CreateBannerDto): Promise<Banner> => {
    const response = await axios.post(ENDPOINT_BASE, data);
    return response.data;
};

export const uploadBannerImagen = async (bannerId: number, file: File): Promise<BannerImagen> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${ENDPOINT_BASE}/${bannerId}/imagenes`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.imagen;
};

export const updateBannerImagen = async (imagenId: number, activo: boolean): Promise<BannerImagen> => {
    const response = await axios.put(`${ENDPOINT_BASE}/imagenes/${imagenId}`, { activo });
    return response.data;
};

export const deleteBannerImagen = async (imagenId: number): Promise<void> => {
    await axios.delete(`${ENDPOINT_BASE}/imagenes/${imagenId}`);
};

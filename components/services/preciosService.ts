// /components/services/preciosService.ts

import axios from "axios";
// Asumiendo que tienes tu Producto interface importable o definida.
import { Producto, Categoria, getProductos, updateProducto } from "./productosService"; 

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
const ENDPOINT_BASE = `${API_URL}/precios`;

// --- Interfaces Necesarias ---

// 1. Tipo que usará el CRUD (extiende el tipo de datos de precio)
export interface PrecioConProducto {
    id: number;
    valor_unitario: number;
    valor_final: number; // Precio después de descuento/promoción
    descuento_porcentaje: number;
    estado: 'Normal' | 'En Promoción'; // Estado calculado
    
    // Campos necesarios para la tabla y el formulario
    fecha_inicio: string;
    fecha_fin: string | null;
    productoId: number;
    
    // Datos del producto relacionados
    producto: {
        id: number;
        nombre: string;
        codigo: string;
        categoria: Categoria;
    }
}

// 2. Tipos para la paginación
export interface PaginacionResponse<T> {
    data: T[];
    total: number;
}

// 3. Tipos para el formulario
export type CreatePrecioData = {
    productoId: number;
    valor_unitario: number;
    descuento_porcentaje?: number;
    fecha_inicio: string; // Puede ser un Date o string según tu backend
    fecha_fin?: string;
};
export type UpdatePrecioData = Partial<CreatePrecioData>;


// 4. Tipos para las estadísticas
export interface PrecioStats {
    totalProductos: number;
    productosEnPromocion: number;
    precioPromedio: number;
}


// --- FUNCIONES CRUD ---

/**
 * Obtiene la lista de precios con paginación y búsqueda.
 */
export const getPrecios = async (
    page: number = 1,
    size: number = 5,
    searchTerm: string = ""
): Promise<PaginacionResponse<PrecioConProducto> | PrecioConProducto[]> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", size.toString());
    if (searchTerm) params.append("search", searchTerm);

    const endpoint = `${ENDPOINT_BASE}?${params.toString()}`;

    try {
        const res = await axios.get(endpoint);
        // El backend puede devolver { data: Precio[], total } o simplemente un array.
        let items: any = res.data;
        let precios: any[] = [];
        let total = 0;

        if (items && Array.isArray(items.data)) {
            precios = items.data;
            total = items.total || precios.length;
        } else if (Array.isArray(items)) {
            precios = items;
            total = precios.length;
        }

        // Intentamos obtener lista de productos para enriquecer los precios si vienen solo con productoId
        let productosList: Producto[] = [];
        try {
            const prodsRes = await getProductos(1, 1000, "", "");
            productosList = prodsRes.data || [];
        } catch (e) {
            // Si falla, dejamos la lista vacía; seguiremos devolviendo precios sin producto asociado
            productosList = [];
        }

    const enriched = precios.map((p: any) => {
            const productoEncontrado = productosList.find(pr => Number(pr.id) === Number(p.productoId) || Number(pr.id) === Number(p.producto?.id));
            const valor_unitario = Number(p.valor_unitario ?? p.valor ?? 0);
            const descuento = Number(p.descuento_porcentaje ?? 0);
            const valor_final = Number(p.valor_final ?? (valor_unitario * (1 - descuento / 100)));

            return {
                id: Number(p.id),
                productoId: Number(p.productoId ?? p.producto?.id ?? 0),
                valor_unitario,
                descuento_porcentaje: descuento,
                valor_final,
                estado: p.estado || (descuento > 0 ? "En Promoción" : "Normal"),
                fecha_inicio: p.fecha_inicio ?? p.start_date ?? null,
                fecha_fin: p.fecha_fin ?? p.end_date ?? null,
                producto: productoEncontrado || p.producto || null,
            } as PrecioConProducto;
        });

        // Si el backend originalmente devolvió un array simple, devolvemos
        // también un array para que useCrudCatalog haga el paginado en cliente.
        if (Array.isArray(items)) {
            return enriched;
        }

        // Si el backend devolvió un objeto paginado ({ data, total }),
        // respetamos esa forma y devolvemos { data, total }.
        return { data: enriched, total };
    } catch (err) {
        console.error("Error al obtener precios:", err);
        return { data: [], total: 0 };
    }
};

/**
 * Obtiene las estadísticas para los widgets.
 */
export const getPreciosStats = async (): Promise<PrecioStats> => {
    // 💡 NOTA: DEBES IMPLEMENTAR ESTE ENDPOINT EN EL BACKEND
    // Ejemplo: /precios/stats
    try {
        const res = await axios.get(`${ENDPOINT_BASE}/stats`);
        return res.data as PrecioStats;
    } catch (err) {
        console.error("Error al obtener estadísticas de precios:", err);
        return { totalProductos: 0, productosEnPromocion: 0, precioPromedio: 0 };
    }
};

// --- CRUD BÁSICO ---

export const createPrecio = async (data: CreatePrecioData): Promise<any> => {
    console.log('[createPrecio] Enviando a /precios payload:', data);
    const res = await axios.post(ENDPOINT_BASE, data);
    const created = res.data;
    console.log('[createPrecio] Respuesta creación precio:', created);

    // Si la creación del precio fue exitosa y viene un productoId,
    // intentamos también actualizar el producto para reflejar el precio
    // en el campo `precio_costo` (mappeado por productosService.updateProducto).
    try {
        if (data && typeof data.productoId !== "undefined" && data.productoId > 0) {
            console.log(`[createPrecio] Intentando actualizar producto id=${data.productoId} con precio_costo=${data.valor_unitario}`);
            // Llamamos a updateProducto para que el campo 'precio' se mapee a 'precio_costo'
            await updateProducto(Number(data.productoId), { precio: Number(data.valor_unitario) });
            console.log(`[createPrecio] updateProducto ok para producto id=${data.productoId}`);
        }
    } catch (err) {
        // No hacemos fallar la creación del precio si la actualización del producto falla,
        // pero dejamos un log para ayudar al debugging.
        console.error("Precio creado pero falló al actualizar el producto con precio_costo:", err);
    }

    return created;
};

export const updatePrecio = async (id: number, data: UpdatePrecioData): Promise<any> => {
    // Asume que el backend tiene un endpoint para actualizar precios existentes
    const res = await axios.patch(`${ENDPOINT_BASE}/${id}`, data);
    return res.data;
};

export const deletePrecio = async (id: number): Promise<void> => {
    await axios.delete(`${ENDPOINT_BASE}/${id}`);
};
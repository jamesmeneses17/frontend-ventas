// components/services/productosService.ts

import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
const ENDPOINT_BASE = `${API_URL}/productos`;

// --- Interfaces de Soporte ---
export interface Estado {
    id: number;
    nombre: string;
}

export interface Categoria {
    id: number;
    nombre: string;
}

// Interfaz simplificada para la relación de precios
export interface Precio {
    id: number;
    valor_unitario: number;
    fecha_inicio: string;
    fecha_fin: string | null;
    productoId: number;
}

// 1. INTERFAZ PRODUCTO (Actualizada para incluir campos del formulario y DTO)
export interface Producto {
    id: number;
    nombre: string;
    codigo: string;             // <-- Añadido: Requerido por el formulario
    descripcion?: string; 
    ficha_tecnica_url?: string; // <-- Añadido: Requerido por el formulario
    
    // Estos campos se usan en el formulario, aunque en el backend
    // provengan de tablas relacionadas (Inventario/Precios)
    stock?: number;             
    precio?: number;            // <-- Añadido para RHF, aunque se use de la relación 'precios'
    
    // Relaciones 
    caracteristicas?: any[];
    precios?: Precio[]; 
    inventario?: any[];

    // Campos obligatorios/de relación
    estadoId: number;
    categoriaId: number;
    // Relación opcional para mostrar el nombre del estado directamente si viene en el producto
    estado?: Estado;
}

// 2. TIPO DE DATOS PARA CREACIÓN/ACTUALIZACIÓN (CORREGIDO)
// Estos tipos deben reflejar exactamente lo que espera tu DTO de NestJS (CreateProductoDto)
export type CreateProductoData = {
    nombre: string;
    codigo: string;
    descripcion: string;
    ficha_tecnica_url?: string;
    
    // Asumimos que el DTO de NestJS espera estos valores
    // para crear registros iniciales en Inventario y/o Precios.
    stock: number;
    precio: number;
    
    categoriaId: number;
    estadoId?: number;
};
export type UpdateProductoData = Partial<CreateProductoData>;



// --------------------------------------------------------------------------------
// --- FUNCIONES CRUD ---
// --------------------------------------------------------------------------------

/**
 * Obtener productos activos.
 */
export const getProductos = async (subcategoriaId?: number, categoriaId?: number): Promise<Producto[]> => {
    let endpoint = ENDPOINT_BASE;
    const params = new URLSearchParams();

    // Lógica de filtrado (EXISTENTE EN TU MOLDE)
    if (subcategoriaId && !isNaN(subcategoriaId) && subcategoriaId > 0) {
        params.append('subcategoriaId', String(subcategoriaId));
        console.log(`[getProductos] Filtrando por subcategoría ID: ${subcategoriaId}`);
    } else if (categoriaId && !isNaN(categoriaId) && categoriaId > 0) { 
        params.append('categoriaId', String(categoriaId));
        console.log(`[getProductos] Filtrando por CATEGORÍA ID: ${categoriaId}`);
    } else {
        console.log('[getProductos] Trayendo todos los productos (sin filtro).');
    }

    if (params.toString()) {
        endpoint += `?${params.toString()}`;
    }

    try {
        const res = await axios.get(endpoint);
        let items: any = res.data;

        // Normalización de la respuesta (EXISTENTE EN TU MOLDE)
        if (!Array.isArray(items)) {
            if (items && Array.isArray(items.data)) {
                items = items.data;
            } else if (items && Array.isArray(items.productos)) {
                items = items.productos;
            } else if (items && Array.isArray(items.items)) {
                items = items.items;
            } else {
                console.debug('[getProductos] respuesta inesperada, intentando normalizar:', res.data);
                return [];
            }
        }

        // Asegurarnos de que los precios tengan valor_unitario como number (EXISTENTE EN TU MOLDE)
        const normalized = items.map((it: any) => {
            const precios = Array.isArray(it.precios)
                ? it.precios.map((p: any) => ({ ...p, valor_unitario: Number(p.valor_unitario) }))
                : [];
            // Opcional: Asignar el precio más reciente/actual al campo 'precio' del Producto para RHF
            const precioActual = precios.length > 0 ? precios[0].valor_unitario : 0; 

            return { 
                ...it, 
                precios,
                precio: precioActual, 
                stock: it.inventario?.[0]?.stock_actual || 0 // Asumo que el stock viene del primer inventario
            };
        });

        return normalized as Producto[];

    } catch (err: any) {
        console.error("[getProductos] Error al obtener productos:", err?.message ?? err);
        if (axios.isAxiosError(err) && err.response) {
            console.error("Respuesta del API:", err.response.data);
            throw new Error(`Error en el API: ${err.response.statusText}.`);
        }
        throw new Error("No se pudo conectar al servicio de productos. Verifique API_URL.");
    }
};

/**
 * Obtener un producto por ID.
 */
export const getProductoById = async (id: number): Promise<Producto> => {
    // Usa findOneWithRelations en el backend para obtener todos los campos necesarios
    const res = await axios.get(`${ENDPOINT_BASE}/${id}/with-relations`); 
    return res.data;
};

/**
 * Crea un nuevo producto.
 * Consume POST /productos
 * @param {CreateProductoData} data - Datos del nuevo producto.
 * @returns {Promise<Producto>} El producto creado.
 */
export const createProducto = async (data: CreateProductoData): Promise<Producto> => {
    console.log("[createProducto] Enviando datos:", data);
    const res = await axios.post(ENDPOINT_BASE, data);
    return res.data;
};

/**
 * Actualiza un producto existente.
 * Consume PATCH /productos/:id
 * @param {number} id - ID del producto a actualizar.
 * @param {UpdateProductoData} data - Datos a actualizar.
 * @returns {Promise<Producto>} El producto actualizado.
 */
export const updateProducto = async (id: number, data: UpdateProductoData): Promise<Producto> => {
    console.log(`[updateProducto] Enviando actualización para ID ${id}:`, data);
    const res = await axios.patch(`${ENDPOINT_BASE}/${id}`, data);
    return res.data;
};

/**
 * Elimina un producto.
 * Consume DELETE /productos/:id
 * @param {number} id - ID del producto a eliminar.
 */
export const deleteProducto = async (id: number): Promise<void> => {
    await axios.delete(`${ENDPOINT_BASE}/${id}`);
};
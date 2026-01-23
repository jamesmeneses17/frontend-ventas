// Extiende Producto para la vista de inventario con campos calculados del backend
export interface ProductoInventario extends Producto {
    promocion_porcentaje: number;
    precio_con_descuento: number;
    utilidad: number;
    valor_inventario: number;
    precio_venta?: number; // Agregado para evitar error en la tabla
    precio_costo?: number; // Agregado para evitar error en la tabla
}
import axios from "axios";
import { API_URL } from "./apiConfig";

const ENDPOINT_BASE = `${API_URL}/productos`;

/**
 * Obtener estadísticas de productos por estado.
 * Ejemplo de respuesta esperada del backend:
 * {
 *   total: 168,
 *   stockBajo: 3,
 *   agotado: 1
 * }
 */
export const getProductosStats = async (): Promise<{ total: number; stockBajo: number; agotado: number }> => {
    const endpoint = `${ENDPOINT_BASE}/stats`;
    try {
        const res = await axios.get(endpoint);
        return res.data;
    } catch (err: any) {
        console.error("Error al obtener estadísticas de productos:", err);
        return { total: 0, stockBajo: 0, agotado: 0 };
    }
};
/**
 * Crea un nuevo producto.
 */
export const createProducto = async (data: CreateProductoData): Promise<Producto> => {
    const payload: any = { ...data };

    // Mapear precio_venta si viene
    if (payload.precio_venta !== undefined) {
        payload.precio_venta = Number(payload.precio_venta) || 0;
    }
    if (payload.precio !== undefined) {
        payload.precio = Number(payload.precio) || 0;
        // algunos backends esperan precio_costo
        payload.precio_costo = payload.precio;
    }

    // Si subcategoriaId es 0, enviarlo como null (sin subcategoría)
    if (payload.subcategoriaId === 0) {
        payload.subcategoriaId = null;
    }

    // Eliminar claves con undefined para no enviar campos de más
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const res = await axios.post(ENDPOINT_BASE, payload);
    return res.data as Producto;
};

/**
 * Actualiza un producto existente.
 */
export const updateProducto = async (id: number, data: UpdateProductoData): Promise<Producto> => {
    const payload: any = { ...data };

    console.log('==========================================');
    console.log('[updateProducto] 🔵 Datos recibidos:', data);
    console.log('[updateProducto] 🔵 ID del producto:', id);

    // Convertir camelCase a lo que espera el backend, respetando los tres casos
    if ('categoriaId' in data) {
        const cat = data.categoriaId;
        if (cat === null) {
            payload.categoriaId = null;
            console.log('[updateProducto] categoriaId=null → enviando null');
        } else if (typeof cat === 'number') {
            payload.categoriaId = cat;
            console.log('[updateProducto] categoriaId numérico → enviando:', cat);
        }
    }

    // 🔥 MANEJO MEJORADO DE SUBCATEGORÍA
    if ('subcategoriaId' in data) {
        const subcat = data.subcategoriaId;
        console.log('[updateProducto] subcategoriaId detectado en data:', subcat, 'tipo:', typeof subcat);

        if (subcat === null) {
            // Explícitamente null → desvincular subcategoría
            payload.subcategoriaId = null;
            console.log('[updateProducto] ✅ subcategoriaId=null → DESVINCULAR subcategoría');
        } else if (subcat === 0) {
            // 0 también significa desvincular
            payload.subcategoriaId = null;
            console.log('[updateProducto] ✅ subcategoriaId=0 → convertido a null para DESVINCULAR');
        } else if (typeof subcat === 'number' && subcat > 0) {
            // Número válido → vincular
            payload.subcategoriaId = subcat;
            console.log('[updateProducto] ✅ subcategoriaId numérico → vincular:', subcat);
        }
    }

    // Mapear precios
    if ('precio_venta' in data) {
        const pv = Number((data as any).precio_venta);
        if (!Number.isNaN(pv)) {
            payload.precio_venta = pv;
            console.log('[updateProducto] precio_venta →', pv);
        }
    }

    // ✅ Manejo específico de precio_costo
    if ('precio_costo' in data) {
        const pcosto = Number((data as any).precio_costo);
        if (!Number.isNaN(pcosto)) {
            payload.precio_costo = pcosto;
            console.log('[updateProducto] precio_costo →', pcosto);
        }
    }

    if ('precio' in data) {
        const pc = Number((data as any).precio);
        if (!Number.isNaN(pc)) {
            payload.precio = pc;
            // Si no se envió precio_costo explícitamente, usar precio
            if (!('precio_costo' in data)) {
                payload.precio_costo = pc;
            }
            console.log('[updateProducto] precio →', pc);
        }
    }

    // Eliminar claves con undefined para no enviar campos de más ni sobreescribir
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const endpoint = `${ENDPOINT_BASE}/${id}`;
    console.log('[updateProducto] 🚀 PATCH', endpoint);
    console.log('[updateProducto] 🚀 PAYLOAD ENVIADO AL BACKEND:', JSON.stringify(payload, null, 2));
    console.log('==========================================');

    const res = await axios.patch(endpoint, payload);

    console.log('[updateProducto] ✅ Respuesta del backend:', res?.data);
    return res.data as Producto;
};

/**
 * Elimina un producto.
 */
export const deleteProducto = async (id: number): Promise<void> => {
    await axios.delete(`${ENDPOINT_BASE}/${id}`);
};
// components/services/productosService.ts

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

// Interfaz para imágenes del producto
export interface ProductoImagen {
    id: number;
    producto_id: number;
    url_imagen: string;
    orden: number;
}

// 1. INTERFAZ PRODUCTO (CORREGIDA)
export interface Producto {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string;
    ficha_tecnica_url?: string;
    imagenes?: ProductoImagen[];    // ✅ Campos aplanados/calculados que vienen del backend
    stock: number;             // DEBE SER OBLIGATORIO si siempre viene del backend
    precio: number;            // DEBE SER OBLIGATORIO
    // ✅ Campo de Stock Mínimo (Necesario para el formulario de edición)
    stockMinimo?: number;
    estado_stock: 'Disponible' | 'Stock Bajo' | 'Agotado'; // DEBE SER OBLIGATORIO
    activo?: boolean; // Nuevo campo para estado activo
    // Relaciones 
    caracteristicas?: any[];
    precios?: Precio[];
    inventario?: any[]; // La entidad inventario completa
    // Campos copiados desde la relación inventario (opcional, el backend puede exponerlos en la raíz)
    compras?: number;
    ventas?: number;
    ubicacion?: string;

    // Campos obligatorios/de relación
    estadoId: number;
    categoriaId?: number;           // ✅ Categoría (nivel 2)
    categoriaPrincipalId?: number;  // ✅ Categoría principal (nivel 1)
    subcategoriaId?: number;        // ✅ Subcategoría (nivel 3)
    estado?: Estado;
    subcategoria?: any; // Relación a subcategoría
    precio_costo?: number;
    precio_venta?: number;
}
export interface PaginacionResponse<T> {
    data: T[];
    total: number;
}

// 2. TIPO DE DATOS PARA CREACIÓN/ACTUALIZACIÓN (ASUMIENDO STOCK MÍNIMO)
export type CreateProductoData = {
    nombre: string;
    codigo: string;
    descripcion: string;
    ficha_tecnica_url?: string;
    // ❌ Eliminar imagen_url - las imágenes se cargan después

    // Se espera que el DTO reciba estos datos
    stock: number;
    precio: number;          // costo (opcional si backend lo usa)
    precio_venta?: number;   // precio de venta
    stockMinimo?: number;    // ✅ Asumiendo que agregaste esto al DTO

    categoriaId?: number;           // ✅ Categoría (nivel 2)
    categoriaPrincipalId?: number;  // ✅ Categoría principal (nivel 1)
    subcategoriaId?: number;        // ✅ Subcategoría (nivel 3)
    estadoId?: number;
};
export type UpdateProductoData = Partial<CreateProductoData>;
// --------------------------------------------------------------------------------
// --- FUNCIONES CRUD ---
// --------------------------------------------------------------------------------

/**
 * Obtener productos activos con paginación y filtro.
 */
export const getProductos = async (
    page: number = 1,
    size: number = 5,
    stockFiltro: string = "",
    searchTerm: string = "",
    subcategoriaId?: number,
    categoriaId?: number
): Promise<PaginacionResponse<Producto>> => {
    const params = {
        page,
        limit: size,
        ...(stockFiltro ? { estado_stock: stockFiltro } : {}),
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(typeof subcategoriaId !== 'undefined' ? { subcategoriaId } : {}),
        ...(typeof categoriaId !== 'undefined' ? { categoriaId } : {}),
    } as any;

    // Log para depuración del filtro de estado
    console.log('[getProductos] Endpoint:', ENDPOINT_BASE);
    console.log('[getProductos] Params:', params);

    try {
        const res = await axios.get(ENDPOINT_BASE, { params });
        // Si el servidor responde con un código HTTP de error, registrar y devolver vacío
        if (res.status >= 400) {
            console.error('[getProductos] HTTP error', res.status, res.data);
            return { data: [], total: 0 };
        }
        // Algunos backends devuelven { statusCode: 500, message: '...' } dentro del body
        if (res.data && typeof res.data === 'object' && (res.data.statusCode || res.data.status)) {
            const code = res.data.statusCode ?? res.data.status;
            if (code >= 400) {
                console.error('[getProductos] API error body', code, res.data);
                return { data: [], total: 0 };
            }
        }
        let items: any = res.data;
        let productos: Producto[] = [];
        let total = 0;

        // Si el backend responde con paginación
        if (items && Array.isArray(items.data)) {
            productos = items.data;
            total = items.total || productos.length;
        } else if (Array.isArray(items)) {
            productos = items;
            total = productos.length;
        }

        // Normalizar los campos numéricos y mapear 'precio' al nuevo campo 'precio_costo'.
        // El backend ya expone `stock` en la raíz del producto (proviene de la entidad inventario).
        // Usar product.stock como primera opción; fallback a product.inventario?.stock si existe.

        const normalized = productos.map((it: any) => {
            // Normalizar el campo activo: puede venir como 1/0, true/false, o string
            let activoBool: boolean | undefined = undefined;
            if (typeof it.activo !== 'undefined') {
                if (typeof it.activo === 'boolean') {
                    activoBool = it.activo;
                } else if (typeof it.activo === 'number') {
                    activoBool = it.activo === 1;
                } else if (typeof it.activo === 'string') {
                    activoBool = it.activo === '1' || it.activo.toLowerCase() === 'true';
                }
            }
            const precioVentaNum = Number(it.precio_venta ?? it.precioVenta ?? 0);
            const precioCostoNum = Number(it.precio_costo ?? 0);
            const precioNum = Number(it.precio ?? 0);
            const finalPrice = precioVentaNum > 0 ? precioVentaNum : (precioCostoNum > 0 ? precioCostoNum : precioNum);
            const finalStock = Number(it.stock ?? it.inventario?.[0]?.stock) || 0;
            const finalStockMinimo = Number(it.stockMinimo) || 5;
            const finalSubcategoriaId = it.subcategoriaId ?? it.subcategoria_id;
            const finalCategoriaId = it.categoriaId ?? it.categoria_id;
            return {
                ...it,
                precio: finalPrice,
                stock: finalStock,
                stockMinimo: finalStockMinimo,
                categoriaId: finalCategoriaId,
                subcategoriaId: finalSubcategoriaId,
                imagenes: it.imagenes || [],
                activo: activoBool,
            };
        });

        return { data: normalized, total };
    } catch (err: any) {
        // Mostrar detalles del error para el desarrollador y relanzarlo para que
        // el hook useCrudCatalog pueda mostrar la notificación en la UI.
        console.error("Error al obtener productos:", err?.message ?? err);
        if (err?.response) {
            console.error('[getProductos] response status:', err.response.status);
            console.error('[getProductos] response data:', err.response.data);
        }
        // Lanzamos el error para que la capa superior (useCrudCatalog) lo capture y muestre notificación
        throw err;
    }
};

/**
 * Obtener un producto por ID.
 */
export const getProductoById = async (id: number): Promise<Producto> => {
    // Primero intentamos la ruta con-relations que algunos backends exponen.
    // Si falla (por ejemplo, el backend no la tiene), intentamos la ruta simple /productos/:id
    let lastError: any = null;
    try {
        const res = await axios.get(`${ENDPOINT_BASE}/${id}/with-relations`);
        const data = res.data;
        // Normalizar campos numéricos y el campo activo
        const precioVentaNum = Number(data.precio_venta ?? data.precioVenta ?? 0);
        const precioCostoNum = Number(data.precio_costo ?? 0);
        const precioNum = Number(data.precio ?? 0);
        let activoBool: boolean | undefined = undefined;
        if (typeof data.activo !== 'undefined') {
            if (typeof data.activo === 'boolean') {
                activoBool = data.activo;
            } else if (typeof data.activo === 'number') {
                activoBool = data.activo === 1;
            } else if (typeof data.activo === 'string') {
                activoBool = data.activo === '1' || data.activo.toLowerCase() === 'true';
            }
        }
        data.precio = precioVentaNum > 0 ? precioVentaNum : (precioCostoNum > 0 ? precioCostoNum : precioNum);
        data.stock = Number(data.stock) || 0;
        data.stockMinimo = Number(data.stockMinimo) || 5;
        data.imagenes = data.imagenes || [];
        data.activo = activoBool;
        return data as Producto;
    } catch (err: any) {
        lastError = err;
        console.debug(`[getProductoById] Endpoint /with-relations no disponible para id=${id}, intentando /productos/:id — error:`, err?.message ?? err);
        try {
            const res2 = await axios.get(`${ENDPOINT_BASE}/${id}`);
            const data = res2.data;
            const precioVentaNum = Number(data.precio_venta ?? data.precioVenta ?? 0);
            const precioCostoNum = Number(data.precio_costo ?? 0);
            const precioNum = Number(data.precio ?? 0);
            data.precio = precioVentaNum > 0 ? precioVentaNum : (precioCostoNum > 0 ? precioCostoNum : precioNum);
            data.stock = Number(data.stock) || 0;
            data.stockMinimo = Number(data.stockMinimo) || 5;
            data.imagenes = data.imagenes || [];
            return data as Producto;
        } catch (err2: any) {
            console.error(`[getProductoById] Falló obtener producto id=${id} en ambos endpoints:`, lastError?.message ?? lastError, err2?.message ?? err2);
            // Relanzar el primer error para que la capa superior lo muestre como antes
            throw lastError || err2;
        }
    }
};

/**
 * Subir una imagen para un producto (usa el endpoint POST /productos/:id/upload-imagen)
 * Retorna el body tal como lo entrega el backend (por ejemplo { url, producto })
 */
export const uploadImagen = async (id: number, file: File | Blob) => {
    const endpoint = `${ENDPOINT_BASE}/${id}/upload-imagen`;
    const form = new FormData();
    // En el backend el FileInterceptor usa el campo 'file'
    form.append('file', file as any, (file as any).name || 'upload');
    form.append('type', 'imagen');

    // NO forzar Content-Type: el navegador/axios establecerá el boundary correctamente
    const res = await axios.post(endpoint, form);
    return res.data;
};

export const uploadFichaTecnica = async (id: number, file: File | Blob) => {
    // Usar el mismo endpoint, enviar type para diferenciar
    const endpoint = `${ENDPOINT_BASE}/${id}/upload-imagen`;
    const form = new FormData();
    // En el backend el FileInterceptor usa el campo 'file'
    form.append('file', file as any, (file as any).name || 'upload');
    form.append('type', 'ficha_tecnica');

    // NO forzar Content-Type: el navegador/axios establecerá el boundary correctamente
    const res = await axios.post(endpoint, form);
    return res.data;
};

/**
 * Elimina una imagen individual de un producto.
 * @param productoId ID del producto
 * @param imagenId ID de la imagen en producto_imagenes
 */
export const deleteImagen = async (productoId: number, imagenId: number): Promise<void> => {
    // Nuevo endpoint: /productos/imagenes/{imagenId}
    const endpoint = `${ENDPOINT_BASE}/imagenes/${imagenId}`;
    await axios.delete(endpoint);
};

// --------------------------------------------------
// Helpers: calcular estado de stock y normalizar lista
// --------------------------------------------------
const calcularEstadoStock = (stock: number, stockMinimo: number) => {
    const s = Number(stock || 0);
    const min = Number(stockMinimo || 0);
    if (s <= 0) return 'Agotado';
    if (s <= min) return 'Stock Bajo';
    return 'Disponible';
};

/**
 * Normaliza un array simple de productos que vienen del backend.
 * Mapea `precio` al nuevo campo `precio_costo` y normaliza stock.
 */
export const getProductosSimple = async (productosArray: any[]): Promise<Producto[]> => {
    const normalized = productosArray.map((p: any) => {
        const finalStockMinimo = Number(p.stockMinimo ?? 0);
        const calculated_estado_stock = calcularEstadoStock(Number(p.stock ?? 0), finalStockMinimo);
        const precioVentaNum = Number(p.precio_venta ?? p.precioVenta ?? 0);
        const precioCostoNum = Number(p.precio_costo ?? 0);
        const precioNum = Number(p.precio ?? 0);
        // Normalizar el campo activo
        let activoBool: boolean | undefined = undefined;
        if (typeof p.activo !== 'undefined') {
            if (typeof p.activo === 'boolean') {
                activoBool = p.activo;
            } else if (typeof p.activo === 'number') {
                activoBool = p.activo === 1;
            } else if (typeof p.activo === 'string') {
                activoBool = p.activo === '1' || p.activo.toLowerCase() === 'true';
            }
        }
        return {
            ...p,
            precio: precioVentaNum > 0 ? precioVentaNum : (precioCostoNum > 0 ? precioCostoNum : precioNum),
            stock: Number(p.stock ?? 0),
            stockMinimo: finalStockMinimo,
            estado_stock: calculated_estado_stock,
            activo: activoBool,
        } as Producto;
    });

    // Ordenar por nombre por defecto
    const ordenado = normalized.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
    return ordenado as Producto[];
};

// ... (createProducto, updateProducto, deleteProducto se mantienen)
import axios from "axios";
import { API_URL } from "./apiConfig";

const ENDPOINT_BASE = `${API_URL}/pedidos-online`;

// --- INTERFACES ---

export interface PedidoOnlineDetalle {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface PedidoOnline {
  id: number;
  codigo_pedido: string;
  fecha: string;
  total: number;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO';
  hash_verificacion: string;
  detalles: PedidoOnlineDetalle[];
}

export interface PedidosPaginadosResponse {
  data: PedidoOnline[];
  total: number;
}

/**
 * Obtener listado de pedidos online con paginación y búsqueda.
 */
export const getPedidosOnline = async (
  page: number = 1,
  size: number = 10,
  searchTerm: string = ""
): Promise<PedidosPaginadosResponse> => {
  const params = {
    page,
    limit: size,
    ...(searchTerm ? { search: searchTerm } : {}),
  };

  try {
    const res = await axios.get(ENDPOINT_BASE, { params });
    
    // Si el backend responde con el objeto de paginación estándar
    let items: any = res.data;
    let data: PedidoOnline[] = [];
    let total = 0;

    if (items && Array.isArray(items.data)) {
      data = items.data;
      total = items.total || data.length;
    } else if (Array.isArray(items)) {
      data = items;
      total = items.length;
    }

    // Normalización de datos numéricos (asegurar que sean números y no strings)
    const normalized = data.map((pedido) => ({
      ...pedido,
      total: Number(pedido.total) || 0,
      detalles: (pedido.detalles || []).map((det) => ({
        ...det,
        cantidad: Number(det.cantidad),
        precio_unitario: Number(det.precio_unitario),
        subtotal: Number(det.subtotal),
      })),
    }));

    return { data: normalized, total };
  } catch (err: any) {
    console.error("Error al obtener pedidos online:", err?.message ?? err);
    throw err;
  }
};

/**
 * Obtener un pedido específico por ID con sus detalles.
 */
export const getPedidoById = async (id: number): Promise<PedidoOnline> => {
  try {
    const res = await axios.get(`${ENDPOINT_BASE}/${id}`);
    const data = res.data;
    
    // Normalización
    return {
      ...data,
      total: Number(data.total),
      detalles: (data.detalles || []).map((det: any) => ({
        ...det,
        cantidad: Number(det.cantidad),
        precio_unitario: Number(det.precio_unitario),
        subtotal: Number(det.subtotal),
      })),
    };
  } catch (err: any) {
    console.error(`Error al obtener pedido ID ${id}:`, err);
    throw err;
  }
};

/**
 * Función para que el Carrito de Compras (Web) registre el pedido
 * antes de redirigir a WhatsApp.
 */
export const crearPedidoOnline = async (payload: {
  total: number;
  detalles: Array<{ producto_id: number; cantidad: number; precio_unitario: number }>;
}): Promise<any> => {
  try {
    const res = await axios.post(ENDPOINT_BASE, payload);
    return res.data;
  } catch (err: any) {
    console.error("Error al registrar pedido online desde carrito:", err);
    throw err;
  }
};
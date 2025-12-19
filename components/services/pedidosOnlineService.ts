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
 * Registra el pedido en la BD (Usado por el Carrito/WhatsApp)
 */
export const registrarPedidoOnline = async (payload: {
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

// Mantenemos este alias por compatibilidad con componentes antiguos
export const crearPedidoOnline = registrarPedidoOnline;

/**
 * ✅ NUEVA FUNCIÓN: Actualiza el estado del pedido (Confirmar/Cancelar)
 * Esto permite que la campana de notificaciones se actualice.
 */
export const updateEstadoPedido = async (
  id: number, 
  estado: 'CONFIRMADO' | 'CANCELADO'
): Promise<any> => {
  try {
    // Usamos PATCH para actualizar solo el campo estado
    const res = await axios.patch(`${ENDPOINT_BASE}/${id}`, { estado });
    return res.data;
  } catch (err: any) {
    console.error("Error al actualizar estado del pedido:", err);
    throw err;
  }
};
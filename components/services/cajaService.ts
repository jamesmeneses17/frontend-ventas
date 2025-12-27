import axios from "axios";
import { API_URL } from "./apiConfig";

const ENDPOINT_BASE = `${API_URL}/caja`;

// ------------------------------------------------------
// Interfaces
// ------------------------------------------------------
export interface MovimientoCaja {
    id: number;
    fecha: string;
    tipo_movimiento_id: number;
    monto: number;
    concepto: string;
    // Relación cargada por el backend (vía relations en el service)
    tipoMovimiento?: {
        id: number;
        nombre: string;
    };
}

export interface CreateMovimientoDTO {
    fecha: string;
    tipo_movimiento_id: number;
    monto: number;
    concepto: string;
}

export interface UpdateMovimientoDTO extends Partial<CreateMovimientoDTO> { }

export interface PaginacionResponse<T> {
    data: T[];
    total: number;
}

// ------------------------------------------------------
// CRUD
// ------------------------------------------------------

// Alias para compatibilidad con el resto del sistema
export type CreateMovimientoData = CreateMovimientoDTO;
export type UpdateMovimientoData = UpdateMovimientoDTO;

export const getMovimientosCaja = async (
    page: number = 1,
    size: number = 10,
    tipoFiltro: string = "",
    search: string = ""
): Promise<PaginacionResponse<MovimientoCaja>> => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(size));
    if (search) params.append("search", search);
    // Asumimos que el backend espera 'tipo_movimiento' o similar. 
    // Si el filtro es texto (EJ: "INGRESO"), el backend debe manejarlo.
    if (tipoFiltro) params.append("tipo_movimiento", tipoFiltro);

    const endpoint = `${ENDPOINT_BASE}?${params.toString()}`;

    try {
        const res = await axios.get(endpoint);

        let items: any = res.data;
        let movimientos: MovimientoCaja[] = [];
        let total = 0;

        if (items && Array.isArray(items.data)) {
            movimientos = items.data;
            total = items.total || movimientos.length;
        } else if (Array.isArray(items)) {
            movimientos = items;
            total = movimientos.length;
        }

        return { data: movimientos, total };
    } catch (err: any) {
        console.error("Error al obtener movimientos de caja:", err?.message);
        throw err;
    }
};

/**
 * Obtener estadísticas de caja (Saldo, Ingresos Hoy, Egresos Hoy)
 */
export interface CajaStats {
    saldoActual: number;
    totalIngresosHoy: number;
    totalEgresosHoy: number;
}

export const getCajaStats = async (): Promise<CajaStats> => {
    try {
        const res = await axios.get(`${ENDPOINT_BASE}/stats`);
        return res.data;
    } catch (err: any) {
        console.error("[getCajaStats] Error:", err.message);
        return { saldoActual: 0, totalIngresosHoy: 0, totalEgresosHoy: 0 };
    }
};

/**
 * Crear un registro de caja (Ingreso/Egreso/Gasto).
 */
export const createMovimiento = async (data: CreateMovimientoDTO): Promise<MovimientoCaja> => {
    const payload = {
        fecha: data.fecha,
        tipo_movimiento_id: Number(data.tipo_movimiento_id),
        monto: Number(String(data.monto).replace(/[^0-9.\-]/g, "")) || 0,
        concepto: data.concepto,
    };

    try {
        const res = await axios.post(ENDPOINT_BASE, payload);
        return res.data as MovimientoCaja;
    } catch (err: any) {
        console.error("[createMovimiento] Error:", err?.response?.data ?? err.message);
        throw err;
    }
};

/**
 * Actualizar movimiento.
 */
export const updateMovimiento = async (id: number, data: UpdateMovimientoDTO): Promise<MovimientoCaja> => {
    try {
        const res = await axios.patch(`${ENDPOINT_BASE}/${id}`, data);
        return res.data as MovimientoCaja;
    } catch (err: any) {
        console.error("[updateMovimiento] Error:", err.message);
        throw err;
    }
};

/**
 * Eliminar movimiento.
 */
export const deleteMovimiento = async (id: number): Promise<void> => {
    try {
        await axios.delete(`${ENDPOINT_BASE}/${id}`);
    } catch (err: any) {
        console.error("[deleteMovimiento] Error:", err.message);
        throw err;
    }
}


export interface ReporteAnualData {
    mes: string;
    ingresos: number;
    egresos: number;
    gastos: number;
    saldo: number;
}

export interface ReporteDiarioData {
    fecha: string; // YYYY-MM-DD
    mes: string;
    ingreso: number;
    egreso: number;
    gasto: number;
    saldo: number;
}

export const getReporteAnual = async (anio: number): Promise<ReporteAnualData[]> => {
    try {
        const res = await axios.get(`${ENDPOINT_BASE}/reporte/anual/${anio}`);
        return res.data;
    } catch (err: any) {
        console.error("[getReporteAnual] Error:", err.message);
        return [];
    }
};

export const getReporteDiario = async (anio: number, mes: number): Promise<ReporteDiarioData[]> => {
    try {
        const res = await axios.get(`${ENDPOINT_BASE}/reporte/diario/${anio}/${mes}`);
        return res.data;
    } catch (err: any) {
        console.error("[getReporteDiario] Error:", err.message);
        return [];
    }
};
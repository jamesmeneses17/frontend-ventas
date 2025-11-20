import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
const ENDPOINT_BASE = `${API_URL}/creditos`;

// ------------------------------------------------------
// Interfaces
// ------------------------------------------------------
export interface Credito {
    id: number;
    cliente_id: number;
    articulo: string;

    valor_credito: number;
    saldo_pendiente: number;

    fecha_inicial: string;
    fecha_final: string;

    estado: "PENDIENTE" | "PAGADO";

    pagos?: any[];
}

export interface CreateCreditoDTO {
    cliente_id: number;
    articulo: string;
    valor_credito: number;
    fecha_inicial: string;
    fecha_final: string;
}

export interface UpdateCreditoDTO extends Partial<CreateCreditoDTO> {}

export interface PaginacionResponse<T> {
    data: T[];
    total: number;
}

// ------------------------------------------------------
// Obtener créditos con paginación
// ------------------------------------------------------
export const getCreditos = async (
    page: number = 1,
    size: number = 10,
    search: string = ""
): Promise<PaginacionResponse<Credito>> => {

    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(size));
    if (search) params.append("search", search);

    const endpoint = `${ENDPOINT_BASE}?${params.toString()}`;

    console.log("[getCreditos] GET:", endpoint);

    try {
        const res = await axios.get(endpoint);

        // Manejo de posibles errores enviados como body
        if (res.data && (res.data.statusCode || res.data.status)) {
            const code = res.data.statusCode ?? res.data.status;
            if (code >= 400) {
                console.error("[getCreditos] API error:", res.data);
                return { data: [], total: 0 };
            }
        }

        let items = res.data;
        let creditos: Credito[] = [];
        let total = 0;

        // Respuesta NestJS paginada
        if (items && Array.isArray(items.data)) {
            creditos = items.data;
            total = items.total || creditos.length;
        }
        // Array plano
        else if (Array.isArray(items)) {
            creditos = items;
            total = creditos.length;
        }

        return { data: creditos, total };
    } catch (err: any) {
        console.error("[getCreditos] Error:", err?.message ?? err);
        throw err;
    }
};

// ------------------------------------------------------
// Obtener crédito por ID
// ------------------------------------------------------
export const getCreditoById = async (id: number): Promise<Credito> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    console.log("[getCreditoById] GET:", endpoint);

    try {
        const res = await axios.get(endpoint);
        return res.data as Credito;
    } catch (err: any) {
        console.error("[getCreditoById] Error:", err);
        throw err;
    }
};

// ------------------------------------------------------
// Crear crédito
// ------------------------------------------------------
export const createCredito = async (data: CreateCreditoDTO): Promise<Credito> => {

    const payload = {
        cliente_id: Number(data.cliente_id),
        articulo: data.articulo.trim(),
        valor_credito: Number(String(data.valor_credito).replace(/[^0-9.\-]/g, "")) || 0,
        fecha_inicial: data.fecha_inicial,
        fecha_final: data.fecha_final,
    };

    console.log("[createCredito] POST:", ENDPOINT_BASE, payload);

    try {
        const res = await axios.post(ENDPOINT_BASE, payload);
        return res.data as Credito;
    } catch (err: any) {
        console.error("[createCredito] Error:", err);
        throw err;
    }
};

// ------------------------------------------------------
// Actualizar crédito
// ------------------------------------------------------
export const updateCredito = async (id: number, data: UpdateCreditoDTO): Promise<Credito> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;

    console.log("[updateCredito] PATCH:", endpoint, data);

    try {
        const res = await axios.patch(endpoint, data);
        return res.data as Credito;
    } catch (err: any) {
        console.error("[updateCredito] Error:", err);
        throw err;
    }
};

// ------------------------------------------------------
// Eliminar crédito
// ------------------------------------------------------
export const deleteCredito = async (id: number): Promise<void> => {
    const endpoint = `${ENDPOINT_BASE}/${id}`;
    console.log("[deleteCredito] DELETE:", endpoint);

    try {
        await axios.delete(endpoint);
    } catch (err: any) {
        console.error("[deleteCredito] Error:", err);
        throw err;
    }
};

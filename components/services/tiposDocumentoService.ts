import axios from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/g, "");
const TIPOS_DOCUMENTO_BASE_URL = `${API_URL}/tipos-documento`;

export interface TipoDocumento {
  id: number;
  nombre: string;
}

export type CreateTipoDocumentoData = {
  nombre: string;
};

export type UpdateTipoDocumentoData = Partial<CreateTipoDocumentoData>;

export const getTiposDocumento = async (): Promise<TipoDocumento[]> => {
  const url = TIPOS_DOCUMENTO_BASE_URL;
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err: any) {
    console.error(`[getTiposDocumento] Error al obtener tipos de documento desde ${url}:`, err?.response?.data ?? err?.toString());
    return [];
  }
};

export const getTipoDocumentoById = async (id: number): Promise<TipoDocumento> => {
  const url = `${TIPOS_DOCUMENTO_BASE_URL}/${id}`;
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err: any) {
    console.error(`[getTipoDocumentoById] Error al obtener tipo de documento ${id}:`, err?.response?.data ?? err?.toString());
    throw err;
  }
};

export const createTipoDocumento = async (data: CreateTipoDocumentoData): Promise<TipoDocumento> => {
  const payload: CreateTipoDocumentoData = { ...data };
  console.debug("[createTipoDocumento] payload enviado:", payload);

  try {
    const res = await axios.post(TIPOS_DOCUMENTO_BASE_URL, payload);
    console.debug("[createTipoDocumento] respuesta exitosa:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("[createTipoDocumento] error en la respuesta del servidor:", err?.response?.data ?? err?.toString());
    throw err;
  }
};

export const updateTipoDocumento = async (id: number, data: UpdateTipoDocumentoData): Promise<TipoDocumento> => {
  const payload: UpdateTipoDocumentoData = { ...data };
  console.debug("[updateTipoDocumento] id:", id, "payload:", payload);

  try {
    const res = await axios.patch(`${TIPOS_DOCUMENTO_BASE_URL}/${id}`, payload);
    console.debug("[updateTipoDocumento] respuesta exitosa:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("[updateTipoDocumento] error en la respuesta del servidor:", err?.response?.data ?? err?.toString());
    throw err;
  }
};

export const deleteTipoDocumento = async (id: number): Promise<void> => {
  console.debug("[deleteTipoDocumento] eliminando id:", id);
  try {
    await axios.delete(`${TIPOS_DOCUMENTO_BASE_URL}/${id}`);
    console.debug("[deleteTipoDocumento] eliminado correctamente");
  } catch (err: any) {
    console.error("[deleteTipoDocumento] error al eliminar:", err?.response?.data ?? err?.toString());
    throw err;
  }
};

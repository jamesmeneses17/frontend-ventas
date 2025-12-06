// Centraliza la URL base de la API y permite configurar el puerto desde .env
// Usa NEXT_PUBLIC_API_URL si está definido; de lo contrario, arma la URL con NEXT_PUBLIC_API_PORT (por defecto 5000).
const API_PORT = process.env.NEXT_PUBLIC_API_PORT ?? "5000";
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? `http://localhost:${API_PORT}`
).replace(/\/+$/g, "");

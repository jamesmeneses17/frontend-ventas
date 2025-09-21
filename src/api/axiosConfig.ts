import axios from "axios";

// En desarrollo, usar el proxy de Vite (/api)
// En producción, usar la URL completa del backend
const baseURL = import.meta.env.DEV 
  ? "/api" 
  : import.meta.env.VITE_API_URL || "https://backend-ventas-dvhh.onrender.com/";

const api = axios.create({
  baseURL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en la respuesta de la API:', error);
    
    // Información adicional sobre el error para desarrollo
    if (import.meta.env.DEV) {
      console.error('URL:', error.config?.url);
      console.error('Base URL:', error.config?.baseURL);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;

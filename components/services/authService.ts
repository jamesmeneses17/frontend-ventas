/**
 * Servicio de autenticación
 * Maneja las llamadas a los endpoints de autenticación del backend
 */

import { API_URL } from './apiConfig';

interface ForgotPasswordRequest {
  correo: string;
}

interface ResetPasswordRequest {
  token: string;
  nuevaContrasena: string;
}

interface AuthResponse {
  message: string;
  success?: boolean;
}

export const authService = {
  /**
   * Solicita un enlace de recuperación de contraseña
   */
  async forgotPassword(correo: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al solicitar recuperación');
    }

    return data;
  },

  /**
   * Resetea la contraseña con un token válido
   */
  async resetPassword(token: string, nuevaContrasena: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        nuevaContrasena,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al resetear contraseña');
    }

    return data;
  },
};

export default authService;

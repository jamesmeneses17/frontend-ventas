"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  correo: string;
  nombre?: string;
  rol:string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Variable de entorno para la URL base del API (usa NEXT_PUBLIC_API_URL en build/deploy)
// Fallback a localhost para desarrollo local. Se eliminan barras finales.
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/g, '');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Verificar si hay sesión activa
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // 1. Obtener el token desde localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('No hay token guardado');
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,  // ← HEADER CON TOKEN
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.log('Token inválido');
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔄 Intentando login...', { email });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: email,
          contrasena: password, // sin ñ como especificaste
        }),
      });

      console.log('📡 Respuesta del servidor:', response.status);

      if (!response.ok) {
        let errorMessage = 'Error de autenticación';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Error del servidor: ${response.status}`;
        }
        console.error('❌ Error de login:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Login exitoso:', data);

      // Guardar el token en localStorage
      localStorage.setItem('auth_token', data.access_token);
      
      // Actualizar el estado del usuario
      setUser(data.user);

      console.log('Token guardado y usuario actualizado');

    } catch (error) {
      console.error('🚨 Error en login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.log('Error al cerrar sesión');
    } finally {
      // Limpiar token y estado
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

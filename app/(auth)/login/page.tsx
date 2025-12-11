// /app/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import LoginForm from "../../../components/auth/LoginForm";
import AuthSplitPanel from "../../../components/layout/AuthSplitPanel";
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Si está autenticado y ya terminó de verificar, redirigir al dashboard
    if (isAuthenticated && !isLoading) {
      console.log('✅ Ya estás autenticado, redirigiendo al dashboard...');
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading mientras verifica si está autenticado
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar el formulario
  if (isAuthenticated) {
    return null;
  }

  // Si no está autenticado, mostrar el formulario
  return (
    <AuthSplitPanel >
      
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3 text-gray-900">
          Iniciar Sesión
        </h2>
        <p className="text-xl font-bold mb-8 text-gray-500">
          Ingresa tus datos para iniciar sesion
        </p>
      </div>

      <LoginForm />

      {/* Enlace al flujo de recuperación de contraseña */}
      <Link
        href="/forgot-password" 
        className="mt-6 block text-center text-sm font-semibold text-indigo-500 hover:text-indigo-400"
      >
        ¿Olvidaste tu contraseña?
      </Link>
      
    </AuthSplitPanel>
  );
}
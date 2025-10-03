"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Layout from "./Layout";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string; // 🔹 opcional si después manejas roles
}

// 🔹 Componente de pantalla de carga
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verificando autenticación...</p>
      </div>
    </div>
  );
}

export default function AuthenticatedLayout({
  children,
  redirectTo = "/login",
  requiredRole,
}: AuthenticatedLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(redirectTo);
      } else if (requiredRole && user?.rol !== requiredRole) {
        // 🔹 en caso de roles: lo puedes redirigir a un "403" o home
        router.replace("/unauthorized");
      }
    }
  }, [isLoading, isAuthenticated, requiredRole, user, router, redirectTo]);

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) return null;

  // 🔹 Si pediste role y no lo cumple, no renderiza nada
  if (requiredRole && user?.rol !== requiredRole) return null;

  // ✅ Usuario autenticado → Renderiza el layout principal
  return <Layout>{children}</Layout>;
}

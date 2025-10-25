"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Layout from "./Layout";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string;
}

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
        router.replace("/unauthorized");
      }
    }
  }, [isLoading, isAuthenticated, requiredRole, user, router, redirectTo]);

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) return null;

  if (requiredRole && user?.rol !== requiredRole) return null;

  
  return (
    <div className="min-h-screen bg-gray-50">
      <Layout>
        {children}
      </Layout>
    </div>
  );
}
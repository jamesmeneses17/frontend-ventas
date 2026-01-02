"use client";

import AuthenticatedLayout from "../../components/layout/AuthenticatedLayout";
import CardStat from "../../components/ui/CardStat";
// Importamos solo el componente clave para el dueño
import FinancialSummary from "../../components/layout/FinancialSummary";
import { useAuth } from "../../contexts/AuthContext";
import { SVGProps } from "react";

// --- Definición de Iconos (Necesarios para CardStat) ---

const IconShoppingBag = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
    />
  </svg>
);

const IconBox = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10l-8 4m8-4v10"
    />
  </svg>
);

const IconUsers = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"
    />
  </svg>
);

const IconAlert = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.457-1.78.683-2.948l-6.928-4.321a1.002 1.002 0 00-1.074 0l-6.928 4.321C2.481 18.22 3.398 20 4.938 20z"
    />
  </svg>
);

export default function Dashboard() {
  const { user } = useAuth();
  // Eliminamos la variable 'sales' y el componente 'RecentSales' ya que no son la prioridad.

  return (
    <AuthenticatedLayout>

      {/* --- 1. SECCIÓN DE BIENVENIDA Y NOTIFICACIÓN --- */}
      <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-300 mb-6">
        <div className="px-4 pt-5 sm:px-6 sm:pt-6 pb-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Bienvenido {user?.nombre || "Usuario"}!
          </h2>
          <p className="text-gray-600 mb-4">
            Resumen general de tu sistema de ventas
          </p>
        </div>
        <div className="px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex">
            <svg
              className="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-green-700">
              Autenticación exitosa.
            </p>
          </div>
        </div>
      </div>



      {/* --- 3. SECCIÓN PRINCIPAL: RESUMEN FINANCIERO --- */}
      {/* Ocupamos todo el ancho disponible (lg:col-span-full) para darle máxima prioridad al reporte Excel */}
      <div className="grid grid-cols-1 gap-6">
        <FinancialSummary />
      </div>

    </AuthenticatedLayout>
  );
}
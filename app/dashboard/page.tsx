"use client";

import AuthenticatedLayout from "../../components/layout/AuthenticatedLayout";
import { useAuth } from "../../contexts/AuthContext";
import CardStat from "../../components/ui/CardStat"; // 👈 tu componente de card

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout>
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Bienvenido!</h2>
          <p className="text-gray-600 mb-4">Resumen general de tu sistema de ventas</p>
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex">
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
              Autenticación exitosa. Usuario: <strong>{user?.email}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <CardStat
          title="Ventas del Mes"
          value="$0.00"
          color="text-blue-600"
          icon={
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          }
        />

        <CardStat
          title="Clientes"
          value="0"
          color="text-green-600"
          icon={
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"
              />
            </svg>
          }
        />

        <CardStat
          title="Productos"
          value="0"
          color="text-yellow-600"
          icon={
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4"
              />
            </svg>
          }
        />
      </div>

      {/* Próximas funcionalidades */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Próximas funcionalidades
          </h3>
         
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

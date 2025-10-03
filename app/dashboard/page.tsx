"use client";

import AuthenticatedLayout from "../../components/layout/AuthenticatedLayout";
import CardStat from "../../components/ui/CardStat";
import { useAuth } from "../../contexts/AuthContext";
import { SVGProps } from "react";

// --- ÍCONOS DE EJEMPLO (puedes reemplazarlos con componentes reales como Lucide) ---
// La ruta 'd' es la definición del path del SVG.

const IconShoppingBag = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
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
);

const IconBox = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10l-8 4m8-4v10"
    />
  </svg>
);

const IconUsers = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
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
);

// Ícono de alerta para stock bajo
const IconAlert = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.457-1.78.683-2.948l-6.928-4.321a1.002 1.002 0 00-1.074 0l-6.928 4.321C2.481 18.22 3.398 20 4.938 20z"
    />
  </svg>
);


export default function Dashboard() {
  const { user } = useAuth(); // Asumiendo que usas esto para el control de acceso

  return (
    <AuthenticatedLayout>
      {/* 1. Welcome Section (Tu código original) */}
      <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Bienvenido!
          </h2>
          <p className="text-gray-600 mb-4">
            Resumen general de tu sistema de ventas
          </p>
          {/* Mensaje de Autenticación Exitosa */}
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
              Autenticación exitosa.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Stats Cards: Grid de 4 columnas en escritorio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Métrica 1: Ventas del día */}
        <CardStat
          title="Ventas del día"
          value="$0.00"
          color="text-blue-600"
          icon={<IconShoppingBag className="h-8 w-8" />}
        />

        {/* Métrica 2: Stock Bajo */}
        <CardStat
          title="Stock Bajo"
          value="0"
          color="text-red-600" // Cambiado a rojo para mayor énfasis
          icon={<IconAlert className="h-8 w-8" />}
        />

        {/* Métrica 3: Total de productos */}
        <CardStat
          title="Total de productos"
          value="0"
          color="text-yellow-600"
          icon={<IconBox className="h-8 w-8" />}
        />
        
        {/* Métrica 4: Clientes Registrados */}
        <CardStat
          title="Clientes Registrados"
          value="0"
          color="text-indigo-600"
          icon={<IconUsers className="h-8 w-8" />}
        />
      </div>

      {/* 3. Sección de Gráficos y Tablas: Grid de 3 columnas (2/3 y 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tarjeta 1: Ventas por Categoría (Ocupa 2/3 del espacio en escritorio) */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ventas por Categoría
            </h3>
            {/* Placeholder para tu componente de gráfico */}
            <div className="h-80 bg-gray-50 flex items-center justify-center text-gray-500 border border-dashed rounded-md">
              [Espacio para Gráfico de Ventas por Categoría]
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Productos Más Vendidos (Ocupa 1/3 del espacio en escritorio) */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Productos Más Vendidos
            </h3>
            {/* Placeholder para tu lista o tabla */}
            <div className="h-80 bg-gray-50 flex items-center justify-center text-gray-500 border border-dashed rounded-md">
              [Espacio para Lista o Tabla de Productos]
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
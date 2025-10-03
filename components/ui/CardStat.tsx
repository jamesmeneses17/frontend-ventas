"use client";

import { ReactNode } from "react";

interface CardStatProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string; // clase de Tailwind opcional
}

export default function CardStat({ title, value, icon, color = "text-indigo-600" }: CardStatProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          {/* Icono */}
          <div className={`flex-shrink-0 ${color}`}>{icon}</div>

          {/* Contenido */}
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ReactNode } from "react";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

type AlertType = "success" | "error" | "warning" | "info";
// aver cambio de ra

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  icon?: ReactNode; // opcional para sobreescribir el ícono
}

const typeStyles: Record<
  AlertType,
  { bg: string; border: string; text: string; Icon: ReactNode }
> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    Icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    Icon: <XCircle className="h-5 w-5 text-red-500" />,
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    Icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    Icon: <Info className="h-5 w-5 text-blue-500" />,
  },
};

export default function Alert({ type, title, message, icon }: AlertProps) {
  const style = typeStyles[type];

  return (
    <div className={`rounded-md p-4 border ${style.bg} ${style.border}`}>
      <div className="flex">
        {/* Icono */}
        <div className="flex-shrink-0">{icon || style.Icon}</div>

        {/* Texto */}
        <div className="ml-3">
          {title && (
            <h3 className={`text-sm font-medium ${style.text}`}>{title}</h3>
          )}
          <p className={`mt-1 text-sm ${style.text}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}

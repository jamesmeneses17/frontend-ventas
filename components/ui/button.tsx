"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  // Añadimos 'variant' para que coincida con el llamado del modal
  variant?: "primary" | "secondary" | "success" | "danger";
  color?: "primary" | "secondary" | string;
}

export default function Button({ 
  children, 
  type = "button", 
  className = "",
  disabled = false,
  onClick,
  color,
  variant // Recibimos la nueva prop
}: ButtonProps) {
  
  // Determinamos el estilo basado en 'variant' o 'color'
  const activeVariant = variant || color;

  const getVariantStyles = () => {
    if (disabled) return 'bg-gray-400 cursor-not-allowed';
    
    switch (activeVariant) {
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-500 focus-visible:outline-gray-600';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-500 focus-visible:outline-emerald-600';
      case 'danger':
        return 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600';
      case 'primary':
      default:
        return 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600';
    }
  };

  const buttonProps: any = {
    type,
    disabled,
    className: `flex justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors ${getVariantStyles()} text-white ${className}`
  };

  if (onClick) {
    buttonProps.onClick = onClick;
  }

  return (
    <button {...buttonProps}>
      {children}
    </button>
  );
}
"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  color?: "primary" | "secondary" | string;
}

export default function Button({ 
  children, 
  type = "button", 
  className = "",
  disabled = false,
  onClick,
  color
}: ButtonProps) {
  const buttonProps: any = {
    type,
    disabled,
    className: `flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
      disabled
        ? 'bg-gray-400 cursor-not-allowed'
        : (
          color === 'secondary'
            ? 'bg-gray-600 hover:bg-gray-500 focus-visible:outline-gray-600'
            : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'
        )
    } text-white ${className}`
  };
  // Solo pasar onClick si el tipo es 'button'
  if (type === 'button' && onClick) {
    buttonProps.onClick = onClick;
  }
  return (
    <button {...buttonProps}>
      {children}
    </button>
  );
}

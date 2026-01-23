"use client";

import React from "react";

interface ActionButtonProps {
  // icon puede ser un ReactNode (SVG) o una clave como 'edit'|'delete'
  icon?: React.ReactNode | string;
  label?: string;
  onClick: (e?: any) => void;
  color?: "primary" | "danger";
  className?: string;
  title?: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  color = "primary",
  className = "",
  title,
  disabled
}) => {
  const renderIcon = (ic?: React.ReactNode | string) => {
    if (!ic) return null;
    if (typeof ic !== "string") return ic as React.ReactNode;
    switch (ic) {
      case "edit":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case "delete":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case "plus":
        return (
          <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return ic; // render as-is (string will show text)
    }
  };

  const base =
    "inline-flex items-center px-2 py-1 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    color === "danger"
      ? "text-red-600 hover:text-red-900"
      : "text-indigo-600 hover:text-indigo-900";

  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`} title={title || label} disabled={disabled}>
      {renderIcon(icon)}
      {label && <span className="ml-1">{label}</span>}
    </button>
  );
};

export default ActionButton;

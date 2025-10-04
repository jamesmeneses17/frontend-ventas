"use client";

import React from "react";

interface ActionButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
  color?: "primary" | "danger";
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onClick,
  color = "primary",
}) => {
  const base =
    "inline-flex items-center px-2 py-1 text-sm font-medium rounded-md focus:outline-none transition-colors duration-200";
  const styles =
    color === "danger"
      ? "text-red-600 hover:text-red-900"
      : "text-indigo-600 hover:text-indigo-900";

  return (
    <button onClick={onClick} className={`${base} ${styles}`} title={label}>
      {icon}
      {label && <span className="ml-1">{label}</span>}
    </button>
  );
};

export default ActionButton;

"use client";

import { AlertTriangle } from "lucide-react";

interface IconAlertProps {
  size?: number;
  color?: string;
}

export default function IconAlert({ size = 24, color = "text-red-500" }: IconAlertProps) {
  return <AlertTriangle className={`${color}`} size={size} />;
}

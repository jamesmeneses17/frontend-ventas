"use client";

import { Package } from "lucide-react";

interface IconBoxProps {
  size?: number;
  color?: string;
}

export default function IconBox({ size = 24, color = "text-blue-500" }: IconBoxProps) {
  return <Package className={`${color}`} size={size} />;
}

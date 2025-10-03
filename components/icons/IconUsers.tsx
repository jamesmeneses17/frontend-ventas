"use client";

import { User } from "lucide-react";

interface IconUserProps {
  size?: number;
  color?: string;
}

export default function IconUser({ size = 24, color = "text-purple-500" }: IconUserProps) {
  return <User className={`${color}`} size={size} />;
}

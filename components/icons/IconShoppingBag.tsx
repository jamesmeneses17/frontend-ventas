"use client";

import { ShoppingCart } from "lucide-react";

interface IconShoppingProps {
  size?: number;
  color?: string;
}

export default function IconShopping({ size = 24, color = "text-green-500" }: IconShoppingProps) {
  return <ShoppingCart className={`${color}`} size={size} />;
}

"use client";

// Esta página está siendo reemplazada por /users/categorias-principales
// Redirigir automáticamente a la página correcta

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CatPequenasPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/users/categorias');
  }, [router]);

  return null;
}

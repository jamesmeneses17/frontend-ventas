"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { Categoria } from "../components/services/categoriasService";

// Re-export the Categoria type so other modules can import it from this context file if desired
export type { Categoria } from "../components/services/categoriasService";

// 1. Definir el tipo del Contexto
interface CategoriesContextType {
  categorias: Categoria[];
  isLoading: boolean;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(
  undefined
);

// 2. Crear el Provider (La lógica de la carga única)
export const CategoriesProvider = ({
  children,
  initialCategories,
}: {
  children: ReactNode;
  initialCategories: Categoria[];
}) => {
  // Initialize with server-provided categories to avoid client fetch duplication
  const [categorias] = useState<Categoria[]>(initialCategories || []);
  const isLoading = false; // Already loaded on the server

  return (
    <CategoriesContext.Provider value={{ categorias, isLoading }}>
      {children}
    </CategoriesContext.Provider>
  );
};

// 3. Hook personalizado para consumir el contexto
export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error(
      "useCategories debe ser usado dentro de un CategoriesProvider"
    );
  }
  return context;
};

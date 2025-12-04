// /app/admin/productos/page.tsx (CategoriasPage.tsx)

"use client";

import React from "react";
// Importamos el Hook y los componentes
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import ActionButton from "../../../components/common/ActionButton";
import CategoriasTable from "../../../components/catalogos/CategoriasTable";
import CategoriasForm from "../../../components/catalogos/CategoriasForm";
import Paginator from "../../../components/common/Paginator";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import SearchInput from "../../../components/common/form/SearchInput";
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  Categoria,
  CreateCategoriaData,
  UpdateCategoriaData,
} from "../../../components/services/categoriasService";

// 1. COMPONENTE PRINCIPAL (Simplificado)
export default function CategoriasPage() {
  const {
    currentItems,
    loading,
    totalItems,
    searchTerm,
    currentPage,
    pageSize,
    showModal,
    editingItem,
    notification,
    setSearchTerm,
    handlePageChange,
    handlePageSizeChange,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleCloseModal,
    setNotification,
  } = useCrudCatalog<Categoria, CreateCategoriaData, UpdateCategoriaData>(
    {
      loadItems: getCategorias,
      createItem: createCategoria,
      updateItem: updateCategoria,
      deleteItem: deleteCategoria,
    },
    "Categoría"
  );

  // Tipado explícito para la edición
  const editingCategoria = editingItem as Categoria | null;

  // Corregimos la ruta base para que apunte a la ruta real de Next.js: /admin/productos
  const currentPath =
    typeof window !== "undefined"
      ? window.location.pathname
      : "/admin/productos"; // Usar la ruta base correcta del proyecto

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* ... (Header - Se mantiene) ... */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            {/* ... (Título y descripción) ... */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
              <p className="text-gray-600 mt-2">
                Gestiona las configuraciones básicas del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Header tabla */}
          <div className="w-full space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-0 text-left">
              Lista de Categorías
            </h3>
            {/* ... (Buscador y botón se mantienen) ... */}
            <div className="flex justify-between items-center w-full">
              <div className="w-full max-w-sm">
                <SearchInput
                  searchTerm={searchTerm}
                  placeholder="Buscar categorías..."
                  onSearchChange={setSearchTerm} // Usamos el handler del hook
                />
              </div>
              <ActionButton
                icon={
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                label="Nueva Categoría"
                onClick={handleAdd} // Usamos el handler del hook
              />
            </div>
          </div>

          {/* TABLA MODULARIZADA */}
          <div className="mt-6">
            <CategoriasTable
              data={currentItems as Categoria[]} // Casteo al tipo específico
              loading={loading}
              onEdit={handleEdit} // Usamos el handler del hook
              onDelete={handleDelete} // Usamos el handler del hook
            />
          </div>

          {/* SECCIÓN DE INFORMACIÓN Y PAGINADOR */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600"></p>
            {!loading && totalItems > 0 && (
              <Paginator
                total={totalItems}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        </div>

        {/* Modal reutilizable */}
        {showModal && (
          <ModalVentana
            isOpen={showModal}
            onClose={handleCloseModal}
            title={editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
          >
            <CategoriasForm
              initialData={
                editingCategoria
                  ? {
                      nombre: editingCategoria.nombre,
                      estadoId: editingCategoria.estadoId, // Asumiendo que existe en Categoria
                      categoriaPrincipalId: (editingCategoria as any).categoriaPrincipalId ?? (editingCategoria as any).categoriaPrincipal?.id ?? null,
                    }
                  : {
                      nombre: "",
                      estadoId: 1,
                    }
              }
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
            />
          </ModalVentana>
        )}

        {notification && (
          <div className="fixed top-10 right-4 z-[9999]">
            <Alert
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

// /app/admin/subcategorias/page.tsx

"use client";

import React from "react";
// Importamos el Hook y los componentes genéricos
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import ActionButton from "../../../components/common/ActionButton";
import Paginator from "../../../components/common/Paginator";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import SearchInput from "../../../components/common/form/SearchInput";

// 🚀 IMPORTACIONES ESPECÍFICAS DE SUBCATEGORÍAS
import SubcategoriasTable from "../../../components/catalogos/SubcategoriasTable"; // ¡DEBEMOS CREAR ESTE!
import SubcategoriasForm from "../../../components/catalogos/SubcategoriasForm"; // ¡DEBEMOS CREAR ESTE!
import {
  getSubcategorias,
  createSubcategoria,
  updateSubcategoria,
  deleteSubcategoria,
  Subcategoria, // El tipo de la entidad
  CreateSubcategoriaData, // Tipo de datos para crear (el DTO)
  UpdateSubcategoriaData, // Tipo de datos para actualizar (el DTO)
} from "../../../components/services/subcategoriasService"; // ¡DEBEMOS CREAR ESTE ARCHIVO DE SERVICIO!

// 1. COMPONENTE PRINCIPAL
export default function SubcategoriasPage() {
  // 2. USAMOS EL HOOK GENÉRICO
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
    refreshItems,
  } = useCrudCatalog<Subcategoria, CreateSubcategoriaData, UpdateSubcategoriaData>(
    {
      // Adaptamos la firma al hook: (all, page, size, searchTerm, categoriaId?)
      loadItems: async (_all, page, size, searchTerm) =>
        getSubcategorias(page, size, searchTerm),
      createItem: createSubcategoria,
      updateItem: updateSubcategoria,
      deleteItem: deleteSubcategoria,
    },
    "Subcategoría" // Nombre usado para las notificaciones
  );

  // Tipado explícito para la edición
  const editingSubcategoria = editingItem as Subcategoria | null;

  React.useEffect(() => {
    if (editingSubcategoria) {
      console.log("[SubcategoriasPage] editingSubcategoria:", {
        id: editingSubcategoria.id,
        nombre: editingSubcategoria.nombre,
        categoria_id: editingSubcategoria.categoria_id,
        categoria_nombre: editingSubcategoria.categoria_nombre,
        fullObject: editingSubcategoria,
      });
    }
  }, [editingSubcategoria]);

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Encabezado de la página */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subcategorías</h1>
              <p className="text-gray-600 mt-2">
                Gestiona las subcategorías que dependen de una categoría principal.
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal: Buscador y Tabla */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="w-full space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-0 text-left">
              Lista de Subcategorías
            </h3>
            
            {/* Buscador y botón de acción */}
            <div className="flex justify-between items-center w-full">
              <div className="w-full max-w-sm">
                <SearchInput
                  searchTerm={searchTerm}
                  placeholder="Buscar subcategorías..."
                  onSearchChange={setSearchTerm}
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
                label="Nueva Subcategoría"
                onClick={handleAdd}
              />
            </div>
          </div>

          {/* TABLA DE SUBCATEGORÍAS */}
          <div className="mt-6">
            <SubcategoriasTable
              data={currentItems as Subcategoria[]} // Casteo al tipo específico
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* Paginador */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Mostrando {currentItems.length} de {totalItems} resultados
            </p>
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
            title={editingSubcategoria ? "Editar Subcategoría" : "Nueva Subcategoría"}
          >
            <SubcategoriasForm
              initialData={
                editingSubcategoria
                  ? {
                      id: editingSubcategoria.id,
                      nombre: editingSubcategoria.nombre,
                      // Necesitamos el ID de la Categoría padre para editar - asegurar que es número
                      categoria_id: Number(editingSubcategoria.categoria_id) || 0,
                      activo: (editingSubcategoria as any).activo ?? 1, // Agregar activo
                      imagen_url: (editingSubcategoria as any).imagen_url,
                    }
                  : undefined // Para nuevo, el form usa valores por defecto
              }
              onSubmit={handleFormSubmit}
              onSuccess={async () => {
                await refreshItems();
                handleCloseModal();
              }}
              onCancel={handleCloseModal}
            />
          </ModalVentana>
        )}

        {/* Notificaciones */}
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
// app/admin/categorias-principales/page.tsx

"use client";

import React from "react";
// Layout y elementos generales
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import ActionButton from "../../../components/common/ActionButton";
import Paginator from "../../../components/common/Paginator";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import SearchInput from "../../../components/common/form/SearchInput";

// Componentes específicos
import CategoriaPrincipalTable from "../../../components/catalogos/CategoriaPrincipalTable";
import CategoriaPrincipalForm from "../../../components/catalogos/CategoriaPrincipalForm";

// Servicios
import {
  CategoriaPrincipal,
  getCategoriasPrincipales,
  createCategoriaPrincipal,
  updateCategoriaPrincipal,
  deleteCategoriaPrincipal,
} from "../../../components/services/categoriasPrincipalesService";

import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";

// Tipos
type CreateData = { nombre: string; activo?: number };
type UpdateData = Partial<CreateData>;

export default function CategoriasPrincipalesPage() {
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
    refreshItems,
    setNotification,
  } = useCrudCatalog<CategoriaPrincipal, CreateData, UpdateData>(
    {
      loadItems: async (_all, page, size, searchTerm) =>
        getCategoriasPrincipales(page, size, searchTerm),
      createItem: createCategoriaPrincipal,
      updateItem: updateCategoriaPrincipal,
      deleteItem: deleteCategoriaPrincipal,
    },
    "Categoría Principal"
  );

  const editingCategoria = editingItem as CategoriaPrincipal | null;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categorías Principales</h1>
              <p className="text-gray-600 mt-2">
                Gestiona las categorías principales del sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Contenedor principal */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="w-full space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-0 text-left">
              Lista de Categorías Principales
            </h3>

            {/* Buscador + botón */}
            <div className="flex justify-between items-center w-full">
              <div className="w-full max-w-sm">
                <SearchInput
                  searchTerm={searchTerm}
                  placeholder="Buscar categorías..."
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
                label="Nueva Categoría"
                onClick={handleAdd}
              />
            </div>
          </div>

          {/* TABLA */}
          <div className="mt-6">
            <CategoriaPrincipalTable
              data={currentItems}
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

        {/* Modal */}
        {showModal && (
          <ModalVentana
            isOpen={showModal}
            onClose={handleCloseModal}
            title={editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
          >
            <CategoriaPrincipalForm
              initialData={
                editingCategoria
                  ? { 
                      id: editingCategoria.id, 
                      nombre: editingCategoria.nombre, 
                      activo: (editingCategoria as any).activo,
                      imagen_url: (editingCategoria as any).imagen_url
                    }
                  : undefined
              }
              onSubmit={handleFormSubmit}
              onSuccess={async () => {
                // Refresca la tabla y cierra el modal al terminar
                await refreshItems();
                handleCloseModal();
              }}
              onCancel={handleCloseModal}
            />
          </ModalVentana>
        )}

        {/* Notificación */}
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

// /app/catalogos/SubcategoriasPage.tsx (NUEVO y muy LIMPIO)

"use client";

import React from "react";
// Importamos el Hook y los componentes

import {
  getSubcategorias,
  createSubcategoria,
  updateSubcategoria,
  deleteSubcategoria,
  Subcategoria,
  CreateSubcategoriaData,
  UpdateSubcategoriaData,
}
import SearchInput from "../../../components/common/form/SearchInput";
//hola
import ActionButton from "../../components/common/ActionButton";
import SubcategoriasTable from "../../components/catalogos/SubcategoriasTable";
import Paginator from "../../components/common/Paginator";
import ModalVentana from "../../components/ui/ModalVentana";
import Alert from "../../components/ui/Alert";
import AuthenticatedLayout from "../../components/layout/AuthenticatedLayout";
import SubcategoriasForm from "../../components/catalogos/SubcategoriasForm";


// 1. COMPONENTE PRINCIPAL
export default function SubcategoriasPage() {
  // 🚀 Usamos el hook genérico, inyectando el servicio de SUBCATEGORÍAS
  const {
    currentItems, loading, totalItems, searchTerm, currentPage, pageSize,
    showModal, editingItem, notification, setSearchTerm,
    handlePageChange, handlePageSizeChange, handleAdd, handleEdit,
    handleDelete, handleFormSubmit, handleCloseModal,
  } = useCrudCatalog<Subcategoria, CreateSubcategoriaData, UpdateSubcategoriaData>(
    {
      loadItems: getSubcategorias,
      createItem: createSubcategoria,
      updateItem: updateSubcategoria,
      deleteItem: deleteSubcategoria,
    },
    "Subcategoría" // Etiqueta para notificaciones/confirmaciones
  );
  
  // Tipado explícito para la edición
  const editingSubcategoria = editingItem as Subcategoria | null;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* ... (Header - Se mantiene) ... */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Catálogos</h1>
              <p className="text-gray-600 mt-2">
                Gestiona las configuraciones básicas del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Tabs simuladas (Ajustamos el estado activo) */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <a href="/catalogos/categorias" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Categorías
              </a>
              <button className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Subcategorías
              </button>
              <a href="/catalogos/marcas" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Marcas
              </a>
            </nav>
          </div>
            
          {/* Header tabla */}
          <div className="w-full space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-0 text-left">
              Subcategorías
            </h3>
            <div className="flex justify-between items-center w-full">
              <div className="w-full max-w-sm">
                <SearchInput
                  searchTerm={searchTerm}
                  placeholder="Buscar subcategorías..."
                  onSearchChange={setSearchTerm}
                />
              </div>
              <ActionButton
                // ... (Icono se mantiene) ...
                label="Nueva Subcategoría"
                onClick={handleAdd}
              />
            </div>
          </div>

          {/* TABLA MODULARIZADA */}
          <div className="mt-6">
            <SubcategoriasTable
              data={currentItems as Subcategoria[]}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
            title={editingSubcategoria ? "Editar Subcategoría" : "Nueva Subcategoría"}
          >
            <SubcategoriasForm
              initialData={
                editingSubcategoria
                  ? {
                      nombre: editingSubcategoria.nombre,
                      // Se usa el ID del campo en la edición para preseleccionar
                      categoriaId: editingSubcategoria.categoriaId, 
                      estadoId: editingSubcategoria.estadoId,
                    }
                  : {
                      nombre: "",
                      categoriaId: 0, // Valor inicial del formulario
                      estadoId: 1,
                    }
              }
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
            />
          </ModalVentana>
        )}

        {/* Notificación flotante */}
        {notification && (
          <div className="fixed top-10 right-4 z-[9999]">
            <Alert
              message={notification.message}
              type={notification.type}
              onClose={handleCloseModal}
            />
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
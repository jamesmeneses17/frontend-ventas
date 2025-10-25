"use client";

import React from "react";
// Importamos el Hook y los componentes del Crud genérico
import { useCrudCatalog } from "../../../../components/hooks/useCrudCatalog";
import AuthenticatedLayout from "../../../../components/layout/AuthenticatedLayout";
import ActionButton from "../../../../components/common/ActionButton";
import Paginator from "../../../../components/common/Paginator";
import ModalVentana from "../../../../components/ui/ModalVentana";
import Alert from "../../../../components/ui/Alert";
import SearchInput from "../../../../components/common/form/SearchInput";

// 🛑 1. IMPORTAR COMPONENTES DE MARCAS
import MarcasTable from "../../../../components/catalogos/MarcasTable";
import MarcasForm from "../../../../components/catalogos/MarcasForm";

// 🛑 2. IMPORTAR SERVICIOS DE MARCAS
import {
  getMarcas,
  createMarca,
  updateMarca,
  deleteMarca,
  Marca,
  CreateMarcaData,
  UpdateMarcaData,
} from "../../../../components/services/marcasService";

// 1. COMPONENTE PRINCIPAL (MarcasPage)
export default function MarcasPage() {
  // 🚀 Usamos el hook genérico, inyectando el servicio y el nombre del ítem
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
  } = useCrudCatalog<Marca, CreateMarcaData, UpdateMarcaData>( // Usamos los tipos de Marca
    {
      loadItems: getMarcas,
      createItem: createMarca,
      updateItem: updateMarca,
      deleteItem: deleteMarca,
    },
    "Marca" // Nombre del ítem para notificaciones
  );

  // Tipado explícito para la edición
  const editingMarca = editingItem as Marca | null;

  // Obtenemos la ruta actual para manejar el estado activo de las pestañas
  const currentPath =
    typeof window !== "undefined"
      ? window.location.pathname
      : "/admin/productos/marcas"; // Ruta por defecto de Marcas

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Encabezado fijo de la sección */}
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

        {/* Contenido principal: Tabs, Tabla y Paginación */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Tabs de Navegación */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {/* Enlace Categorías */}
              <a
                href="/admin/productos"
                className={
                  currentPath === "/admin/productos" ||
                  (currentPath.includes("/admin/productos") &&
                    !currentPath.includes("/subcategorias") &&
                    !currentPath.includes("/marcas"))
                    ? "border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                }
              >
                Categorías
              </a>

              {/* Enlace Subcategorías */}
              <a
                href="/admin/productos/subcategorias"
                className={
                  currentPath.includes("/subcategorias")
                    ? "border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                }
              >
                Subcategorías
              </a>

              {/* Enlace Marcas (Activo aquí) */}
              <a
                href="/admin/productos/marcas"
                className={
                  currentPath.includes("/marcas")
                    ? "border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                }
              >
                **Marcas**
              </a>
            </nav>
          </div>

          {/* Header tabla: Título, Buscador y Botón */}
          <div className="w-full space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-0 text-left">
              Marcas
            </h3>
            <div className="flex justify-between items-center w-full">
              <div className="w-full max-w-sm">
                <SearchInput
                  searchTerm={searchTerm}
                  placeholder="Buscar marcas..."
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
                label="Nueva Marca"
                onClick={handleAdd}
              />
            </div>
          </div>

          {/* TABLA DE MARCAS */}
          <div className="mt-6">
            <MarcasTable
              data={currentItems as Marca[]} // Casteo al tipo Marca
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* SECCIÓN DE PAGINADOR */}
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

        {/* Modal reutilizable para el formulario de Marcas */}
        {showModal && (
          <ModalVentana
            isOpen={showModal}
            onClose={handleCloseModal}
            title={editingMarca ? "Editar Marca" : "Nueva Marca"}
          >
                                   {" "}
            <MarcasForm
              initialData={
                editingMarca
                  ? {
                      id: editingMarca.id,
                      nombre: editingMarca.nombre,
                      estadoId: editingMarca.estado.id,
                    }
                  : {
                      nombre: "",
                      estadoId: 1,
                    }
              } // 🛑 CORRECCIÓN CLAVE: ELIMINAMOS onSubmit y usamos onSuccess
              onSuccess={handleFormSubmit}
              onCancel={handleCloseModal}
            />
                               {" "}
          </ModalVentana>
        )}

        {/* Notificación flotante */}
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

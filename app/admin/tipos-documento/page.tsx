"use client";

import React from "react";
import { TipoDocumento } from "../../../components/services/clientesServices";
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";
import { createTipoDocumento, CreateTipoDocumentoData, deleteTipoDocumento, getTiposDocumento, updateTipoDocumento, UpdateTipoDocumentoData } from "../../../components/services/tiposDocumentoService";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import { FileText, Plus } from "lucide-react";
import SearchInput from "../../../components/common/form/SearchInput";
import ActionButton from "../../../components/common/ActionButton";
import TiposDocumentoTable from "../../../components/catalogos/TiposDocumentoTable";
import TiposDocumentoForm from "../../../components/catalogos/TiposDocumentoForm";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import Paginator from "../../../components/common/Paginator";
// Importamos el Hook y los componentes comunes





// 2. COMPONENTE PRINCIPAL DE TIPOS DE DOCUMENTO
export default function TiposDocumentoPage() {
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

  } = useCrudCatalog<TipoDocumento, CreateTipoDocumentoData, UpdateTipoDocumentoData>(
    {
      // Usamos las funciones CRUD del servicio de Tipos de Documento
      loadItems: getTiposDocumento as any, 
      createItem: createTipoDocumento,
      updateItem: updateTipoDocumento,
      deleteItem: deleteTipoDocumento,
    },
    "Tipo de Documento", // Nombre de la entidad para notificaciones
    // Pasamos un pageSize muy grande o no pasamos la paginación si el hook lo soporta
  );

  // Tipado explícito para la edición
  const editingTipo = editingItem as TipoDocumento | null;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Encabezado de la página */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                Tipos de Documento
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona los tipos de documentos utilizados por clientes (DNI, RUC, Cédula, etc.).
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal: Buscador, Botón y Tabla */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Header tabla */}
          <div className="w-full space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-0 text-left">
              Lista de Tipos de Documento
            </h3>
            {/* Buscador y botón "Nuevo Tipo" */}
            <div className="flex justify-between items-center w-full">
              {/* En Tipos de Documento, el buscador no suele ser necesario, 
                  pero lo mantenemos para consistencia. */}
              <div className="w-full max-w-sm">
                <SearchInput
                  searchTerm={searchTerm}
                  placeholder="Buscar tipo de documento..."
                  onSearchChange={setSearchTerm}
                />
              </div>
              <ActionButton
                icon={<Plus className="-ml-1 mr-2 h-5 w-5" />}
                label="Nuevo Tipo"
                onClick={handleAdd}
              />
            </div>
          </div>

          {/* TABLA DE TIPOS DE DOCUMENTO MODULARIZADA */}
          <div className="mt-6">
            <TiposDocumentoTable
              data={currentItems as TipoDocumento[]} // Casteo al tipo específico
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            
            {/* Muestra el paginador si no está cargando y hay ítems */}
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

        {/* Modal reutilizable para el Formulario */}
        {showModal && (
          <ModalVentana
            isOpen={showModal}
            onClose={handleCloseModal}
            title={editingTipo ? "Editar Tipo de Documento" : "Crear Tipo de Documento"}
          >
            <TiposDocumentoForm
              initialData={editingTipo ? { id: editingTipo.id, nombre: editingTipo.nombre } : undefined}
              onSuccess={handleFormSubmit} // onSuccess en el formulario mapea a onSubmit en useCrudCatalog
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
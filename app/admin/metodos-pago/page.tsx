"use client";

import React from "react";
// Importamos el Hook y los componentes comunes
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import ActionButton from "../../../components/common/ActionButton";
import Paginator from "../../../components/common/Paginator";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import SearchInput from "../../../components/common/form/SearchInput";
import { CreditCard, PlusCircle } from "lucide-react"; // Iconos para Métodos de Pago

// 1. IMPORTACIONES ESPECÍFICAS DE MÉTODOS DE PAGO
import MetodosPagoTable from "../../../components/catalogos/MetodosPagoTable";
import MetodosPagoForm from "../../../components/catalogos/MetodosPagoForm";
import { 
  MetodoPago, 
  createMetodoPago, 
  CreateMetodoPagoData, 
  deleteMetodoPago, 
  getMetodosPago, 
  updateMetodoPago, 
  UpdateMetodoPagoData 
} from "../../../components/services/metodosPagoService";


// 2. COMPONENTE PRINCIPAL DE MÉTODOS DE PAGO
export default function MetodosPagoPage() {
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
  } = useCrudCatalog<MetodoPago, CreateMetodoPagoData, UpdateMetodoPagoData>(
    {
      // Usamos las funciones CRUD del servicio de métodos de pago
      loadItems: getMetodosPago as any, 
      createItem: createMetodoPago,
      updateItem: updateMetodoPago,
      deleteItem: deleteMetodoPago,
    },
    "Método de Pago" // Nombre de la entidad para notificaciones
  );

  // Tipado explícito para la edición
  const editingMetodo = editingItem as MetodoPago | null;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* 1. Encabezado de la página (Similar a ClientesPage) */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-indigo-600" />
                Métodos de Pago
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona los métodos aceptados para transacciones.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Contenido principal: Buscador, Botón y Tabla (Similar a ClientesPage) */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Header tabla */}
          <div className="w-full space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-0 text-left">
              Lista de Métodos de Pago
            </h3>
            {/* Buscador y botón "Nuevo Método" */}
            <div className="flex justify-between items-center w-full">
              <div className="w-full max-w-sm">
                <SearchInput
                  searchTerm={searchTerm}
                  placeholder="Buscar métodos de pago por nombre..."
                  onSearchChange={setSearchTerm}
                />
              </div>
              <ActionButton
                icon={<PlusCircle className="-ml-1 mr-2 h-5 w-5" />}
                label="Nuevo Método"
                onClick={handleAdd}
              />
            </div>
          </div>

          {/* TABLA DE MÉTODOS DE PAGO MODULARIZADA */}
          <div className="mt-6">
            <MetodosPagoTable
              data={currentItems as MetodoPago[]} // Casteo al tipo específico
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* SECCIÓN DE INFORMACIÓN Y PAGINADOR */}
          <div className="flex justify-between items-center mt-4">
            {/* Muestra el contador de ítems */}
            <p className="text-sm text-gray-600">
              Mostrando {currentItems.length} de {totalItems} métodos.
            </p>
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
            title={editingMetodo ? "Editar Método de Pago" : "Nuevo Método de Pago"}
          >
            <MetodosPagoForm
              initialData={
                editingMetodo
                  ? {
                      id: editingMetodo.id,
                      nombre: editingMetodo.nombre,
                    }
                  : {
                      nombre: "",
                    }
              }
              onSubmit={handleFormSubmit}
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
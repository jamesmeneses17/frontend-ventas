"use client";

import React from "react";
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import { CreditCard, Plus } from "lucide-react";
import SearchInput from "../../../components/common/form/SearchInput";
import ActionButton from "../../../components/common/ActionButton";
import MetodosPagoTable from "../../../components/catalogos/MetodosPagoTable";
import MetodosPagoForm from "../../../components/catalogos/MetodosPagoForm";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import Paginator from "../../../components/common/Paginator";

import {
  MetodoPago,
  createMetodoPago,
  CreateMetodoPagoData,
  deleteMetodoPago,
  getMetodosPago,
  updateMetodoPago,
  UpdateMetodoPagoData,
} from "../../../components/services/metodosPagoService";

// ============================
// COMPONENTE PRINCIPAL
// ============================

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
      loadItems: getMetodosPago as any,
      createItem: createMetodoPago,
      updateItem: updateMetodoPago,
      deleteItem: deleteMetodoPago,
    },
    "Método de Pago"
  );

  const editingMetodo = editingItem as MetodoPago | null;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* === ENCABEZADO DE PÁGINA === */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-indigo-600" />
                Métodos de Pago
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona los métodos de pago aceptados para las transacciones.
              </p>
            </div>
          </div>
        </div>

        {/* === CONTENIDO PRINCIPAL === */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="w-full space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-0 text-left">
              Lista de Métodos de Pago
            </h3>

            {/* Buscador + Botón Nuevo */}
            <div className="flex justify-between items-center w-full">
              <div className="w-full max-w-sm">
                <SearchInput
                  searchTerm={searchTerm}
                  placeholder="Buscar método de pago..."
                  onSearchChange={setSearchTerm}
                />
              </div>
              <ActionButton
                icon={<Plus className="-ml-1 mr-2 h-5 w-5" />}
                label="Nuevo Método"
                onClick={handleAdd}
              />
            </div>
          </div>

          {/* TABLA */}
          <div className="mt-6">
            <MetodosPagoTable
              data={currentItems as MetodoPago[]}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* PAGINADOR */}
          <div className="flex justify-between items-center mt-4">
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

        {/* === MODAL FORMULARIO === */}
        {showModal && (
          <ModalVentana
            isOpen={showModal}
            onClose={handleCloseModal}
            title={editingMetodo ? "Editar Método de Pago" : "Crear Método de Pago"}
          >
            <MetodosPagoForm
              initialData={
                editingMetodo
                  ? { id: editingMetodo.id, nombre: editingMetodo.nombre }
                  : undefined
              }
              onSuccess={handleFormSubmit}
              onCancel={handleCloseModal}
            />
          </ModalVentana>
        )}

        {/* === ALERTAS === */}
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

"use client";

import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";

import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import Paginator from "../../../components/common/Paginator";
import SearchInput from "../../../components/common/form/SearchInput";

// Componentes UI Compras


import ComprasTable from "../../../components/catalogos/ComprasTable";
import ComprasForm from "../../../components/catalogos/ComprasForm";

// Hook CRUD
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";

// Servicios de compras
import {
  getCompras,
  createCompra,
  updateCompra,
  deleteCompra,
  Compra,
  CreateCompraDTO,
  UpdateCompraDTO,
} from "../../../components/services/comprasService";

export default function ComprasPage() {
  const [formError, setFormError] = useState("");

  const {
    currentItems,
    totalItems,
    loading,
    searchTerm,
    currentPage,
    pageSize,
    showModal,
    editingItem,
    notification,

    setSearchTerm,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCloseModal,
    handleFormSubmit,
    handlePageChange,
    handlePageSizeChange,
    setNotification,
  } = useCrudCatalog<Compra, CreateCompraDTO, UpdateCompraDTO>(
    {
      loadItems: async (all, page, size, searchTerm) =>
        await getCompras(page, size, searchTerm),
      createItem: createCompra,
      updateItem: updateCompra,
      deleteItem: deleteCompra,
    },
    "Compra"
  );

  const editingCompra = editingItem as Compra | null;

  const handleSubmitWithError = async (data: any) => {
    setFormError("");
    try {
      await handleFormSubmit(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Error al guardar.";
      setFormError(msg);
    }
  };

  const handleDeleteWithRefresh = async (id: number) => {
    await handleDelete(id);
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* ================== HEADER ================== */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Registro de Compras</h1>
            <p className="text-gray-600">Administra el historial de compras</p>
          </div>

          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
          >
            Nueva Compra
          </button>
        </div>

        {/* ================== BUSCADOR ================== */}
        <div className="max-w-sm">
          <SearchInput
            placeholder="Buscar por proveedor o código..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>

        {/* ================== TABLA ================== */}
        <ComprasTable
          data={currentItems || []}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteWithRefresh}
        />

        {/* ================== PAGINADOR ================== */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-gray-600 text-sm">
            {!loading && totalItems > 0
              ? `Mostrando ${currentItems.length} de ${totalItems} compras`
              : loading
              ? "Cargando..."
              : "No hay compras registradas"}
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

        {/* ================== MODAL ================== */}
        {showModal && (
          <ModalVentana
            isOpen={showModal}
            onClose={handleCloseModal}
            title={editingCompra ? "Editar Compra" : "Registrar Compra"}
          >
            <ComprasForm
              initialData={editingCompra}
              onSubmit={handleSubmitWithError}
              onCancel={handleCloseModal}
              formError={formError}
            />
          </ModalVentana>
        )}

        {/* ================== ALERTAS ================== */}
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

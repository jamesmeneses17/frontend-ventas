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
import { UserPlus, Users } from "lucide-react"; // Iconos para clientes

// 1. IMPORTACIONES ESPECÍFICAS DE CLIENTES
import ClientesTable from "../../../components/catalogos/ClientesTable";
import ClientesForm from "../../../components/catalogos/ClientesForm";
import { Cliente, createCliente, CreateClienteData, deleteCliente, getClientes, updateCliente, UpdateClienteData } from "../../../components/services/clientesServices";



// 2. COMPONENTE PRINCIPAL DE CLIENTES
export default function ClientesPage() {
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
  } = useCrudCatalog<Cliente, CreateClienteData, UpdateClienteData>(
    {
      // Usamos las funciones CRUD del nuevo servicio de clientes
      loadItems: getClientes as any, // Asegúrate de que getClientes cumpla con la firma de useCrudCatalog
      createItem: createCliente,
      updateItem: updateCliente,
      deleteItem: deleteCliente,
    },
    "Cliente" // Nombre de la entidad para notificaciones
  );

  // Tipado explícito para la edición
  const editingCliente = editingItem as Cliente | null;

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Encabezado de la página */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                Gestion de Contactos
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona la información de tus contactos
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal: Buscador, Botón y Tabla */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Header tabla */}
          <div className="w-full space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-0 text-left">
              Lista de Contactos
            </h3>
            {/* Buscador y botón "Nuevo Cliente" */}
            <div className="flex justify-between items-center w-full">
              <div className="w-full max-w-sm">
                <SearchInput
                  searchTerm={searchTerm}
                  placeholder="Buscar clientes por nombre o documento..."
                  onSearchChange={setSearchTerm}
                />
              </div>
              <ActionButton
                icon={<UserPlus className="-ml-1 mr-2 h-5 w-5" />}
                label="Nuevo Contacto"
                onClick={handleAdd}
              />
            </div>
          </div>

          {/* TABLA DE CLIENTES MODULARIZADA */}
          <div className="mt-6">
            <ClientesTable
              data={currentItems as Cliente[]} // Casteo al tipo específico
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* SECCIÓN DE INFORMACIÓN Y PAGINADOR */}
          <div className="flex justify-between items-center mt-4">
            {/* Muestra el contador de ítems */}
            <p className="text-sm text-gray-600">
              Mostrando {currentItems.length} de {totalItems} tipos.
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
            title={editingCliente ? "Editar Contacto" : "Registrar Nuevo Contacto"}
          >
            <ClientesForm
              initialData={
                editingCliente
                  ? {
                    id: editingCliente.id,
                    nombre: editingCliente.nombre,
                    tipo_documento_id: editingCliente.tipo_documento_id,
                    numero_documento: editingCliente.numero_documento,
                    direccion: editingCliente.direccion,
                    correo: editingCliente.correo,
                    telefono: editingCliente.telefono,
                    tipo_contacto_id: editingCliente.tipo_contacto_id ?? 0,
                    tipo_persona_id: editingCliente.tipo_persona_id ?? 0,
                  }
                  : {
                    nombre: "",
                    tipo_documento_id: 1,
                    numero_documento: "",
                    direccion: "",
                    correo: "",

                    telefono: "",
                    tipo_contacto_id: 0,
                    tipo_persona_id: 0,
                  }
              }
              onSubmit={async (data) => {
                const result = await handleFormSubmit(data);
                if (result) handleCloseModal();
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
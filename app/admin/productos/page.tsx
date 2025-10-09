// /app/catalogos/CategoriasPage.tsx (MODIFICADO para soportar pageSize dinámico)

"use client";

import React, { useState, useEffect, useMemo } from "react";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";

import ActionButton from "../../../components/common/ActionButton";
import CategoriasTable from "../../../components/catalogos/CategoriasTable";
import CategoriasForm from "../../../components/catalogos/CategoriasForm";
import Paginator from "../../../components/common/Paginator";

import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  Categoria,
} from "../../../components/services/categoriasService";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import SearchInput from "../../../components/common/form/SearchInput";

// 1. COMPONENTE PRINCIPAL
export default function CategoriasPage() {
  const [allCategorias, setAllCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Inicia en 5 (o 3 si lo prefieres)

  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(
    null
  );

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // Se oculta después de 5 segundos
      return () => clearTimeout(timer); // Limpieza
    }
  }, [notification]);

  // 🚀 Cargar datos del backend al montar
  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    setLoading(true);
    try {
      // Pedimos todas las categorías (activas e inactivas) en el admin
      const data = await getCategorias(true);
      const sortedData = data.sort((a, b) => b.id - a.id);
      setAllCategorias(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentCategorias = useMemo(() => {
    let filteredData = allCategorias;

    if (searchTerm) {
      filteredData = filteredData.filter((categoria) =>
        categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Usamos el estado 'pageSize'
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [allCategorias, currentPage, pageSize, searchTerm]); // Depende de pageSize

  const totalItems = allCategorias.length;

  // Handlers para la tabla (pasan el objeto o ID)
  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const categoria = allCategorias.find((c) => c.id === id);
    if (
      categoria &&
      confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)
    ) {
      await deleteCategoria(categoria.id);
      loadCategorias();
    }
  };

  const handleAdd = () => {
    setEditingCategoria(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (formData: {
    nombre: string;
    estadoId: number;
  }) => {
    const isEditing = !!editingCategoria;

    const dataToSend = {
      nombre: formData.nombre,
      estadoId: formData.estadoId,
    };

    try {
      if (isEditing) {
        // Lógica de EDICIÓN (Se mantiene la verificación de cambios)
        const updated = await updateCategoria(editingCategoria!.id, dataToSend);
        console.debug("[handleFormSubmit] update response:", updated);
        // Verificar que el estado se aplicó: comprobamos estadoId o estado.id en la respuesta
        const newEstadoId =
          (updated as any).estadoId ?? (updated as any).estado?.id;
        if (newEstadoId !== undefined && newEstadoId !== dataToSend.estadoId) {
          setNotification({
            message: `Advertencia: el servidor devolvió estado ${newEstadoId} distinto a ${dataToSend.estadoId}.`,
            type: "error",
          });
        }
      } else {
        const created = await createCategoria(dataToSend);
        console.debug("[handleFormSubmit] create response:", created);
      }

      setNotification({
        message: `Categoría "${formData.nombre}" ${
          isEditing ? "actualizada" : "creada"
        } correctamente.`,
        type: "success",
      });

      handleCloseModal();
      loadCategorias();
    } catch (error) {
      console.error("[handleFormSubmit] error:", error);
      // Extraer mensaje de error del backend si existe
      const err: any = error;
      const resp = err?.response?.data ?? err?.data ?? null;
      let message = err?.message ?? "Error desconocido";
      if (resp) {
        if (typeof resp === "string") message = resp;
        else if (resp.message) message = resp.message;
        else if (resp.errors) message = Array.isArray(resp.errors) ? resp.errors.join(', ') : String(resp.errors);
        else message = JSON.stringify(resp);
      }

      // Mostrar notificación de error y mantener el modal abierto para que el usuario corrija
      setNotification({ message, type: "error" });
    }
  };

  // Handler para el cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    // Reiniciamos a la primera página para evitar problemas de visualización
    setCurrentPage(1);
  };

  const handleCloseModal = () => {
    setEditingCategoria(null); // Limpia la categoría seleccionada (para asegurar que 'Nuevo' funcione)
    setShowModal(false);
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header (Mantenido) */}
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
          {/* Tabs simuladas (Mantenido) */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Categorías
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Subcategorías
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Marcas
              </button>
            </nav>
          </div>
                   {/* Header tabla */}
          <div className="w-full space-y-3">
            {/* Fila 1: Título */}
            <h3 className="text-xl font-semibold text-gray-900 mb-0 text-left">
              Categorías
            </h3>

            {/* Fila 2: Buscador + Botón */}
            <div className="flex justify-between items-center w-full">
              <div className="w-full max-w-sm">
                <SearchInput
                  searchTerm={searchTerm}
                  placeholder="Buscar categorías..."
                  onSearchChange={(value) => {
                    setSearchTerm(value);
                    setCurrentPage(1);
                  }}
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
          {/* TABLA MODULARIZADA: Usamos los datos filtrados */}
          <div className="mt-6">
            <CategoriasTable
              data={currentCategorias}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          {/* SECCIÓN DE INFORMACIÓN Y PAGINADOR */}
          <div className="flex justify-between items-center mt-4">
            {/* Etiqueta de resultados a la izquierda (Usa 'pageSize' del estado) */}
            <p className="text-sm text-gray-600"></p>

            {/* Paginator a la derecha */}
            {!loading &&
              totalItems > 0 && ( // Siempre mostrar si hay ítems para cambiar el tamaño
                <Paginator
                  total={totalItems}
                  currentPage={currentPage}
                  pageSize={pageSize} // Le pasamos el estado
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange} // Le pasamos el nuevo handler
                />
              )}
          </div>
        </div>

        {/* Modal reutilizable: usa el handler de cierre centralizado */}
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
                      estadoId: editingCategoria.estadoId,
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

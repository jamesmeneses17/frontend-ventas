// /app/catalogos/CategoriasPage.tsx (MODIFICADO para soportar pageSize dinámico)

"use client";

import React, { useState, useEffect, useMemo } from "react";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";

import ActionButton from "../../../components/common/ActionButton";
import CategoriasTable from "../../../components/catalogos/CategoriasTable";
import CategoriasForm from "../../../components/catalogos/CategoriasForm";
import Paginator from "../../../components/common/Paginator";
import Modal from "../../../components/ui/ModalVentana";

import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  Categoria,
} from "../../../components/services/categoriasService";
import ModalVentana from "../../../components/ui/ModalVentana";

// 🔥 Eliminamos PAGE_SIZE constante y la convertimos en estado

// 1. COMPONENTE PRINCIPAL
export default function CategoriasPage() {
  const [allCategorias, setAllCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 ESTADO DE PAGINACIÓN: Tamaño de página y página actual
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Inicia en 5 (o 3 si lo prefieres)

  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(
    null
  );

  // 🚀 Cargar datos del backend al montar
  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    setLoading(true);
    try {
      const data = await getCategorias();
      setAllCategorias(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica para obtener los datos de la página actual (Paginación local)
  const currentCategorias = useMemo(() => {
    // Usamos el estado 'pageSize'
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allCategorias.slice(startIndex, endIndex);
  }, [allCategorias, currentPage, pageSize]); // Depende de pageSize

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

  // Handler del Formulario (recibe los datos ya manejados por CategoriasForm)
 const handleFormSubmit = async (formData: { nombre: string; }) => {
    try {
      if (editingCategoria) {
        // ✅ LÓGICA DE ACTUALIZACIÓN:
        // El servicio espera el ID y los datos parciales (solo el nombre)
        // Como formData solo contiene { nombre: string }, esto funciona perfecto con Partial<Categoria>.
        await updateCategoria(editingCategoria.id, {
            nombre: formData.nombre
        });
      } else {
        // LÓGICA DE CREACIÓN:
        // La API puede requerir descripción y estado (aunque no los pidamos en el form)
        // Enviamos el nombre y rellenamos los campos obligatorios con valores por defecto.
        const newCategoryData = {
            nombre: formData.nombre,
            descripcion: "", // Valor por defecto para la API
            estado: "Activo" as const, // Valor por defecto para la API
        };
        await createCategoria(newCategoryData);
      }
      
      // ✅ ÉXITO: Cierra el modal y recarga los datos
      handleCloseModal();
      loadCategorias(); 
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      // Opcional: Mostrar una notificación de error al usuario
    } 
  };

  // Handler para el cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 🔥 NUEVO HANDLER: para cambiar el tamaño de página
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
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
              color="primary"
            />
          </div>

          {/* TABLA MODULARIZADA: Usamos los datos filtrados */}
          <CategoriasTable
            data={currentCategorias}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

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
                editingCategoria || {
                  nombre: "",

                  //descripcion: "",
                  // estado: "Activo",
                }
              }
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
            />
          </ModalVentana>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

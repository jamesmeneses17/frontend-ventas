"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "../../components/layout/AuthenticatedLayout";

import ActionButton from "../../components/common/ActionButton";
import CategoriasTable from "../../components/catalogos/CategoriasTable";
import CategoriasForm from "../../components/catalogos/CategoriasForm";

import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  Categoria,
} from "../../components/services/categoriasService";

// 1. COMPONENTE PRINCIPAL
export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Cambié el nombre para ser más claro (modal)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(
    null
  );

  //  Cargar datos del backend al montar
  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    setLoading(true);
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para la tabla (pasan el objeto o ID)
  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const categoria = categorias.find((c) => c.id === id);
    if (
      categoria &&
      confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)
    ) {
      await deleteCategoria(categoria.id);
      loadCategorias();
    }
  };

  const handleAdd = () => {
    setEditingCategoria(null); // Para crear una nueva
    setShowModal(true);
  };

  // Handler del Formulario (recibe los datos ya manejados por CategoriasForm)
  const handleFormSubmit = async (formData: Categoria) => {
    if (editingCategoria) {
      // 🔥 Editar en backend
      await updateCategoria(editingCategoria.id, formData);
    } else {
      // 🔥 Crear en backend
      await createCategoria(formData);
    }

    setShowModal(false);
    loadCategorias();
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

          {/* 🔥 TABLA MODULARIZADA */}
          <CategoriasTable
            data={categorias}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* 🔥 MODAL MODULARIZADO */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
              </h2>

              <CategoriasForm
                // Si estamos editando, pasamos los datos. Si no, pasamos datos vacíos.
                initialData={
                  editingCategoria || {
                    nombre: "",
                    descripcion: "",
                    estado: "Activo",
                  }
                }
                onSubmit={handleFormSubmit}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

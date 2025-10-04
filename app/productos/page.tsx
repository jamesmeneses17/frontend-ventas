// /app/catalogos/CategoriasPage.tsx

"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "../../components/layout/AuthenticatedLayout";

// 🔥 USANDO COMPONENTES REUTILIZABLES
import CrudTable from "../../components/common/CrudTable";
import ActionButton from "../../components/common/ActionButton";
import FormInput from "../../components/common/form/FormInput";
import FormTextArea from "../../components/common/form/FormTextArea";
import FormSelect from "../../components/common/form/FormSelect";

// 📌 Importa el servicio
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

  const [showForm, setShowForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<Omit<Categoria, "id">>({
    nombre: "",
    descripcion: "",
    estado: "Activo",
  });

  // 🚀 Cargar datos del backend al montar
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

  // Función genérica para manejar los cambios del formulario
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handlers
  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      estado: categoria.estado,
    });
    setShowForm(true);
  };

  const handleDelete = async (categoria: Categoria) => {
    if (confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
      await deleteCategoria(categoria.id);
      loadCategorias();
    }
  };

  const handleAdd = () => {
    setEditingCategoria(null);
    setFormData({ nombre: "", descripcion: "", estado: "Activo" });
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategoria) {
      // 🔥 Editar en backend
      await updateCategoria(editingCategoria.id, formData);
    } else {
      // 🔥 Crear en backend
      await createCategoria(formData);
    }

    setShowForm(false);
    loadCategorias();
  };

  // 2. COLUMNAS
  const columns = [
    { key: "id", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "estado", label: "Estado" },
  ];

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
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
          {/* Tabs simuladas */}
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

          {/* Tabla */}
          <CrudTable
            columns={columns}
            data={categorias}
            loading={loading}
            renderRowActions={(categoria: Categoria) => (
              <div className="flex space-x-2">
                <ActionButton
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  }
                  onClick={() => handleEdit(categoria)}
                />
                <ActionButton
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  }
                  onClick={() => handleDelete(categoria)}
                  color="danger"
                />
              </div>
            )}
          />
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingCategoria ? "Editar Categoría" : "Nueva Categoría"}
              </h2>

              <form className="space-y-4" onSubmit={handleFormSubmit}>
                <FormInput
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleFormChange}
                  required
                />
                <FormTextArea
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion || ""}
                  onChange={handleFormChange}
                  rows={3}
                />
                <FormSelect
                  label="Estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleFormChange}
                  options={[
                    { value: "Activo", label: "Activo" },
                    { value: "Inactivo", label: "Inactivo" },
                  ]}
                  required
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

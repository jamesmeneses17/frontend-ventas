// app/admin/productos/page.tsx
"use client";

import React from "react";
// Importaciones del CRUD Hook y Layout
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";

// Componentes UI comunes
// NOTA: Asegúrate de que las rutas de estos componentes sean correctas
import Paginator from "../../../components/common/Paginator";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import SearchInput from "../../../components/common/form/SearchInput";
import CardStat from "../../../components/ui/CardStat"; 

// Componentes específicos del catálogo
import ProductosTable from "../../../components/catalogos/ProductosTable"; 
import ProductosForm from "../../../components/catalogos/ProductosForm";

// Servicios y Tipos
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  Producto,
  CreateProductoData,
  UpdateProductoData,
} from "../../../components/services/productosService";

// Iconos
import { Package, AlertTriangle, Zap, Box, Upload } from "lucide-react"; 
import ActionButton from "../../../components/common/ActionButton";

// Tipos para el resumen de widgets
interface ProductSummary {
  totalProductos: number;
  stockBajo: number;
  sinStock: number;
}

// 1. COMPONENTE PRINCIPAL
export default function ProductosPage() {
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
    // La función handlePageSizeChange no se usa en este paginador pero se mantiene la lógica
    handlePageSizeChange, 
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleCloseModal,
    setNotification,
  } = useCrudCatalog<Producto, CreateProductoData, UpdateProductoData>(
    {
      loadItems: async (all: boolean) => {
        // Si all es true, trae todos los productos
        return await getProductos();
      },
      createItem: createProducto,
      updateItem: updateProducto,
      deleteItem: deleteProducto,
    },
    "Producto"
  );

  // Tipado explícito para la edición
  const editingProducto = editingItem as Producto | null;

  // Datos simulados para los widgets.
  // En una aplicación real, los valores de Stock Bajo y Sin Stock
  // deberían venir de una consulta optimizada al backend.
  const productSummary: ProductSummary = {
    totalProductos: totalItems, 
    // Los siguientes son SIMULADOS por ahora, usa lógica real en producción:
    stockBajo: (currentItems as Producto[]).filter(p => p.stock && p.stock > 0 && p.stock <= 10).length,
    sinStock: (currentItems as Producto[]).filter(p => p.stock === 0).length, 
  };
  
  // Función para simular el botón de "Importar Datos"
  const handleImport = () => {
      alert("Función de Importar Datos no implementada. [Pendiente de desarrollo]");
  };


  return (
    <AuthenticatedLayout>
      <div className="space-y-6">

        {/* --- WIDGETS DE RESUMEN --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardStat 
            title="Total Productos" 
            value={productSummary.totalProductos.toString()} 
            color="text-indigo-600" 
            icon={<Box className="h-4 w-4" />} 
          />
          <CardStat 
            title="Stock Bajo" 
            value={productSummary.stockBajo.toString()} 
            color="text-yellow-600" 
            icon={<AlertTriangle className="h-4 w-4" />} 
          />
          <CardStat 
            title="Sin Stock" 
            value={productSummary.sinStock.toString()} 
            color="text-red-600" 
            icon={<Package className="h-4 w-4" />} 
          />
        </div>
        
        {/* --- Contenido principal: Título y Tabla --- */}
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-300">
          
          {/* Título y Botones */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-green-600" />
                Lista de Productos
              </h1>
              <p className="text-gray-600 mt-2">
                Gestiona tu catálogo de productos
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* NOTA: Usamos el ícono de Lucide para Importar (Upload) para simplificar y mantener la consistencia */}
              <ActionButton 
                icon={<Upload className="w-5 h-5 mr-1" />}
                label="Importar Datos"
                onClick={handleImport}
                color="primary"
              />

              <ActionButton
                icon={<svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>}
                label="Nuevo Producto"
                onClick={handleAdd}
                color="primary"
              />
            </div>
          </div>
          
          {/* Buscador */}
          <div className="w-full max-w-md mb-6">
            <SearchInput
              searchTerm={searchTerm}
              placeholder="Buscar productos por nombre o código..."
              onSearchChange={setSearchTerm}
            />
          </div>

          {/* TABLA MODULARIZADA */}
          <ProductosTable
            data={currentItems as Producto[]} 
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* SECCIÓN DE INFORMACIÓN Y PAGINADOR */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
                {!loading && totalItems > 0 
                  ? `Mostrando ${currentItems.length} de ${totalItems} productos` 
                  : (loading ? "Cargando..." : "No hay productos registrados")}
            </p>
            {!loading && totalItems > 0 && (
              <Paginator
                total={totalItems}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                // Si tienes un componente para cambiar el tamaño, úsalo, sino omite el prop onPageSizeChange
                onPageSizeChange={handlePageSizeChange} 
              />
            )}
          </div>
        </div>

        {/* Modal reutilizable */}
        {showModal && (
          <ModalVentana
            isOpen={showModal}
            onClose={handleCloseModal}
            title={editingProducto ? "Editar Producto" : "Nuevo Producto"}
          >
            <ProductosForm
              initialData={editingProducto}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
            />
          </ModalVentana>
        )}

        {/* Notificación de alerta */}
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
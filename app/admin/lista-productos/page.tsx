// app/admin/lista-productos/page.tsx
"use client";

import React from "react";
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";

// Componentes UI comunes
import Paginator from "../../../components/common/Paginator";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import SearchInput from "../../../components/common/form/SearchInput";
import CardStat from "../../../components/ui/CardStat"; 

// Componentes específicos del catálogo
import ProductosTable from "../../../components/catalogos/ProductosTable"; 
import ProductosForm from "../../../components/catalogos/ProductosForm";

// Servicios
import { getCategorias } from "../../../components/services/categoriasService";
import { getEstados } from "../../../components/services/estadosService";

import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  Producto,
  CreateProductoData,
  UpdateProductoData,
  Estado,
  Categoria,
} from "../../../components/services/productosService";

// Iconos
import { Package, AlertTriangle, Box, Upload } from "lucide-react"; 
import ActionButton from "../../../components/common/ActionButton";

// Tipos para el resumen de widgets
interface ProductSummary {
  totalProductos: number;
  stockBajo: number;
  sinStock: number;
}

// -------------------- COMPONENTE PRINCIPAL --------------------
export default function ListaProductosPage() {
  const [categorias, setCategorias] = React.useState<Categoria[]>([]);
  const [estados, setEstados] = React.useState<Estado[]>([]);

  // Hook CRUD principal
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
  } = useCrudCatalog<Producto, CreateProductoData, UpdateProductoData>(
    {
      loadItems: async (all: boolean) => await getProductos(),
      createItem: createProducto,
      updateItem: updateProducto,
      deleteItem: deleteProducto,
    },
    "Producto"
  );

  // Cargar catálogos de categorías y estados
  React.useEffect(() => {
    getCategorias().then(setCategorias).catch(err => console.error("Error cargando categorías:", err));
    getEstados().then(setEstados).catch(err => console.error("Error cargando estados:", err));
  }, []);

  const editingProducto = editingItem as Producto | null;

  // Datos de resumen para widgets
  const productSummary: ProductSummary = {
    totalProductos: totalItems,
    stockBajo: (currentItems as Producto[]).filter(p => p.stock && p.stock > 0 && p.stock <= 10).length,
    sinStock: (currentItems as Producto[]).filter(p => p.stock === 0).length,
  };

  // Función de Importar (simulada)
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

        {/* --- CONTENIDO PRINCIPAL --- */}
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-300">
          
          {/* TÍTULO Y BOTONES */}
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

          {/* BUSCADOR */}
          <div className="w-full max-w-md mb-6">
            <SearchInput
              searchTerm={searchTerm}
              placeholder="Buscar productos por nombre o código..."
              onSearchChange={setSearchTerm}
            />
          </div>

          {/* TABLA DE PRODUCTOS */}
          <ProductosTable
            data={currentItems as Producto[]}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            categorias={categorias}
            estados={estados}
          />

          {/* PAGINADOR */}
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
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        </div>

        {/* MODAL */}
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

        {/* ALERTA */}
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

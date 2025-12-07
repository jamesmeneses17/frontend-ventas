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
import { formatCurrency } from "../../../utils/formatters";

// Componentes específicos del catálogo

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
import FilterBar from "../../../components/common/FilterBar";
import ProductosTable from "../../../components/catalogos/ProductosTable";
import ProductosForm from "../../../components/catalogos/ProductosForm";

// Tipos para el resumen de widgets
interface ProductSummary {
  totalProductos: number;
  stockBajo: number;
  sinStock: number;
}

const ESTADOS_STOCK_FILTRO = [
  { label: "Filtrar por: Todos los Estados", value: "" },
  { label: "Disponible", value: "Disponible" },
  { label: "Stock Bajo", value: "Stock Bajo" },
  { label: "Agotado", value: "Agotado" },
];

// -------------------- COMPONENTE PRINCIPAL --------------------
export default function ListaProductosPage() {
  // Estado para mostrar error de validación en el formulario
  const [formError, setFormError] = React.useState<string>("");
  const [categorias, setCategorias] = React.useState<Categoria[]>([]);
  const [estados, setEstados] = React.useState<Estado[]>([]);
  const [estadoStockFiltro, setEstadoStockFiltro] = React.useState<string>("");
  

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
       // Los parámetros ya no son implícitos 'any', los tipamos o los pasamos.
      loadItems: async (all, page, size, searchTerm, stockFiltro) => {
        // El useCrudCatalog pasa (all: boolean, page: number, size: number, searchTerm, ...customDependencies)
        // Ahora el filtro de estado se pasa correctamente
        return await getProductos(page, size, stockFiltro, searchTerm);
      },
      createItem: createProducto,
      updateItem: updateProducto,
      deleteItem: deleteProducto,
    },
    "Producto",
    // 🔑 CORRECCIÓN 2: Pasamos el filtro de stock como dependencia custom
    { customDependencies: [estadoStockFiltro] } 
  );

  // Cargar catálogos de categorías y estados
  React.useEffect(() => {
    getCategorias()
      .then((res: any) => setCategorias(res.data || res || []))
      .catch(err => console.error("Error cargando categorías:", err));
    getEstados()
      .then((res: any) => setEstados(res.data || res || []))
      .catch(err => console.error("Error cargando estados:", err));
  }, []);

  const editingProducto = editingItem as Producto | null;

  // Estado para los totales reales por estado
  const [stats, setStats] = React.useState<{ total: number; stockBajo: number; agotado: number }>({ total: 0, stockBajo: 0, agotado: 0 });

  // Función para actualizar los stats
  const updateStats = React.useCallback(() => {
    import("../../../components/services/productosService").then(mod => {
      mod.getProductosStats().then(setStats).catch(() => setStats({ total: 0, stockBajo: 0, agotado: 0 }));
    });
  }, []);

  // Consumir los totales al montar el componente
  React.useEffect(() => {
    updateStats();
  }, [updateStats]);

  // Listener para eventos cuando otro lugar (p.ej. página de Precios) actualice un producto
  React.useEffect(() => {
    const handler = (e: any) => {
      console.log('[ListaProductos] Recibido evento producto:updated, recargando lista', e?.detail);
      // Forzar recarga de la página actual
      handlePageChange(1);
      // también actualizar stats
      updateStats();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('producto:updated', handler as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('producto:updated', handler as EventListener);
      }
    };
  }, [handlePageChange, updateStats]);

  // Handlers locales para actualizar stats después de operaciones CRUD
  const handleFormSubmitWithStats = async (data: CreateProductoData | UpdateProductoData) => {
    setFormError("");
    try {
      await handleFormSubmit(data);
      updateStats();
    } catch (error: any) {
      // Intenta extraer el mensaje del backend
      const msg = error?.response?.data?.message || error?.message || "Error al guardar el producto.";
      setFormError(msg);
    }
  };

  const handleDeleteWithStats = async (id: number) => {
    await handleDelete(id);
    updateStats();
  };

  // Datos de resumen para widgets
  const productSummary: ProductSummary = {
    totalProductos: stats.total,
    stockBajo: stats.stockBajo,
    sinStock: stats.agotado,
  };

  // Esto resuelve el error "No se encuentra el nombre 'handleStockFilterChange'"
  const handleStockFilterChange = (value: string) => {
    console.log('[Filtro Estado] Valor seleccionado:', value);
    setEstadoStockFiltro(value);
    handlePageChange(1); // Resetear a la primera página cuando el filtro cambia
  };

  // Función de Importar (simulada)
  const handleImport = () => {
    alert("Función de Importar Datos no implementada. [Pendiente de desarrollo]");
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">

        {/* --- WIDGETS DE RESUMEN --- */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardStat 
            title="Total Productos" 
            value={String(productSummary.totalProductos ?? 0)} 
            color="text-indigo-600" 
            icon={<Box className="h-4 w-4" />} 
          />
          <CardStat 
            title="Stock Bajo" 
            value={String(productSummary.stockBajo ?? 0)} 
            color="text-yellow-600" 
            icon={<AlertTriangle className="h-4 w-4" />} 
          />
          <CardStat 
            title="Sin Stock" 
            value={String(productSummary.sinStock ?? 0)} 
            color="text-red-600" 
            icon={<Package className="h-4 w-4" />} 
          />
          <CardStat
            title="Total Inventario"
            value={formatCurrency(
              (currentItems || []).reduce((acc, p) => {
                const costo = Number((p as any).precio_costo ?? 0);
                const stock = Number((p as any).stock ?? 0);
                return acc + costo * stock;
              }, 0),
              '$'
            )}
            color="text-emerald-600"
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
                Lista de Inventario
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
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar productos por nombre o código..."
            
            selectOptions={ESTADOS_STOCK_FILTRO}
            selectFilterValue={estadoStockFiltro}
            onSelectFilterChange={handleStockFilterChange} // Usar el handler que resetea la página
          />
          </div>

          {/* TABLA DE PRODUCTOS */}
          <ProductosTable
            data={currentItems as Producto[]}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDeleteWithStats}
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
      onSubmit={handleFormSubmitWithStats}
      onCancel={handleCloseModal}
      formError={formError}
    />
    {formError && (
      <div className="text-red-600 text-sm mt-2 text-center">{formError}</div>
    )}
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

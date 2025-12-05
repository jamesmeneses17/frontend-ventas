// app/admin/caja/page.tsx
"use client";

import React from "react";
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";

// Componentes UI comunes
import Paginator from "../../../components/common/Paginator";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import ActionButton from "../../../components/common/ActionButton";
import FilterBar from "../../../components/common/FilterBar";
import CardStat from "../../../components/ui/CardStat"; 

// Componentes específicos de Movimientos de Caja

// Iconos y Servicios (Ajustar rutas según tu estructura real)
import { DollarSign, ArrowUpRight, ArrowDownLeft, AlertTriangle } from "lucide-react"; 
import { createMovimiento, CreateMovimientoData, deleteMovimiento, getMovimientosCaja, MovimientoCaja, updateMovimiento, UpdateMovimientoData } from "../../../components/services/movimientosService";
import MovimientosTable from "../../../components/catalogos/MovimientosTable";
import MovimientosForm from "../../../components/catalogos/MovimientosForm";
 // Asegúrate de crear este servicio
 
 
// Tipos para el resumen de widgets (Ajustar según tu backend)
interface CajaSummary {
  saldoActual: number;
  totalIngresosHoy: number;
  totalEgresosHoy: number;
}

// Opciones de filtro por tipo de movimiento (Ingreso, Egreso, Gasto)
const TIPO_MOVIMIENTO_FILTRO = [
  { label: "Filtrar por: Todos los Tipos", value: "" },
  { label: "Ingreso", value: "INGRESO" },
  { label: "Egreso", value: "EGRESO" },
  { label: "Gasto", value: "GASTO" },
];

// -------------------- COMPONENTE PRINCIPAL --------------------
export default function CajaPage() {
  const [formError, setFormError] = React.useState<string>("");
  const [tipoMovimientoFiltro, setTipoMovimientoFiltro] = React.useState<string>("");
  
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
  } = useCrudCatalog<MovimientoCaja, CreateMovimientoData, UpdateMovimientoData>(
    {
      loadItems: async (all, page, size, searchTerm, tipoFiltro) => {
        try {
          // El useCrudCatalog pasa el customDependency como último argumento
          return await getMovimientosCaja(page, size, tipoFiltro, searchTerm);
        } catch (err: any) {
          console.error('[CajaPage.loadItems] Error cargando movimientos:', err);
          return { data: [], total: 0 };
        }
      },
      createItem: createMovimiento,
      updateItem: (id: number, data: UpdateMovimientoData) => updateMovimiento({ id, ...(data as any) }),
      deleteItem: deleteMovimiento,
    },
    "Movimiento de Caja",
    // Pasamos el filtro de tipo de movimiento como dependencia custom
    { customDependencies: [tipoMovimientoFiltro] } 
  );

  const editingMovimiento = editingItem as MovimientoCaja | null;

  // Estado y función para los stats (simulación)
  const [stats, setStats] = React.useState<CajaSummary>({ saldoActual: 0, totalIngresosHoy: 0, totalEgresosHoy: 0 });

  // Simulación de carga de stats
  React.useEffect(() => {
    // Aquí deberías llamar a tu API para obtener el saldo actual, etc.
    // Ejemplo de datos simulados:
    setStats({ 
        saldoActual: 1500000, 
        totalIngresosHoy: 500000, 
        totalEgresosHoy: 150000 
    });
  }, [totalItems]); // Recargar stats cuando haya un cambio en la lista

  // Handlers para la lógica de stats (similar al ProductsPage)
  const handleFormSubmitWithStats = async (data: CreateMovimientoData | UpdateMovimientoData) => {
    setFormError("");
    try {
      await handleFormSubmit(data);
      // Después de guardar, recargar stats (o actualizar el estado local)
      // En un entorno real, la API te devolvería el nuevo saldo.
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Error al guardar el movimiento.";
      setFormError(msg);
    }
  };

  // Adapter para el formulario MovimientosForm que devuelve `fecha_str` y opcional `id`.
  const handleMovimientosFormSubmit = async (formData: any) => {
    // Convertir fecha_str -> fecha y mapear al tipo esperado por el servicio
    const payload: any = { ...formData };
    if (payload.fecha_str) {
      payload.fecha = payload.fecha_str;
      delete payload.fecha_str;
    }

    if (payload.id) {
      // Update
      const updatePayload: UpdateMovimientoData = payload as UpdateMovimientoData;
      await handleFormSubmitWithStats(updatePayload);
    } else {
      const createPayload: CreateMovimientoData = payload as CreateMovimientoData;
      await handleFormSubmitWithStats(createPayload);
    }
  };

  const handleDeleteWithStats = async (id: number) => {
    await handleDelete(id);
    // Después de borrar, recargar stats.
  };

  // Handler para el filtro de tipo de movimiento
  const handleTipoFilterChange = (value: string) => {
    console.log('[Filtro Tipo] Valor seleccionado:', value);
    setTipoMovimientoFiltro(value);
    handlePageChange(1); // Resetear a la primera página cuando el filtro cambia
  };
  
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">

        {/* --- WIDGETS DE RESUMEN (Simulando el Excel de Ingresos/Egresos) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardStat 
            title="Saldo Actual de Caja" 
            value={stats.saldoActual ? `$${stats.saldoActual.toLocaleString('es-CO')}` : "$0.00"}
            color="text-indigo-600" 
            icon={<DollarSign className="h-4 w-4" />} 
          />
          <CardStat 
            title="Ingresos Hoy" 
            value={stats.totalIngresosHoy ? `$${stats.totalIngresosHoy.toLocaleString('es-CO')}` : "$0.00"}
            color="text-green-600" 
            icon={<ArrowUpRight className="h-4 w-4" />} 
          />
          <CardStat 
            title="Egresos y Gastos Hoy" 
            value={stats.totalEgresosHoy ? `$${stats.totalEgresosHoy.toLocaleString('es-CO')}` : "$0.00"}
            color="text-red-600" 
            icon={<ArrowDownLeft className="h-4 w-4" />} 
          />
           <CardStat 
            title="Movimientos Totales" 
            value={String(totalItems ?? 0)} 
            color="text-yellow-600" 
            icon={<AlertTriangle className="h-4 w-4" />} 
          />
        </div>

        {/* --- CONTENIDO PRINCIPAL: TABLA DE MOVIMIENTOS --- */}
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-300">
          
          {/* TÍTULO Y BOTONES */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-indigo-600" />
                Registro de Caja y Movimientos
              </h1>
              <p className="text-gray-600 mt-2">
                Ingreso de Ingresos, Egresos y Gastos diarios (Según Excel: &quot;INGRESOS Y EGRESOS&quot;)
              </p>
            </div>
            
            <ActionButton
              icon={<svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>}
              label="Nuevo Movimiento"
              onClick={handleAdd}
              color="primary"
            />
          </div>

          {/* BUSCADOR Y FILTROS */}
          <div className="w-full mb-6">
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Buscar por descripción o concepto..."
              
              selectOptions={TIPO_MOVIMIENTO_FILTRO}
              selectFilterValue={tipoMovimientoFiltro}
              onSelectFilterChange={handleTipoFilterChange} 
            />
          </div>

          {/* TABLA DE MOVIMIENTOS */}
          <MovimientosTable
            data={currentItems as MovimientoCaja[]}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDeleteWithStats}
          />

          {/* PAGINADOR */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              {!loading && totalItems > 0 
                ? `Mostrando ${currentItems.length} de ${totalItems} movimientos` 
                : (loading ? "Cargando..." : "No hay movimientos registrados")}
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
            title={editingMovimiento ? "Editar Movimiento" : "Nuevo Movimiento"}
          >
            {/* Debes crear el componente MovimientosForm */}
            <MovimientosForm 
              initialData={editingMovimiento}
              onSubmit={handleMovimientosFormSubmit}
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
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

import { DollarSign, ArrowUpRight, ArrowDownLeft, AlertTriangle } from "lucide-react";
// Imports at top
import { getCompraById, Compra, syncCajaCompras } from "../../../components/services/comprasService";
import { getVentaById, Venta, syncCajaVentas } from "../../../components/services/ventasService";
import { createMovimiento, CreateMovimientoData, deleteMovimiento, getMovimientosCaja, MovimientoCaja, updateMovimiento, UpdateMovimientoData, getCajaStats, CajaStats } from "../../../components/services/cajaService";
import MovimientosTable from "../../../components/catalogos/MovimientosTable";
import MovimientosForm from "../../../components/catalogos/MovimientosForm";

const TIPO_MOVIMIENTO_FILTRO = [
  { label: "Filtrar por: Todos los Tipos", value: "" },
  { label: "Ingresos", value: "INGRESO" },
  { label: "Egresos", value: "EGRESO" },
  { label: "Gastos", value: "GASTO" },
  { label: "Ingresos por Ventas", value: "Ingreso por Venta" },
  { label: "Ingresos por Abonos", value: "Ingresos por Abonos" },
  { label: "Egresos por Compras", value: "Egreso por Compra" },
];

// -------------------- COMPONENTE PRINCIPAL --------------------
export default function CajaPage() {
  // Estados visuales y filtros manuales
  const [formError, setFormError] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [tipoMovimientoFiltro, setTipoMovimientoFiltro] = React.useState<string>("");
  const [allMovements, setAllMovements] = React.useState<MovimientoCaja[]>([]);

  // Estado para el total filtrado
  const [totalFilteredAmount, setTotalFilteredAmount] = React.useState(0);
  const [viewingItem, setViewingItem] = React.useState<MovimientoCaja | null>(null);
  const [purchaseDetails, setPurchaseDetails] = React.useState<Compra | null>(null);
  const [saleDetails, setSaleDetails] = React.useState<Venta | null>(null);
  const [loadingDetails, setLoadingDetails] = React.useState(false);

  React.useEffect(() => {
    if (viewingItem) {
      setPurchaseDetails(null);
      setSaleDetails(null);

      // 1. Try to extract Purchase ID (Explicit or Regex)
      let compraId = viewingItem.compraId;
      if (!compraId) {
        const matchCompra = viewingItem.concepto?.match(/Compra (?:ID|Ref): (\d+)/i);
        if (matchCompra && matchCompra[1]) compraId = Number(matchCompra[1]);
      }

      if (compraId) {
        setLoadingDetails(true);
        getCompraById(compraId)
          .then(data => setPurchaseDetails(data))
          .catch(err => console.error("Error fetching compra details:", err))
          .finally(() => setLoadingDetails(false));
        return;
      }

      // 2. Try to extract Sale ID (Explicit or Regex)
      let ventaId = viewingItem.ventaId;
      if (!ventaId) {
        // Regex for "Venta ID:", "Venta Factura #", "Venta registrada ID:"
        const matchVenta = viewingItem.concepto?.match(/Venta (?:registrada )?(?:ID|Factura)(?: #|:)?\s*(\d+)/i);
        if (matchVenta && matchVenta[1]) ventaId = Number(matchVenta[1]);
      }

      if (ventaId) {
        setLoadingDetails(true);
        getVentaById(ventaId)
          .then(data => setSaleDetails(data))
          .catch(err => console.error("Error fetching venta details:", err))
          .finally(() => setLoadingDetails(false));
        return;
      }
    }
  }, [viewingItem]);

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
          const response = await getMovimientosCaja(page, size, tipoFiltro, searchTerm);

          // Calcular suma total de los items traídos (filtrados)
          // Nota: Esto asume que el backend devuelve todos los items filtrados (sin paginación real)
          // O devuelve la página actual. Si fuera paginado real, necesitaríamos que el backend devuelva el 'sum'.
          // Dado que backend 'findAll' usa 'getMany' sin limit, devuelve todo.
          const sum = response.data.reduce((acc, item) => acc + Number(item.monto), 0);
          setTotalFilteredAmount(sum);

          return response;
        } catch (err: any) {
          console.error('[CajaPage.loadItems] Error cargando movimientos:', err);
          return { data: [], total: 0 };
        }
      },
      createItem: createMovimiento,
      updateItem: (id: number, data: UpdateMovimientoData) => updateMovimiento(id, data),
      deleteItem: deleteMovimiento,
    },
    "Movimiento de Caja",
    // Pasamos el filtro de tipo de movimiento como dependencia custom
    { customDependencies: [tipoMovimientoFiltro] }
  );

  const editingMovimiento = editingItem as MovimientoCaja | null;

  // Estado para los stats reales
  const [stats, setStats] = React.useState<CajaStats>({ saldoActual: 0, totalIngresosHoy: 0, totalEgresosHoy: 0 });

  // Función para cargar stats
  const fetchStats = async () => {
    try {
      const data = await getCajaStats();
      setStats(data);
    } catch (error) {
      console.error("Error al cargar las estadísticas de caja:", error);
      // Opcional: mostrar un mensaje de error al usuario
    }
  };

  // Cargar stats al inicio y cuando cambie la lista (totalItems es un buen trigger indirecto)
  // Cargar stats y movimientos completos
  React.useEffect(() => {
    fetchStats();
    loadAllMovements();
  }, [totalItems]);

  // Cargar todos los movimientos para filtros
  const loadAllMovements = React.useCallback(async () => {
    try {
      const resp = await getMovimientosCaja(1, 10000, tipoMovimientoFiltro, searchTerm);
      setAllMovements(resp.data || []);
    } catch {
      setAllMovements([]);
    }
  }, [tipoMovimientoFiltro, searchTerm]);

  React.useEffect(() => {
    loadAllMovements();
  }, [loadAllMovements, notification]);

  // Handlers para la lógica de stats (actualizar después de guardar/borrar)
  const handleFormSubmitWithStats = async (data: CreateMovimientoData | UpdateMovimientoData) => {
    setFormError("");
    try {
      await handleFormSubmit(data);
      // Recargar stats
      fetchStats();
      handleCloseModal();
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
    fetchStats();
  };

  // Handler para el filtro de tipo de movimiento
  const handleTipoFilterChange = (value: string) => {
    console.log('[Filtro Tipo] Valor seleccionado:', value);
    setTipoMovimientoFiltro(value);
    handlePageChange(1); // Resetear a la primera página cuando el filtro cambia
  };

  // Utilidad para formatear moneda
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportExcel = async () => {
    try {
      // 1. Fetch all data with current filters
      // Backend returns all data (not paginated), so we can just call the service.
      const response = await getMovimientosCaja(1, 10000, tipoMovimientoFiltro, searchTerm);
      const dataToExport = response.data.map(item => ({
        ID: item.id,
        FECHA: item.fecha, // Already formatted string or date? Backend sends YYYY-MM-DD usually
        TIPO: item.tipoMovimiento?.nombre || 'N/A',
        CONCEPTO: item.concepto,
        MONTO: item.monto,
        // Add more fields if needed
      }));

      // 2. Export
      const { exportToExcel } = await import('../../../utils/exportUtils');
      exportToExcel(dataToExport, `Movimientos_Caja_${new Date().toISOString().split('T')[0]}`);

    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setNotification({ type: 'error', message: 'Error al exportar a Excel' });
    }
  };

  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    if (!window.confirm("¿Deseas sincronizar historial de Compras y Ventas con Caja? Esto creará movimientos faltantes.")) return;

    setIsSyncing(true);
    try {

      const resCompras = await syncCajaCompras();
      const resVentas = await syncCajaVentas();

      const createdTotal = (resCompras.created_movements || 0) + (resVentas.created_movements || 0);

      setNotification({
        type: 'success',
        message: `Sincronización completada. Se crearon ${createdTotal} movimientos faltantes.`
      });

      fetchStats();
      loadAllMovements();
    } catch (error) {
      console.error("Sync error:", error);
      setNotification({ type: 'error', message: 'Error al sincronizar datos.' });
    } finally {
      setIsSyncing(false);
    }
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
                Ingreso de Ingresos, Egresos y Gastos diarios
              </p>
            </div>

            <div className="flex gap-2">
              <ActionButton
                icon={isSyncing ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>}
                label={isSyncing ? "Sincronizando..." : "Sincronizar"}
                onClick={handleSync}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSyncing}
              />
              <ActionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-spreadsheet"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M8 13h2" /><path d="M8 17h2" /><path d="M14 13h2" /><path d="M14 17h2" /></svg>}
                label="Exportar Excel"
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white"
              />
              <ActionButton
                icon={<svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>}
                label="Nuevo Movimiento"
                onClick={handleAdd}
                color="primary"
              />
            </div>
          </div>

          {/* BUSCADOR Y FILTROS + TOTAL FILTRADO */}
          <div className="w-full mb-6 flex flex-col md:flex-row md:items-end gap-4 justify-between">
            <div className="flex-1">
              <FilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Buscar por descripción o concepto..."

                selectOptions={TIPO_MOVIMIENTO_FILTRO}
                selectFilterValue={tipoMovimientoFiltro}
                onSelectFilterChange={handleTipoFilterChange}
              />
            </div>
            {/* Mostrar Total Filtrado si hay filtro o incluso si no (Total general en pantalla) */}
            <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg flex flex-col items-end min-w-[200px]">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                Total {tipoMovimientoFiltro ? `(Filtrado)` : `(Listado)`}
              </span>
              <span className="text-xl font-bold text-gray-800">
                {formatMoney(totalFilteredAmount)}
              </span>
            </div>
          </div>

          {/* TABLA DE MOVIMIENTOS */}
          <MovimientosTable
            data={currentItems as MovimientoCaja[]}
            allData={allMovements}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDeleteWithStats}
            onView={(item) => setViewingItem(item)}
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

        {/* MODAL EDITAR/CREAR */}
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
              formError={formError || undefined}
            />
            {formError && (
              <div className="text-red-600 text-sm mt-2 text-center">{formError}</div>
            )}
          </ModalVentana>
        )}

        {/* MODAL VER DETALLES */}
        {viewingItem && (
          <ModalVentana
            isOpen={!!viewingItem}
            onClose={() => setViewingItem(null)}
            title={`Detalles Movimiento #${viewingItem.id}`}
          >
            <div className="space-y-4 text-sm text-gray-800">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
                <div>
                  <span className="font-bold block text-gray-500">Fecha:</span>
                  {viewingItem.fecha ? new Date(viewingItem.fecha).toLocaleDateString() : "-"}
                </div>
                <div>
                  <span className="font-bold block text-gray-500">Tipo:</span>
                  {viewingItem.tipoMovimiento?.nombre || "-"}
                </div>
                <div>
                  <span className="font-bold block text-gray-500">Monto:</span>
                  <span className="text-xl font-bold text-gray-800">{formatMoney(Number(viewingItem.monto))}</span>
                </div>
              </div>

              <div className="border rounded-md p-4 bg-white max-h-[300px] overflow-y-auto">
                <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">Descripción / Concepto</h4>

                {loadingDetails ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mb-2"></div>
                    <p>Cargando detalles...</p>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    {(() => {
                      // A. RENDER COMPRA DETAILS
                      if (purchaseDetails && purchaseDetails.detalles?.length > 0) {
                        return (
                          <div>
                            <p className="font-bold text-gray-700 mb-3 bg-gray-100 p-2 rounded">
                              Lista de Productos ({purchaseDetails.detalles.length} referencias)
                            </p>
                            <div className="flex flex-col gap-3">
                              {purchaseDetails.detalles.map((det: any, idx) => (
                                <div key={idx} className="flex flex-col border-b border-gray-100 pb-2 last:border-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 pr-2">
                                      <span className="font-mono font-bold text-indigo-700 mr-2 text-xs border border-indigo-200 px-1 rounded bg-indigo-50">
                                        {det.producto?.codigo || 'COD?'}
                                      </span>
                                      <span className="text-gray-800 font-medium">
                                        {det.producto?.nombre}
                                      </span>
                                    </div>
                                    <span className="shrink-0 bg-gray-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                      x{det.cantidad}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // B. RENDER VENTA DETAILS
                      if (saleDetails && saleDetails.detalles && saleDetails.detalles.length > 0) {
                        return (
                          <div>
                            <p className="font-bold text-gray-700 mb-3 bg-gray-100 p-2 rounded">
                              Lista de Productos Vendidos ({saleDetails.detalles.length} referencias)
                            </p>
                            <div className="flex flex-col gap-3">
                              {saleDetails.detalles.map((det: any, idx) => (
                                <div key={idx} className="flex flex-col border-b border-gray-100 pb-2 last:border-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 pr-2">
                                      <span className="font-mono font-bold text-emerald-700 mr-2 text-xs border border-emerald-200 px-1 rounded bg-emerald-50">
                                        {det.producto?.codigo || 'COD?'}
                                      </span>
                                      <span className="text-gray-800 font-medium">
                                        {det.producto?.nombre}
                                      </span>
                                    </div>
                                    <span className="shrink-0 bg-gray-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                      x{det.cantidad}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // C. FALLBACKS (Text Parsing)
                      const concepto = viewingItem.concepto || "Sin descripción";

                      // Legacy Compra
                      const matchCompra = concepto.match(/^Compra (?:ID|Ref): \d+\s*-\s*Productos:\s*(.*)/i);
                      if (matchCompra) {
                        const productosStr = matchCompra[1];
                        const productos = productosStr.split(',').map(p => p.trim()).filter(Boolean);
                        return (
                          <div>
                            <p className="font-bold text-gray-700 mb-3 bg-gray-100 p-2 rounded">Lista de Productos (Texto)</p>
                            <div className="flex flex-col gap-3">
                              {productos.map((prod, idx) => {
                                const qtyMatch = prod.match(/\(Cant:\s*(\d+)\)/);
                                const qty = qtyMatch ? qtyMatch[1] : "?";
                                const cleanName = prod.replace(/\(Cant:\s*\d+\)/, '').trim();
                                return (
                                  <div key={idx} className="flex flex-col border-b border-gray-100 pb-2 last:border-0">
                                    <div className="flex items-start justify-between">
                                      <div className="text-gray-800">{cleanName}</div>
                                      <span className="shrink-0 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-bold ml-2">Cant: {qty}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }

                      // Legacy Venta (Text only fallback)
                      return <div className="whitespace-pre-wrap">{concepto}</div>;
                    })()}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingItem(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
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
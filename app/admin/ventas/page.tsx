"use client";

import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";

// UI
import ActionButton from "../../../components/common/ActionButton";
import Paginator from "../../../components/common/Paginator";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import SearchInput from "../../../components/common/form/SearchInput";
import FormSelect from "../../../components/common/form/FormSelect";

import { FilePlus2, ShoppingCart, DollarSign, TrendingUp, FileSpreadsheet } from "lucide-react";
import CardStat from "../../../components/ui/CardStat";
import { formatCurrency } from "../../../utils/formatters";

// Tabla y Form
import VentasTable from "../../../components/catalogos/VentasTable";
import VentasForm from "../../../components/catalogos/VentasForm";

// Hook CRUD
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";

// Servicios
import {
  getVentas,
  createVenta,
  updateVenta,
  deleteVenta,
  Venta,
  CreateVentaDTO,
  UpdateVentaDTO,
} from "../../../components/services/ventasService";

export default function VentasPage() {
  const [formError, setFormError] = useState("");

  const [monthsOptions, setMonthsOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [yearOptions, setYearOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [monthsGrouped, setMonthsGrouped] = useState<
    Record<string, { value: string; label: string }[]>
  >({});

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [totalVentasAll, setTotalVentasAll] = useState<number>(0);
  const [totalUtilidadAll, setTotalUtilidadAll] = useState<number>(0);

  const [viewingItem, setViewingItem] = useState<Venta | null>(null);

  const handleView = (venta: Venta) => {
    setViewingItem(venta);
  };

  const handleCloseView = () => {
    setViewingItem(null);
  };

  // ===================== CRUD HOOK ======================
  const {
    currentItems,
    totalItems,
    loading,
    searchTerm,
    currentPage,
    pageSize,
    showModal,
    editingItem,
    notification,

    setSearchTerm,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCloseModal,
    handleFormSubmit,
    handlePageChange,
    handlePageSizeChange,
    setNotification,
  } = useCrudCatalog<Venta, CreateVentaDTO, UpdateVentaDTO>(
    {
      loadItems: async (
        all,
        page,
        size,
        searchTermParam,
        selectedYearParam,
        selectedMonthParam
      ) => {
        if (selectedMonthParam) {
          const resp = await getVentas(
            1,
            Math.max(1000, page * size),
            searchTermParam
          );
          let items: any[] = Array.isArray(resp) ? resp : resp?.data ?? [];

          const filtered = items.filter((it: any) => {
            if (!it?.fecha) return false;
            const d = new Date(it.fecha);
            const ym = `${d.getFullYear()}-${String(
              d.getMonth() + 1
            ).padStart(2, "0")}`;
            return ym === String(selectedMonthParam);
          });

          // Ordenar por fecha descendente (más recientes primero)
          filtered.sort((a: any, b: any) => {
            const dateA = new Date(a.fecha || 0).getTime();
            const dateB = new Date(b.fecha || 0).getTime();
            return dateB - dateA;
          });

          const total = filtered.length;
          const start = (page - 1) * size;
          const pageItems = filtered.slice(start, start + size);
          return { data: pageItems, total };
        }

        if (selectedYearParam) {
          const resp = await getVentas(
            1,
            Math.max(1000, page * size),
            searchTermParam
          );
          let items: any[] = Array.isArray(resp) ? resp : resp?.data ?? [];

          const filtered = items.filter((it: any) => {
            if (!it?.fecha) return false;
            const d = new Date(it.fecha);
            return `${d.getFullYear()}` === String(selectedYearParam);
          });

          // Ordenar por fecha descendente (más recientes primero)
          filtered.sort((a: any, b: any) => {
            const dateA = new Date(a.fecha || 0).getTime();
            const dateB = new Date(b.fecha || 0).getTime();
            return dateB - dateA;
          });

          const total = filtered.length;
          const start = (page - 1) * size;
          const pageItems = filtered.slice(start, start + size);
          return { data: pageItems, total };
        }

        // Sin filtros: obtener y ordenar por fecha descendente
        const resp = await getVentas(page, size, searchTermParam);
        const items = Array.isArray(resp) ? resp : resp?.data ?? [];

        // Ordenar por fecha descendente
        items.sort((a: any, b: any) => {
          const dateA = new Date(a.fecha || 0).getTime();
          const dateB = new Date(b.fecha || 0).getTime();
          return dateB - dateA;
        });

        return Array.isArray(resp) ? items : { ...resp, data: items };
      },
      createItem: createVenta,
      updateItem: updateVenta,
      deleteItem: deleteVenta,
    },
    "Venta",
    { customDependencies: [selectedYear, selectedMonth] }
  );

  const editingVenta = editingItem as Venta | null;

  // Recalcula totales agregados (ventas y utilidad) sobre todos los items filtrados
  const recalculateTotalsAll = React.useCallback(async () => {
    try {
      const resp = await getVentas(1, 10000, searchTerm || "");
      const items: any[] = Array.isArray(resp) ? resp : resp?.data ?? [];

      let filtered = items;
      if (selectedMonth) {
        filtered = items.filter((it: any) => {
          if (!it?.fecha) return false;
          const d = new Date(it.fecha);
          const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          return ym === String(selectedMonth);
        });
      } else if (selectedYear) {
        filtered = items.filter((it: any) => {
          if (!it?.fecha) return false;
          const d = new Date(it.fecha);
          return `${d.getFullYear()}` === String(selectedYear);
        });
      }

      const totalVentas = filtered.reduce((sum: number, it: any) => {
        return sum + Number(it?.total ?? 0);
      }, 0);

      const totalUtilidad = filtered.reduce((sum: number, it: any) => {
        const detalles = it.detalles || [];
        const utilidadVenta = detalles.reduce((u: number, d: any) => {
          const precioVenta = Number(d.precio_venta ?? 0);
          const costoUnit = Number(d.producto?.costo ?? d.producto?.costo_promedio ?? 0);
          const cantidad = Number(d.cantidad ?? 0);
          return u + (precioVenta - costoUnit) * cantidad;
        }, 0);
        return sum + utilidadVenta;
      }, 0);

      setTotalVentasAll(totalVentas);
      setTotalUtilidadAll(totalUtilidad);
    } catch (err) {
      setTotalVentasAll(0);
      setTotalUtilidadAll(0);
    }
  }, [searchTerm, selectedMonth, selectedYear]);

  // ===================== ERROR HANDLER =====================
  const handleSubmitWithError = async (data: any) => {
    setFormError("");
    try {
      await handleFormSubmit(data);
      // Forzar recálculo de totales después de crear/actualizar venta
      await recalculateTotalsAll();
      // Cerrar el modal automáticamente después de guardar o actualizar
      handleCloseModal();
    } catch (err: any) {
      const remote = err?.response?.data;
      let msg: string;

      if (remote) {
        if (Array.isArray(remote.message)) msg = remote.message.join(". ");
        else msg = remote.message || "Error al guardar.";
      } else msg = err?.message || "Error desconocido.";

      setFormError(msg);
    }
  };

  // ================== CARGA DE MESES/AÑOS ==================
  useEffect(() => {
    const reload = async () => {
      try {
        const resp = await getVentas(1, 1000, "");
        const items: any[] = Array.isArray(resp) ? resp : resp?.data ?? [];

        const grouped: Record<string, any[]> = {};
        const years = new Set<string>();

        items.forEach((it) => {
          if (!it?.fecha) return;

          const d = new Date(it.fecha);
          const y = `${d.getFullYear()}`;
          const ym = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;
          const label = d.toLocaleString("es-CO", { month: "long" });

          years.add(y);

          if (!grouped[y]) grouped[y] = [];
          if (!grouped[y].some((m) => m.value === ym))
            grouped[y].push({ value: ym, label });
        });

        const yearOpts = Array.from(years).map((y) => ({ value: y, label: y }));
        yearOpts.sort((a, b) => (a.value < b.value ? 1 : -1));
        Object.keys(grouped).forEach((y) =>
          grouped[y].sort((a, b) => (a.value < b.value ? 1 : -1))
        );

        setMonthsGrouped(grouped);
        setYearOptions(yearOpts);
      } catch { }
    };

    reload();
  }, [notification]);

  // recalcular totales cuando cambian filtros o hay notificaciones
  useEffect(() => {
    recalculateTotalsAll();
  }, [recalculateTotalsAll, notification]);

  useEffect(() => {
    const months = monthsGrouped[selectedYear] ?? [];
    setMonthsOptions(months);
    setSelectedMonth("");
  }, [selectedYear, monthsGrouped]);

  const handleExportExcel = async () => {
    try {
      // 1. Fetch filtered data (simulating specific backend filters via JS)
      const resp = await getVentas(1, 10000, searchTerm || "");
      let items: any[] = Array.isArray(resp) ? resp : resp?.data ?? [];

      // Filter by Month
      if (selectedMonth) {
        items = items.filter((it: any) => {
          if (!it?.fecha) return false;
          const d = new Date(it.fecha);
          const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          return ym === String(selectedMonth);
        });
      }
      // Filter by Year
      else if (selectedYear) {
        items = items.filter((it: any) => {
          if (!it?.fecha) return false;
          const d = new Date(it.fecha);
          return `${d.getFullYear()}` === String(selectedYear);
        });
      }

      // 2. Map data
      const dataToExport = items.map(it => {
        const cantidad = Number(it.cantidad);
        const precioVenta = Number(it.precio_venta);
        const costoUnit = Number(it.costo_unitario);

        const totalVenta = Number(it.total_venta ?? (cantidad * precioVenta));

        let utilidad = Number(it.utilidad);
        if (isNaN(utilidad)) {
          utilidad = (precioVenta - costoUnit) * cantidad;
        }

        return {
          ID: it.id,
          FECHA: it.fecha,
          CODIGO: it.producto?.codigo || 'SN',
          PRODUCTO: it.producto?.nombre || 'Producto Desconocido',
          CATEGORIA: it.producto?.categoria?.nombre || 'General',
          CANTIDAD: cantidad,
          COSTO_UNITARIO: costoUnit,
          PRECIO_VENTA: precioVenta,
          TOTAL_VENTA: totalVenta,
          UTILIDAD: utilidad
        };
      });

      // 3. Export
      const { exportToExcel } = await import('../../../utils/exportUtils');
      exportToExcel(dataToExport, `Ventas_${new Date().toISOString().split('T')[0]}`);

    } catch (error) {
      console.error("Error exporting sales:", error);
      setNotification({ type: 'error', message: "Error al exportar a Excel" });
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="w-full md:w-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CardStat
            title="Total Ventas"
            value={formatCurrency(totalVentasAll, "$")}
            icon={<DollarSign className="w-4 h-4" />}
            color="text-green-600"
          />

          <CardStat
            title="Utilidad"
            value={formatCurrency(totalUtilidadAll, "$")}
            icon={<TrendingUp className="w-4 h-4" />}
            color="text-yellow-600"
          />
        </div>
      </div>
      <div className="space-y-6">
        {/* =================== HEADER =================== */}


        {/* =================== TABLA & CONTROLES =================== */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-green-600" />
                Registro de Ventas
              </h1>
              <p className="text-gray-600 mt-2">
                Administra y controla todas las ventas realizadas a clientes.
              </p>



            </div>
          </div>

          <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              {/* Buscador */}
              <div className="flex-1 min-w-[250px] max-w-sm">
                <SearchInput
                  searchTerm={searchTerm}
                  placeholder="Buscar por cliente..."
                  onSearchChange={setSearchTerm}
                />
              </div>

              {/* Año */}
              <div className="min-w-[140px]">
                <FormSelect
                  label="Año"
                  name="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  options={yearOptions}
                  placeholder="Todos"
                />
              </div>

              {/* Mes */}
              <div className="min-w-[180px]">
                <FormSelect
                  label="Mes"
                  name="month"
                  value={selectedMonth}
                  disabled={!selectedYear}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  options={monthsOptions}
                  placeholder="Todos los meses"
                />
              </div>
            </div>

            {/* BTN Nueva Venta y Exportar (Alineados) */}
            <div className="flex gap-2">
              <ActionButton
                icon={<FileSpreadsheet className="h-5 w-5" />}
                label="Exportar Excel"
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white"
              />
              <ActionButton
                icon={<FilePlus2 className="h-5 w-5" />}
                label="Nueva Venta"
                onClick={handleAdd}
              />
            </div>
          </div>

          <VentasTable
            data={currentItems || []}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />

          {/* ... existing code ... */}

          {/* =================== MODAL DETALLES =================== */}
          {viewingItem && (
            <ModalVentana
              isOpen={!!viewingItem}
              onClose={handleCloseView}
              title={`Detalles de Venta #${viewingItem.id}`}
            >
              <div className="space-y-4 text-sm text-gray-800">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
                  <div>
                    <span className="font-bold block text-gray-500">Fecha:</span>
                    {viewingItem.fecha ? new Date(viewingItem.fecha).toLocaleDateString() : "-"}
                  </div>
                  <div>
                    <span className="font-bold block text-gray-500">Cliente:</span>
                    {viewingItem.cliente?.nombre || "Cliente General"}
                  </div>
                  <div>
                    <span className="font-bold block text-gray-500">N° Venta:</span>
                    #{viewingItem.id}
                  </div>
                  <div>
                    <span className="font-bold block text-gray-500">Total:</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(viewingItem.total)}</span>
                  </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-left bg-white">
                    <thead className="bg-gray-100 text-gray-600 font-semibold border-b">
                      <tr>
                        <th className="p-2">Código</th>
                        <th className="p-2">Producto</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-right">Precio U.</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {viewingItem.detalles?.map((det: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2 text-gray-500 font-mono text-xs">{det.producto?.codigo || "-"}</td>
                          <td className="p-2">{det.producto?.nombre || "Producto Desconocido"}</td>
                          <td className="p-2 text-center">{det.cantidad}</td>
                          <td className="p-2 text-right">{formatCurrency(det.precio_venta)}</td>
                          <td className="p-2 text-right">{formatCurrency(det.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCloseView}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow transition"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </ModalVentana>
          )}

          {/* PAGINADOR */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Mostrando {currentItems.length} de {totalItems} ventas
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

        {/* =================== MODAL =================== */}
        {showModal && (
          <ModalVentana
            isOpen={showModal}
            onClose={handleCloseModal}
            title={editingVenta ? "Editar Venta" : "Registrar Venta"}
          >
            <VentasForm
              initialData={editingVenta}
              onSubmit={handleSubmitWithError}
              onSuccess={handleCloseModal}
              onCancel={handleCloseModal}
              formError={formError}
            />
          </ModalVentana>
        )}

        {/* =================== ALERTAS =================== */}
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

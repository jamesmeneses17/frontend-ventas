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

import { FilePlus2, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
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

          const total = filtered.length;
          const start = (page - 1) * size;
          const pageItems = filtered.slice(start, start + size);
          return { data: pageItems, total };
        }

        return await getVentas(page, size, searchTermParam);
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
        // asumir que 'total_venta' está en el objeto o calcular como cantidad * precio_venta
        const totalField = Number(it?.total_venta ?? (Number(it?.cantidad ?? 0) * Number(it?.precio_venta ?? 0)));
        return sum + (isNaN(totalField) ? 0 : totalField);
      }, 0);

      const totalUtilidad = filtered.reduce((sum: number, it: any) => {
        // asumir que 'utilidad' campo existe; si no, intentar calcular: (precio_venta - costo_unitario) * cantidad
        const utilidadField = Number(it?.utilidad ?? NaN);
        if (!isNaN(utilidadField)) return sum + utilidadField;
        const precioVenta = Number(it?.precio_venta ?? 0);
        const costoUnit = Number(it?.costo_unitario ?? 0);
        const cantidad = Number(it?.cantidad ?? 0);
        return sum + (precioVenta - costoUnit) * cantidad;
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
      } catch {}
    };

    reload();
  }, [notification]);

  // recalcular totales cuando cambian filtros o hay notificaciones
  useEffect(() => {
    recalculateTotalsAll();
  }, [recalculateTotalsAll, notification]);

  useEffect(() => {
    if (!selectedYear) {
      setMonthsOptions([]);
      return;
    }
    const months = monthsGrouped[selectedYear] ?? [];
    setMonthsOptions(months);
    setSelectedMonth("");
  }, [selectedYear, monthsGrouped]);

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

            {/* BTN Nueva Venta */}
            <ActionButton
              icon={<FilePlus2 className="h-5 w-5" />}
              label="Nueva Venta"
              onClick={handleAdd}
            />
          </div>

          <VentasTable
            data={currentItems || []}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

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

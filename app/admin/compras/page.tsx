"use client";

import React, { useEffect, useState, useMemo } from "react";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";

// UI generales
import ActionButton from "../../../components/common/ActionButton";
import Paginator from "../../../components/common/Paginator";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import SearchInput from "../../../components/common/form/SearchInput";
import FormSelect from "../../../components/common/form/FormSelect";

import { FilePlus2, FileSpreadsheet } from "lucide-react";

// Tabla y Form
import ComprasTable from "../../../components/catalogos/ComprasTable";
import ComprasForm from "../../../components/catalogos/ComprasForm";

// Hook CRUD
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";

// Servicios
import {
  getCompras,
  createCompra,
  updateCompra,
  deleteCompra,
  Compra,
  CreateCompraDTO,
  UpdateCompraDTO,
} from "../../../components/services/comprasService";
import { formatCurrency } from "../../../utils/formatters";
import CardStat from "../../../components/ui/CardStat";

export default function ComprasPage() {
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
  const [totalComprasAll, setTotalComprasAll] = useState<number>(0);

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
  } = useCrudCatalog<Compra, CreateCompraDTO, UpdateCompraDTO>(
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
          const resp = await getCompras(
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
          const resp = await getCompras(
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

        return await getCompras(page, size, searchTermParam);
      },
      createItem: createCompra,
      updateItem: updateCompra,
      deleteItem: deleteCompra,
    },
    "Compra",
    { customDependencies: [selectedYear, selectedMonth] }
  );

  const editingCompra = editingItem as Compra | null;

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
        const resp = await getCompras(1, 1000, "");
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

  // Recalcular total agregado de todas las compras filtradas (no sólo la página)
  const recalculateTotalAll = React.useCallback(async () => {
    try {
      const resp = await getCompras(1, 10000, searchTerm || "");
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

      const total = filtered.reduce((sum: number, it: any) => {
        const cantidad = Number(it?.cantidad ?? 0);
        const costo = Number(it?.costo_unitario ?? 0);
        return sum + cantidad * costo;
      }, 0);

      setTotalComprasAll(total);
    } catch (err) {
      setTotalComprasAll(0);
    }
  }, [searchTerm, selectedMonth, selectedYear]);

  useEffect(() => {
    recalculateTotalAll();
  }, [recalculateTotalAll, notification]);

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
      <div className="space-y-6">
        {/* =================== HEADER (Sin el botón "Nueva Compra") =================== */}
          {/* Tarjeta resumen: Total acumulado de todas las compras filtradas */}
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CardStat
                title="Total Compras"
                value={formatCurrency(totalComprasAll)}
                color="text-emerald-600"
                icon={<FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
              />
            </div>
          </div>
        

        {/* =================== TABLA Y CONTROLES =================== */}
        <div className="bg-white shadow rounded-lg p-6">
          
          {/* Header de la tabla con título */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
                Registro de Compras
              </h1>
              <p className="text-gray-600 mt-2">
                Administra y controla el historial de compras a proveedores.
              </p>
            </div>
            {/* El botón ActionButton fue movido a la sección de la tabla */}
          </div>

        

          {/* CONTROLES: Buscador, Selectores y Botón "Nueva Compra" */}
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
            
            {/* Grupo de Buscador y Selectores (para que se mantengan juntos a la izquierda) */}
            <div className="flex flex-wrap items-end gap-4">
                
                {/* 1. Buscador por Proveedor */}
                <div className="flex-1 min-w-[250px] max-w-sm">
                  <SearchInput
                    searchTerm={searchTerm}
                    placeholder="Buscar por proveedor..."
                    onSearchChange={setSearchTerm}
                  />
                </div>

                {/* 2. Año */}
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

                {/* 3. Mes */}
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

            {/* Botón "Nueva Compra" alineado a la derecha */}
            <ActionButton
              icon={<FilePlus2 className="h-5 w-5" />}
              label="Nueva Compra"
              onClick={handleAdd}
            />
          </div>
          {/* FIN DE CONTROLES */}
          
          <ComprasTable
            data={currentItems || []}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* PAGINADOR */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Mostrando {currentItems.length} de {totalItems} compras
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
            title={editingCompra ? "Editar Compra" : "Registrar Compra"}
          >
            <ComprasForm
              initialData={editingCompra}
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
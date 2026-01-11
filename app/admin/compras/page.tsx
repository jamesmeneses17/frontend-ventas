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
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  // Estado para visualización de detalles
  const [viewingItem, setViewingItem] = useState<Compra | null>(null);

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
        ...customParams
      ) => {
        const selectedYearParam = customParams[0];
        const selectedMonthParam = customParams[1];
        const actualSearchTerm = customParams[2] || "";

        const searchLower = (actualSearchTerm || "").toLowerCase();
        console.log("[ComprasPage] loadItems llamado:", {
          page,
          size,
          searchTermParam,
          actualSearchTerm,
          searchLower,
          selectedYearParam,
          selectedMonthParam,
          customParams,
        });

        if (selectedMonthParam) {
          const resp = await getCompras(
            1,
            Math.max(1000, page * size),
            ""
          );
          let items: any[] = Array.isArray(resp) ? resp : resp?.data ?? [];
          console.log("[ComprasPage] Items del backend (mes):", items.length, items);

          let filtered = items.filter((it: any) => {
            if (!it?.fecha) return false;
            const d = new Date(it.fecha);
            const ym = `${d.getFullYear()}-${String(
              d.getMonth() + 1
            ).padStart(2, "0")}`;
            return ym === String(selectedMonthParam);
          });
          console.log("[ComprasPage] Después filtro mes:", filtered.length);

          // Filtrar por búsqueda si existe
          if (searchLower) {
            filtered = filtered.filter((it: any) => {
              const codigo = (it?.producto?.codigo || "").toLowerCase();
              const nombre = (it?.producto?.nombre || "").toLowerCase();
              const match = codigo.includes(searchLower) || nombre.includes(searchLower);
              console.log("[ComprasPage] Comparando búsqueda:", {
                codigo,
                nombre,
                searchLower,
                match,
              });
              return match;
            });
            console.log("[ComprasPage] Después filtro búsqueda:", filtered.length);
          }

          const total = filtered.length;
          const start = (page - 1) * size;
          const pageItems = filtered.slice(start, start + size);
          console.log("[ComprasPage] Resultado final (mes):", {
            total,
            pageItemsLength: pageItems.length,
            pageItems,
          });
          return { data: pageItems, total };
        }

        if (selectedYearParam) {
          const resp = await getCompras(
            1,
            Math.max(1000, page * size),
            ""
          );
          let items: any[] = Array.isArray(resp) ? resp : resp?.data ?? [];
          console.log("[ComprasPage] Items del backend (año):", items.length);

          let filtered = items.filter((it: any) => {
            if (!it?.fecha) return false;
            const d = new Date(it.fecha);
            return `${d.getFullYear()}` === String(selectedYearParam);
          });
          console.log("[ComprasPage] Después filtro año:", filtered.length);

          // Filtrar por búsqueda si existe
          if (searchLower) {
            filtered = filtered.filter((it: any) => {
              const codigo = (it?.producto?.codigo || "").toLowerCase();
              const nombre = (it?.producto?.nombre || "").toLowerCase();
              const match = codigo.includes(searchLower) || nombre.includes(searchLower);
              console.log("[ComprasPage] Comparando búsqueda:", {
                codigo,
                nombre,
                searchLower,
                match,
              });
              return match;
            });
            console.log("[ComprasPage] Después filtro búsqueda:", filtered.length);
          }

          const total = filtered.length;
          const start = (page - 1) * size;
          const pageItems = filtered.slice(start, start + size);
          console.log("[ComprasPage] Resultado final (año):", {
            total,
            pageItemsLength: pageItems.length,
          });
          return { data: pageItems, total };
        }

        // Sin filtro de año/mes, solo búsqueda
        const resp = await getCompras(1, Math.max(1000, page * size), "");
        let items: any[] = Array.isArray(resp) ? resp : resp?.data ?? [];
        console.log("[ComprasPage] Items del backend (sin filtro):", items.length);

        if (searchLower) {
          items = items.filter((it: any) => {
            const codigo = (it?.producto?.codigo || "").toLowerCase();
            const nombre = (it?.producto?.nombre || "").toLowerCase();
            const match = codigo.includes(searchLower) || nombre.includes(searchLower);
            console.log("[ComprasPage] Comparando búsqueda:", {
              codigo,
              nombre,
              searchLower,
              match,
            });
            return match;
          });
          console.log("[ComprasPage] Después filtro búsqueda:", items.length);
        }

        const total = items.length;
        const start = (page - 1) * size;
        const pageItems = items.slice(start, start + size);

        return { data: pageItems, total };
      },
      createItem: createCompra,
      updateItem: updateCompra,
      deleteItem: deleteCompra,
    },
    "Compra",
    { customDependencies: [selectedYear, selectedMonth, localSearchTerm] }
  );

  const editingCompra = editingItem as Compra | null;

  const handleView = (compra: Compra) => {
    setViewingItem(compra);
  };

  const handleCloseView = () => {
    setViewingItem(null);
  };

  // ===================== ERROR HANDLER =====================
  const handleSubmitWithError = async (data: any) => {
    setFormError("");
    try {
      await handleFormSubmit(data);
      // Cerrar el modal automáticamente después de éxito
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
      } catch { }
    };

    reload();
  }, [notification]);

  // Recalcular total agregado de todas las compras filtradas (no sólo la página)
  const recalculateTotalAll = React.useCallback(async () => {
    try {
      const resp = await getCompras(1, 10000, localSearchTerm || "");
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
        return sum + Number(it?.total ?? 0);
      }, 0);

      setTotalComprasAll(total);
    } catch (err) {
      setTotalComprasAll(0);
    }
  }, [localSearchTerm, selectedMonth, selectedYear]);

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

  const handleExportExcel = async () => {
    try {
      // 1. Fetch filtered data (simulating specific backend filters via JS if backend doesn't support them fully yet)
      const resp = await getCompras(1, 10000, "");
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

      // Filter by Search
      const searchLower = (localSearchTerm || "").toLowerCase();
      if (searchLower) {
        items = items.filter((it: any) => {
          // Busqueda básica en códigos o nombres dentro de los detalles
          const detalles = it.detalles || [];
          const match = detalles.some((d: any) => {
            const code = (d.producto?.codigo || "").toLowerCase();
            const name = (d.producto?.nombre || "").toLowerCase();
            return code.includes(searchLower) || name.includes(searchLower);
          });
          // También verificar nombre de proveedor/cliente si aplica
          const clienteName = (it.cliente?.nombre || "").toLowerCase();

          return match || clienteName.includes(searchLower);
        });
      }

      // 2. Map data
      const dataToExport = items.map(it => {
        const detalles = it.detalles || [];
        const productosStr = detalles.map((d: any) => d.producto?.nombre || 'Producto').join(", ");
        const codigosStr = detalles.map((d: any) => d.producto?.codigo || 'SN').join(", ");
        const totalItems = detalles.reduce((acc: number, d: any) => acc + Number(d.cantidad), 0);

        return {
          ID: it.id,
          FECHA: it.fecha,
          CODIGOS: codigosStr,
          PRODUCTOS: productosStr,
          PROVEEDOR: it.cliente?.nombre || 'N/A',
          CANTIDAD_TOTAL: totalItems,
          TOTAL_COMPRA: Number(it.total ?? 0)
        };
      });

      // 3. Export
      const { exportToExcel } = await import('../../../utils/exportUtils');
      exportToExcel(dataToExport, `Compras_${new Date().toISOString().split('T')[0]}`);

    } catch (error) {
      console.error("Error exporting purchases:", error);
      setNotification({ type: 'error', message: "Error al exportar a Excel" });
    }
  };

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

              {/* 1. Buscador por Código o Producto */}
              <div className="flex-1 min-w-[250px] max-w-sm">
                <SearchInput
                  searchTerm={localSearchTerm}
                  placeholder="Buscar por código o producto..."
                  onSearchChange={setLocalSearchTerm}
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
            <div className="flex gap-2">
              <ActionButton
                icon={<FileSpreadsheet className="h-5 w-5" />}
                label="Exportar Excel"
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white"
              />
              <ActionButton
                icon={<FilePlus2 className="h-5 w-5" />}
                label="Nueva Compra"
                onClick={handleAdd}
              />
            </div>
          </div>
          {/* FIN DE CONTROLES */}

          <ComprasTable
            data={currentItems || []}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
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

        {/* =================== MODAL DETALLES =================== */}
        {viewingItem && (
          <ModalVentana
            isOpen={!!viewingItem}
            onClose={handleCloseView}
            title={`Detalles de Compra #${viewingItem.id}`}
          >
            <div className="space-y-4 text-sm text-gray-800">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded">
                <div>
                  <span className="font-bold block text-gray-500">Fecha:</span>
                  {viewingItem.fecha ? new Date(viewingItem.fecha).toLocaleDateString() : "-"}
                </div>
                <div>
                  <span className="font-bold block text-gray-500">Proveedor:</span>
                  {viewingItem.cliente?.nombre || "N/A"}
                </div>
                <div>
                  <span className="font-bold block text-gray-500">N° Factura:</span>
                  FAC-{viewingItem.id}
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
                      <th className="p-2 text-right">Costo U.</th>
                      <th className="p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {viewingItem.detalles?.map((det: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2 text-gray-500 font-mono text-xs">{det.producto?.codigo || "-"}</td>
                        <td className="p-2">{det.producto?.nombre || "Producto Desconocido"}</td>
                        <td className="p-2 text-center">{det.cantidad}</td>
                        <td className="p-2 text-right">{formatCurrency(det.costo_unitario)}</td>
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
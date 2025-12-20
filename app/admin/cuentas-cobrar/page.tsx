"use client";

import React, { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import CardStat from "../../../components/ui/CardStat";
import FilterBar from "../../../components/common/FilterBar";
import Paginator from "../../../components/common/Paginator";
import Alert from "../../../components/ui/Alert";
import ActionButton from "../../../components/common/ActionButton";

import PagosCreditoForm from "../../../components/catalogos/PagosCreditoForm";
import CreditosTable from "../../../components/catalogos/CreditosTable";

import {
  getCreditos,
  deleteCredito,
  createCredito,
} from "../../../components/services/creditosService";
import CreditosForm from "../../../components/catalogos/CreditosForm";
import ModalVentana from "../../../components/ui/ModalVentana";

/* ============================
   PAGE
============================ */
export default function CuentasCobrarPage() {
  const [creditos, setCreditos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showPagosModal, setShowPagosModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [selectedCreditoId, setSelectedCreditoId] = useState<number | null>(
    null
  );

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // filtros
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  /* ============================
     LOAD
  ============================ */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getCreditos(page, limit, search);
      setCreditos(resp.data);
      setTotal(resp.total);
    } catch (err) {
      console.error(err);
      setNotification({
        message: "Error cargando cuentas por cobrar",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    load();
  }, [load]);

  /* ============================
     ACTIONS
  ============================ */
  const handleAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const handleEdit = (credito: any) => {
    setEditing(credito);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este crédito?")) return;
    try {
      await deleteCredito(id);
      setNotification({ message: "Crédito eliminado", type: "success" });
      load();
    } catch {
      setNotification({ message: "Error al eliminar", type: "error" });
    }
  };

  const handleOpenPagos = (creditoId: number) => {
    setSelectedCreditoId(creditoId);
    setShowPagosModal(true);
  };

  const totalSaldo = creditos.reduce(
    (sum, c) => sum + Number(c.saldo_pendiente ?? 0),
    0
  );

  /* ============================
     RENDER
  ============================ */
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardStat
            title="Total por Cobrar"
            value={new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
            }).format(totalSaldo)}
            color="text-red-600"
            icon={
              <Image src="/logodisem.jpg" alt="logo" width={20} height={20} />
            }
          />
          <CardStat
            title="Créditos"
            value={String(total)}
            color="text-indigo-600"
            icon={<Plus className="w-4 h-4" />}
          />
          <CardStat
            title="Pendientes"
            value={String(
              creditos.filter((c) => c.estado === "PENDIENTE").length
            )}
            color="text-yellow-600"
            icon={<Plus className="w-4 h-4" />}
          />
        </div>

        {/* MAIN */}
        <div className="bg-white shadow rounded-2xl p-6 border">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">Cuentas por Cobrar</h1>
              <p className="text-gray-600">Gestión de créditos y pagos</p>
            </div>

            <ActionButton
              icon={<Plus className="w-5 h-5" />}
              label="Nuevo Crédito"
              onClick={handleAdd}
              color="primary"
            />
          </div>

          <FilterBar
            searchTerm={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Buscar..."
          />

          <CreditosTable
            data={creditos}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenPagos={handleOpenPagos}
          />

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              {!loading && total > 0
                ? `Mostrando ${creditos.length} de ${total}`
                : loading
                ? "Cargando..."
                : "Sin registros"}
            </p>

            {!loading && total > 0 && (
              <Paginator
                total={total}
                currentPage={page}
                pageSize={limit}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setLimit(s);
                  setPage(1);
                }}
              />
            )}
          </div>
        </div>

        {/* MODAL CRÉDITO */}
        {showModal && (
          <ModalVentana
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={editing ? "Editar Crédito" : "Nuevo Crédito"}
          >
            <CreditosForm
              initialData={editing}
              onCancel={() => setShowModal(false)}
              onSaved={async () => {
                setShowModal(false);
                await load();
                setNotification({
                  message: "Guardado correctamente",
                  type: "success",
                });
              }}
              onSubmit={async (payload) => {
                // ✅ Llama a la función real del servicio
                await createCredito(payload);
              }}
            />
          </ModalVentana>
        )}

        {/* MODAL PAGOS */}
        {showPagosModal && selectedCreditoId && (
          <ModalVentana
            isOpen={showPagosModal}
            onClose={() => setShowPagosModal(false)}
            title="Pagos del Crédito"
          >
            <PagosCreditoForm
              creditoId={selectedCreditoId}
              onClose={() => {
                setShowPagosModal(false);
                load();
              }}
            />
          </ModalVentana>
        )}

        {/* ALERT */}
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

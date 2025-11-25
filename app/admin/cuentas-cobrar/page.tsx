"use client";
import React, { useEffect, useCallback, useState } from "react";
import Image from 'next/image';
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import CardStat from "../../../components/ui/CardStat";
import FilterBar from "../../../components/common/FilterBar";
import Paginator from "../../../components/common/Paginator";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import ActionButton from "../../../components/common/ActionButton";

import { Plus } from "lucide-react";

import CuentasCobrarTable from "../../../components/catalogos/CuentasCobrarTable";
import CuentasCobrarForm from "../../../components/catalogos/CuentasCobrarForm";
import PagosCreditoForm from "../../../components/catalogos/PagosCreditoForm";

import {
  getCreditos,
  deleteCredito,
} from "../../../components/services/cuentasCobrarService";
import { getClientes } from "../../../components/services/clientesServices";

export default function CuentasCobrarPage() {
  const [creditos, setCreditos] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showPagosModal, setShowPagosModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [selectedCreditoId, setSelectedCreditoId] = useState<number | null>(null);

  const [notification, setNotification] = useState<{ message: string; type?: "success"|"error" } | null>(null);

  // pagination & filter
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getCreditos(page, limit, search);
      let items = resp.data || [];
      // Si la API devuelve solo cliente_id, intentamos resolver el nombre del cliente localmente
      if (items.length > 0 && items[0].cliente == null && items[0].cliente_id != null) {
        try {
          const clientesList = await getClientes("", 1, 1000);
          const map = new Map<number, any>();
          (clientesList || []).forEach((c:any) => map.set(Number(c.id), c));
          items = items.map((it:any) => ({ ...it, cliente: map.get(Number(it.cliente_id))?.nombre || null }));
        } catch (err) {
          console.warn("No se pudieron cargar clientes para mapear nombres:", err);
        }
      }

      setCreditos(items);
      setTotal(resp.total ?? items.length ?? 0);
    } catch (err) {
      console.error("[CuentasCobrarPage] load error", err);
      setNotification({ message: "Error cargando cuentas por cobrar", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta cuenta por cobrar?")) return;
    try {
      await deleteCredito(id);
      setNotification({ message: "Crédito eliminado", type: "success" });
      load();
    } catch (err) {
      console.error("delete error", err);
      setNotification({ message: "Error al eliminar", type: "error" });
    }
  };

  const handleOpenPagos = (creditoId: number) => {
    setSelectedCreditoId(creditoId);
    setShowPagosModal(true);
  };

  const totalSaldo = creditos.reduce((s, c) => s + Number(c.saldo_pendiente ?? 0), 0);

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardStat title="Total Cuentas por Cobrar" value={new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(totalSaldo)} color="text-red-600" icon={<Image src="/logodisem.jpg" alt="diseño" className="w-5 h-5" width={20} height={20}/> } />
          <CardStat title="Créditos Totales" value={String(total)} color="text-indigo-600" icon={<Plus className="w-4 h-4"/>} />
          <CardStat title="Pendientes" value={`${creditos.filter(c=>c.estado==="PENDIENTE").length}`} color="text-yellow-600" icon={<Plus className="w-4 h-4"/>} />
        </div>

        {/* Main container */}
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cuentas por Cobrar</h1>
              <p className="text-gray-600 mt-2">Gestiona créditos a clientes, registra pagos y consulta saldos.</p>
            </div>

            <div className="flex items-center gap-3">
              <ActionButton icon={<Plus className="w-5 h-5 mr-1" />} label="Nuevo Crédito" onClick={handleAdd} color="primary" />
            </div>
          </div>

          <div className="mb-6">
            <FilterBar searchTerm={search} onSearchChange={(v)=>{ setSearch(v); setPage(1); }} searchPlaceholder="Buscar por cliente o artículo..." />
          </div>

          <CuentasCobrarTable
            data={creditos}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenPagos={handleOpenPagos}
          />

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">{!loading && total > 0 ? `Mostrando ${creditos.length} de ${total} registros` : loading ? "Cargando..." : "No hay registros"}</p>
            {!loading && total > 0 && (
              <Paginator total={total} currentPage={page} pageSize={limit} onPageChange={(p)=>setPage(p)} onPageSizeChange={(s)=>{ setLimit(s); setPage(1); }} />
            )}
          </div>
        </div>
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <ModalVentana isOpen={showModal} onClose={()=>setShowModal(false)} title={editing ? "Editar Crédito" : "Nuevo Crédito"}>
          <CuentasCobrarForm
            initialData={editing}
            onCancel={()=>{ setShowModal(false); }}
            onSaved={async ()=>{ setShowModal(false); await load(); setNotification({ message: "Guardado correctamente", type: "success" }); }}
          />
        </ModalVentana>
      )}

      {/* Modal pagos */}
      {showPagosModal && selectedCreditoId && (
        <ModalVentana isOpen={showPagosModal} onClose={()=>setShowPagosModal(false)} title="Pagos por Crédito">
          <PagosCreditoForm creditoId={selectedCreditoId} onClose={()=>{ setShowPagosModal(false); load(); }} />
        </ModalVentana>
      )}

      {notification && (
        <div className="fixed top-10 right-4 z-[9999]">
          <Alert message={notification.message} type={notification.type ?? "success"} onClose={()=>setNotification(null)} />
        </div>
      )}
    </AuthenticatedLayout>
  );
}

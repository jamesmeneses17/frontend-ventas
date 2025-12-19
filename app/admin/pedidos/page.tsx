"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import CardStat from "../../../components/ui/CardStat";
import Paginator from "../../../components/common/Paginator";
import FilterBar from "../../../components/common/FilterBar";
import ModalVentana from "../../../components/ui/ModalVentana";

// Iconos y UI
import { ShoppingBag, Clock, ShieldCheck, Search } from "lucide-react";
import { getPedidosOnline } from "../../../components/services/pedidosOnlineService";
import DetallePedidoModal from "../../../components/catalogos/DetallePedidoModal";
import PedidosTable from "../../../components/catalogos/PedidosTable";

// Servicios (Debes crear este archivo basado en el módulo del backend)


import { useCallback } from "react";

export default function PedidosOnlinePage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  // Filtros y Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  // Modales
  const [selectedPedido, setSelectedPedido] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPedidosOnline(page, pageSize, searchTerm);
      setPedidos(res.data || []);
      setTotalItems(res.total || 0);
    } catch (err) {
      console.error("Error cargando pedidos online:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = {
    total: totalItems,
    pendientes: pedidos.filter(p => p.estado === 'PENDIENTE').length,
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6" style={{ zoom: '0.85' }}>
        
        {/* --- WIDGETS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardStat 
            title="Total Pedidos Web" 
            value={String(stats.total)} 
            color="text-indigo-600" 
            icon={<ShoppingBag className="h-5 w-5" />} 
          />
          <CardStat 
            title="Por Validar" 
            value={String(stats.pendientes)} 
            color="text-yellow-600" 
            icon={<Clock className="h-5 w-5" />} 
          />
          <CardStat 
            title="Seguridad Activa" 
            value="Validación Hash" 
            color="text-emerald-600" 
            icon={<ShieldCheck className="h-5 w-5" />} 
          />
        </div>

        {/* --- TABLA PRINCIPAL --- */}
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-300">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
              Gestión de Pedidos Online
            </h1>
            <p className="text-gray-600">Verifica la integridad de los pedidos de WhatsApp</p>
          </div>

          <div className="mb-6 max-w-md">
            <FilterBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Buscar por código de pedido..."
            />
          </div>

          <PedidosTable 
            data={pedidos}
            loading={loading}
            onView={(pedido) => {
              setSelectedPedido(pedido);
              setShowDetail(true);
            }}
          />

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              {loading ? "Cargando..." : `Mostrando ${pedidos.length} pedidos`}
            </p>
            <Paginator 
              total={totalItems}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>

        {/* --- MODAL DE DETALLE --- */}
        {showDetail && selectedPedido && (
          <ModalVentana
            isOpen={showDetail}
            onClose={() => setShowDetail(false)}
            title={`Validación de Pedido: ${selectedPedido.codigo_pedido}`}
          >
            <DetallePedidoModal 
              pedido={selectedPedido} 
              onClose={() => setShowDetail(false)} 
            />
          </ModalVentana>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
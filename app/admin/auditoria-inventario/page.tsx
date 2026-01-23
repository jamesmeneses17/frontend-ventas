"use client";

import React, { useState, useRef, useEffect } from "react";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";
import { Search, Package, RefreshCw, DollarSign, CheckCircle, History, Trash2 } from "lucide-react";
import ActionButton from "../../../components/common/ActionButton";
import Alert from "../../../components/ui/Alert";
import Paginator from "../../../components/common/Paginator"; // Importamos el Paginator reutilizable
import { getProductos, Producto } from "../../../components/services/productosService";
import { createAjuste, getRecentAjustes, deleteAjuste } from "../../../components/services/ajustesService";

export default function AuditoriaInventarioPage() {
    // Estados
    const [barcode, setBarcode] = useState("");
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [product, setProduct] = useState<Producto | null>(null);
    const [stockFisico, setStockFisico] = useState<string>("");
    const [motivo, setMotivo] = useState("Auditoría de Inventario");
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Estados de Paginación e Historial
    const [recentAdjustments, setRecentAdjustments] = useState<any[]>([]);
    const [totalAdjustments, setTotalAdjustments] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Valor por defecto

    // Referencias para foco
    const barcodeInputRef = useRef<HTMLInputElement>(null);
    const stockInputRef = useRef<HTMLInputElement>(null);

    // Auto-foco inicial y carga de historial
    useEffect(() => {
        barcodeInputRef.current?.focus();
        loadHistory(page, pageSize);
    }, []); // Cargar al inicio

    // Recargar cuando cambie página o tamaño
    useEffect(() => {
        loadHistory(page, pageSize);
    }, [page, pageSize]);

    const loadHistory = async (p: number, limit: number) => {
        const result = await getRecentAjustes(p, limit);
        if (result) {
            setRecentAdjustments(result.data || []);
            setTotalAdjustments(result.total || 0);
        }
    };

    // Manejador de búsqueda de producto
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!barcode.trim()) return;

        setLoadingSearch(true);
        setProduct(null);
        setNotification(null);

        try {
            const res = await getProductos(1, 5, "", barcode.trim());

            if (res.data && res.data.length > 0) {
                const exactMatch = res.data.find(p => p.codigo === barcode.trim());
                const foundProduct = exactMatch || res.data[0];

                setProduct(foundProduct);
                setStockFisico("");

                setTimeout(() => stockInputRef.current?.focus(), 100);
            } else {
                setNotification({ message: "Producto no encontrado con ese código", type: "error" });
                setProduct(null);
                barcodeInputRef.current?.focus();
            }
        } catch (error) {
            console.error("Error buscando producto:", error);
            setNotification({ message: "Error al buscar el producto", type: "error" });
        } finally {
            setLoadingSearch(false);
        }
    };

    // Cálculos dinámicos
    const systemStock = product ? Number(product.stock) : 0;
    const currentPhysical = stockFisico === "" ? 0 : Number(stockFisico);
    const difference = currentPhysical - systemStock;
    const costPrice = product ? Number(product.precio_costo || product.precio || 0) : 0;
    const totalInventoryValue = currentPhysical * costPrice;

    // Manejador de Guardado
    const handleSave = async () => {
        if (!product) return;
        if (stockFisico === "") {
            setNotification({ message: "Debe ingresar el stock físico", type: "error" });
            return;
        }

        setSaving(true);
        try {
            await createAjuste({
                producto_id: product.id,
                stock_fisico: currentPhysical,
                motivo: motivo || "Auditoría de Inventario"
            });

            setNotification({ message: "Ajuste registrado correctamente", type: "success" });

            // Resetear para el siguiente producto
            resetFlow();

        } catch (error: any) {
            console.error("Error guardando ajuste:", error);
            setNotification({
                message: error?.response?.data?.message || "Error al registrar el ajuste",
                type: "error"
            });
        } finally {
            setSaving(false);
        }
    };

    const resetFlow = () => {
        setBarcode("");
        setProduct(null);
        setStockFisico("");
        setMotivo("Auditoría de Inventario");
        barcodeInputRef.current?.focus();
        loadHistory(1, pageSize); // Recargar primera página al guardar
    };

    const handleDeleteAjuste = async (id: number) => {
        if (!confirm("¿Estás seguro de anular este ajuste? El stock volverá a su estado anterior.")) return;

        try {
            await deleteAjuste(id);
            setNotification({ message: "Ajuste anulado correctamente. Stock restaurado.", type: "success" });
            loadHistory(page, pageSize); // Recargar página actual
        } catch (error) {
            setNotification({ message: "Error al anular el ajuste.", type: "error" });
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    return (
        <AuthenticatedLayout>
            <div className="max-w-7xl mx-auto space-y-6 px-4">

                {/* Header */}
                <div className="bg-white shadow-sm rounded-lg p-6 border-l-4 border-emerald-500">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package className="w-8 h-8 text-emerald-600" />
                        Auditoría de Inventario
                    </h1>
                    <p className="text-gray-500 mt-1">Escanear productos y verificar existencias físicas vs sistema.</p>
                </div>

                {/* Notificaciones */}
                {notification && (
                    <div className="fixed top-24 right-4 z-50">
                        <Alert type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
                    </div>
                )}

                {/* Buscador (Scanner Focus) */}
                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleSearch} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Escanear Código de Barras / Buscar Producto
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    ref={barcodeInputRef}
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-lg"
                                    placeholder="Escanea aquí..."
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loadingSearch || !barcode}
                            className="bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                        >
                            {loadingSearch ? <RefreshCw className="animate-spin w-5 h-5" /> : "Buscar"}
                        </button>
                    </form>
                </div>

                {/* Panel de Auditoría */}
                {product && (
                    <div className="bg-white shadow rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">

                            {/* Columna 1: Info Producto */}
                            <div className="md:col-span-1 flex flex-col items-center text-center border-r border-gray-100 pr-0 md:pr-6">
                                <div className="w-40 h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden border">
                                    {product.imagenes && product.imagenes.length > 0 ? (
                                        <img src={product.imagenes[0].url_imagen} alt={product.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-16 h-16 text-gray-300" />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{product.nombre}</h2>
                                <p className="text-sm text-gray-500 font-mono mt-1">{product.codigo}</p>
                                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {product.estado_stock}
                                </span>
                            </div>

                            {/* Columna 2: Auditoría */}
                            <div className="md:col-span-2 space-y-6">

                                {/* Comparativa de Stock */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                                        <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Sistema</span>
                                        <p className="text-3xl font-extrabold text-blue-800 mt-1">{systemStock}</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-lg text-center border-2 border-emerald-500 shadow-sm ring-4 ring-emerald-50">
                                        <label htmlFor="fisico" className="block text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1">
                                            Físico (Real)
                                        </label>
                                        <input
                                            ref={stockInputRef}
                                            id="fisico"
                                            type="number"
                                            className="w-full text-center text-3xl font-extrabold text-gray-900 border-none focus:ring-0 p-0 placeholder-gray-300"
                                            placeholder="?"
                                            value={stockFisico}
                                            onChange={(e) => setStockFisico(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSave();
                                            }}
                                        />
                                    </div>

                                    <div className={`p-4 rounded-lg text-center border ${difference < 0 ? 'bg-red-50 border-red-200' : (difference > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200')
                                        }`}>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${difference < 0 ? 'text-red-600' : (difference > 0 ? 'text-green-600' : 'text-gray-600')
                                            }`}>
                                            Diferencia
                                        </span>
                                        <p className={`text-3xl font-extrabold mt-1 ${difference < 0 ? 'text-red-700' : (difference > 0 ? 'text-green-700' : 'text-gray-700')
                                            }`}>
                                            {difference > 0 ? `+${difference}` : difference}
                                        </p>
                                    </div>
                                </div>

                                {/* Info Financiera (Presupuesto) */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-full border border-gray-200">
                                            <DollarSign className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase">Costo Unitario</p>
                                            <p className="font-bold text-gray-700">{formatCurrency(costPrice)}</p>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-semibold uppercase">Valor Total Inventario (Real)</p>
                                        <p className="text-xl font-black text-emerald-700">{formatCurrency(totalInventoryValue)}</p>
                                    </div>
                                </div>

                                {/* Motivo */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Motivo del Ajuste</label>
                                    <input
                                        type="text"
                                        className="w-full border-gray-300 rounded-md text-sm"
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                        placeholder="Ej: Conteo cíclico, merma, regalo..."
                                    />
                                </div>

                                {/* Acciones */}
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={resetFlow}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
                                    >
                                        Cancelar / Siguiente
                                    </button>
                                    <ActionButton
                                        label={saving ? "Guardando..." : "Confirmar Ajuste y Siguiente"}
                                        icon={saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        onClick={handleSave}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto shadow-md transform active:scale-95 transition-all"
                                        disabled={saving}
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Footer de estado */}
                        <div className={`h-2 w-full ${difference === 0 ? 'bg-gray-200' : (difference < 0 ? 'bg-red-500' : 'bg-green-500')
                            }`}></div>
                    </div>
                )}

                {!product && !loadingSearch && (
                    <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-500">Esperando lectura de código...</h3>
                        <p className="text-sm text-gray-400">Usa el escáner o ingresa el código manualmente.</p>
                    </div>
                )}

                {/* Historial Reciente */}
                <div className="bg-white shadow rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-500" />
                        Historial de Ajustes Recientes
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Ant.</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Físico</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Diferencia</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentAdjustments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No hay ajustes recientes.
                                        </td>
                                    </tr>
                                ) : (
                                    recentAdjustments.map((ajuste) => (
                                        <tr key={ajuste.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                {formatDate(ajuste.fecha)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {ajuste.producto?.nombre} <span className="text-gray-400 font-normal">({ajuste.producto?.codigo})</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                                {ajuste.stock_sistema}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-800">
                                                {ajuste.stock_fisico}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ajuste.diferencia < 0 ? 'bg-red-100 text-red-800' : (ajuste.diferencia > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')
                                                    }`}>
                                                    {ajuste.diferencia > 0 ? '+' : ''}{ajuste.diferencia}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDeleteAjuste(ajuste.id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    title="Anular Ajuste"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="mt-4 flex justify-end">
                        <Paginator
                            total={totalAdjustments}
                            currentPage={page}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                        />
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

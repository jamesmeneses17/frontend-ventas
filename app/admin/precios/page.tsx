// app/admin/precios/page.tsx
"use client";

import React from "react";
import { useCrudCatalog } from "../../../components/hooks/useCrudCatalog";
import AuthenticatedLayout from "../../../components/layout/AuthenticatedLayout";

// Componentes UI comunes
import Paginator from "../../../components/common/Paginator";
import ModalVentana from "../../../components/ui/ModalVentana";
import Alert from "../../../components/ui/Alert";
import FilterBar from "../../../components/common/FilterBar";
import ActionButton from "../../../components/common/ActionButton";
import CardStat from "../../../components/ui/CardStat"; 

// Iconos y Componentes específicos
import { DollarSign, Percent, BarChart, Plus, Upload } from "lucide-react"; 
import PreciosForm from "../../../components/catalogos/PreciosForm"; 
import PreciosTable from "../../../components/catalogos/PreciosTable"; 


// Servicios y Tipos
import {
    getPrecios,
    deletePrecio,
    PrecioConProducto, // Tipo para el ítem de la tabla (precio + detalles de producto)
    CreatePrecioData, // Tipo para la creación (normalmente requiere productId, valor)
    UpdatePrecioData, // Tipo para la actualización
    PrecioStats, // Tipo para los datos estadísticos
} from "@/components/services/preciosService"; 

// Importamos funciones de productos para aplicar el precio directamente
import { updateProducto, getProductoById, getProductos } from "@/components/services/productosService";

// -------------------- COMPONENTE PRINCIPAL --------------------
export default function PreciosPage() {
    const [formError, setFormError] = React.useState<string>("");
    
    // Estado para las estadísticas (Total Productos, En Promoción, Precio Promedio)
    const [stats, setStats] = React.useState<PrecioStats>({
        totalProductos: 0,
        productosEnPromocion: 0,
        precioPromedio: 0,
    });

    const [estadoPromocionFiltro, setEstadoPromocionFiltro] = React.useState<string>("");

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
    } = useCrudCatalog<PrecioConProducto, CreatePrecioData, UpdatePrecioData>(
        {
            // loadItems: listar TODOS los productos (usar la misma lógica de lista de productos)
            // para mostrar en la sección de Precios & Ofertas. Mapeamos Producto -> PrecioConProducto
            loadItems: async (all, page, size, searchTerm, promocionFiltro) => {
                // Si se solicita filtrar por estado de promoción, traemos una lista amplia
                // de productos y de precios para asegurar que el filtro incluya todos los items
                // y no dependa de la paginación del backend.
                if (promocionFiltro && String(promocionFiltro).trim() !== "") {
                    const prodsRespAll = await getProductos(1, Math.max(1000, size), "", searchTerm);
                    const allProductos = (prodsRespAll as any).data || (Array.isArray(prodsRespAll) ? prodsRespAll : []);

                    // Traemos precios para enriquecer
                    let preciosListAll: any[] = [];
                    try {
                        const preciosResp = await getPrecios(1, 1000, "");
                        preciosListAll = Array.isArray(preciosResp) ? preciosResp : (preciosResp as any).data || [];
                    } catch (e) {
                        preciosListAll = [];
                    }

                    const precioMapAll = new Map<number, any>();
                    preciosListAll.forEach((pr: any) => {
                        const pid = Number(pr.productoId ?? pr.producto?.id ?? 0);
                        if (pid > 0) precioMapAll.set(pid, pr);
                    });

                    const enrichedAll = allProductos.map((p: any) => {
                        const productoId = Number(p.id);
                        const precioObj = precioMapAll.get(productoId);
                        if (precioObj) {
                            return {
                                id: Number(precioObj.id ?? 0),
                                productoId,
                                valor_unitario: Number(precioObj.valor_unitario ?? precioObj.valor ?? p.precio ?? 0),
                                descuento_porcentaje: Number(precioObj.descuento_porcentaje ?? 0),
                                valor_final: Number(precioObj.valor_final ?? (Number(precioObj.valor_unitario ?? 0) * (1 - Number(precioObj.descuento_porcentaje ?? 0) / 100)) ),
                                estado: precioObj.estado || (Number(precioObj.descuento_porcentaje ?? 0) > 0 ? "En Promoción" : "Normal"),
                                fecha_inicio: precioObj.fecha_inicio ?? "",
                                fecha_fin: precioObj.fecha_fin ?? "",
                                producto: p,
                            } as unknown as PrecioConProducto;
                        }

                        const valor = Number(p.precio ?? 0);
                        return {
                            id: 0,
                            productoId,
                            valor_unitario: valor,
                            descuento_porcentaje: 0,
                            valor_final: valor,
                            estado: "Normal",
                            fecha_inicio: p.fecha_inicio ?? "",
                            fecha_fin: p.fecha_fin ?? "",
                            producto: p,
                        } as unknown as PrecioConProducto;
                    });

                    const computeDescuentoNum = (it: any) => {
                        const descuentoPorc = Number(it.descuento_porcentaje ?? 0);
                        if (descuentoPorc) return descuentoPorc;
                        const vu = Number(it.valor_unitario ?? 0) || 0;
                        const vf = Number(it.valor_final ?? vu) || vu;
                        return vu ? Math.round((1 - vf / vu) * 100) : 0;
                    };
                    const isInPromotion = (it: any) => computeDescuentoNum(it) > 0;

                    // Filtrar según la selección del usuario
                    const desired = String(promocionFiltro);
                    const finalList = enrichedAll.filter((it: any) => {
                        if (desired === "En Promoción") return isInPromotion(it);
                        if (desired === "Normal") return !isInPromotion(it);
                        return String(it.estado ?? "") === desired;
                    });

                    // Debug: imprimir conteos para diagnóstico (ver en consola del servidor/cliente)
                    try {
                        // eslint-disable-next-line no-console
                        console.debug('[PreciosPage.loadItems] promocionFiltro=', promocionFiltro, 'allProductos=', allProductos.length, 'preciosListAll=', preciosListAll.length, 'finalList=', finalList.length);
                    } catch (e) {}

                    const totalFiltered = finalList.length;
                    const start = (page - 1) * size;
                    const end = start + size;
                    const pageItems = finalList.slice(start, end);
                    return { data: pageItems, total: totalFiltered };
                }

                // Si no se filtra por promoción, cargamos productos paginados (sin filtro de stock)
                const prodsResp = await getProductos(page, size, "", searchTerm);
                const productos = prodsResp.data || [];
                const total = (prodsResp as any).total ?? productos.length;

                // También traemos los precios existentes para poder mezclar la info
                // y mostrar el descuento/valor_final cuando exista un precio para el producto.
                let preciosList: any[] = [];
                try {
                    const preciosResp = await getPrecios(1, 1000, "");
                    preciosList = Array.isArray(preciosResp) ? preciosResp : (preciosResp as any).data || [];
                } catch (e) {
                    preciosList = [];
                }

                const precioMap = new Map<number, any>();
                preciosList.forEach((pr: any) => {
                    const pid = Number(pr.productoId ?? pr.producto?.id ?? 0);
                    if (pid > 0) precioMap.set(pid, pr);
                });

                const enriched = productos.map((p: any) => {
                    const productoId = Number(p.id);
                    const precioObj = precioMap.get(productoId);
                    if (precioObj) {
                        // Si existe precio, mostrar los valores del precio (base, descuento, final) y usar id del precio
                        return {
                            id: Number(precioObj.id ?? 0),
                            productoId: productoId,
                            valor_unitario: Number(precioObj.valor_unitario ?? precioObj.valor ?? p.precio ?? 0),
                            descuento_porcentaje: Number(precioObj.descuento_porcentaje ?? 0),
                            valor_final: Number(precioObj.valor_final ?? (Number(precioObj.valor_unitario ?? 0) * (1 - Number(precioObj.descuento_porcentaje ?? 0) / 100)) ),
                            estado: precioObj.estado || (Number(precioObj.descuento_porcentaje ?? 0) > 0 ? "En Promoción" : "Normal"),
                            fecha_inicio: precioObj.fecha_inicio ?? "",
                            fecha_fin: precioObj.fecha_fin ?? "",
                            producto: p,
                        } as unknown as PrecioConProducto;
                    }

                    // Si no hay precio, mostramos datos base del producto
                    const valor = Number(p.precio ?? 0);
                    return {
                        id: 0, // Sin precio creado aún; las filas representan producto
                        productoId: productoId,
                        valor_unitario: valor,
                        descuento_porcentaje: 0,
                        valor_final: valor,
                        estado: "Normal",
                        fecha_inicio: p.fecha_inicio ?? "",
                        fecha_fin: p.fecha_fin ?? "",
                        producto: p,
                    } as unknown as PrecioConProducto;
                });

                // Si se solicita filtrar por estado de promoción, aplicarlo aquí.
                if (promocionFiltro && String(promocionFiltro).trim() !== "") {
                    const desired = String(promocionFiltro);
                    const computeDescuentoNum = (it: any) => {
                        const descuentoPorc = Number(it.descuento_porcentaje ?? 0);
                        if (descuentoPorc) return descuentoPorc;
                        const vu = Number(it.valor_unitario ?? 0) || 0;
                        const vf = Number(it.valor_final ?? vu) || vu;
                        return vu ? Math.round((1 - vf / vu) * 100) : 0;
                    };
                    const isInPromotion = (it: any) => computeDescuentoNum(it) > 0;

                    const filtered = enriched.filter((it: any) => {
                        if (desired === "En Promoción") return isInPromotion(it);
                        if (desired === "Normal") return !isInPromotion(it);
                        return String(it.estado ?? "") === desired;
                    });

                    return { data: filtered, total: filtered.length };
                }

                return { data: enriched, total };
            },
            // Al crear/editar desde este UI queremos crear/actualizar el registro en la tabla `precios`
            // y dejar que el servicio de precios (createPrecio) se encargue de sincronizar el producto
            createItem: async (data: CreatePrecioData) => {
                console.log('[PreciosPage.createItem] datos recibidos del formulario:', data);
                // Llamamos al servicio que crea el registro de precio. Este servicio ya intenta
                // propagar el valor al producto (updateProducto) para escribir precio_costo.
                try {
                    const created = await (await import('@/components/services/preciosService')).createPrecio(data);
                    // Si el servicio devolvió el precio creado, tratamos de obtener el producto relacionado
                    const producto = created && (created.producto || created.productoId)
                        ? await getProductoById(Number(created.productoId ?? created.producto?.id))
                        : await getProductoById(Number(data.productoId));

                    // Emitir evento global para notificar a otras páginas que un producto fue actualizado
                    try {
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('producto:updated', { detail: { id: producto.id } }));
                        }
                    } catch (e) {
                        console.debug('No se pudo emitir evento producto:updated', e);
                    }

                    const descuento = Number(data.descuento_porcentaje ?? 0);
                    const valor_unitario = Number(data.valor_unitario ?? 0);
                    const valor_final = Number((data as any).valor_final ?? (valor_unitario * (1 - descuento / 100)));
                    return {
                        id: created?.id ?? 0,
                        productoId: Number(data.productoId),
                        valor_unitario,
                        descuento_porcentaje: descuento,
                        valor_final,
                        estado: descuento > 0 ? "En Promoción" : "Normal",
                        fecha_inicio: data.fecha_inicio || new Date().toISOString().substring(0,10),
                        fecha_fin: data.fecha_fin ?? null,
                        producto,
                    } as PrecioConProducto;
                } catch (err) {
                    console.error('[PreciosPage.createItem] error creando precio:', err);
                    throw err;
                }
            },
            updateItem: async (id: number, data: UpdatePrecioData) => {
                console.log('[PreciosPage.updateItem] editar precio id=', id, 'data=', data);
                try {
                    const preciosService = await import('@/components/services/preciosService');
                    const updated = await preciosService.updatePrecio(id, data);
                    const pid = Number((data as any).productoId ?? updated?.productoId ?? 0);
                    const producto = pid > 0 ? await getProductoById(pid) : null;

                    const descuento = Number((data as any).descuento_porcentaje ?? 0);
                    const valor_unitario = Number((data as any).valor_unitario ?? 0);
                    const valor_final = Number((data as any).valor_final ?? (valor_unitario * (1 - descuento / 100)));
                    return {
                        id: id,
                        productoId: pid,
                        valor_unitario,
                        descuento_porcentaje: descuento,
                        valor_final,
                        estado: descuento > 0 ? "En Promoción" : "Normal",
                        fecha_inicio: (data as any).fecha_inicio || new Date().toISOString().substring(0,10),
                        fecha_fin: (data as any).fecha_fin ?? null,
                        producto: producto,
                    } as PrecioConProducto;
                } catch (err) {
                    console.error('[PreciosPage.updateItem] error actualizando precio:', err);
                    throw err;
                }
            },
            deleteItem: deletePrecio,
        },
        "Precio", // itemKey
        { customDependencies: [estadoPromocionFiltro] }
    );

    // Función para obtener las estadísticas del dashboard de precios
    const updateStats = React.useCallback(async () => {
        try {
            // Obtener conteo total de productos usando el servicio de productos
            const prodsResp = await getProductos(1, 1, "", "");
            // `getProductos` puede devolver { data, total } o array; preferimos el total si viene
            const totalProductos = (prodsResp as any).total ?? (Array.isArray(prodsResp) ? prodsResp.length : 0);

            // Obtener precios para calcular cuantos productos están en promoción
            let preciosList: any[] = [];
            try {
                const preciosResp = await getPrecios(1, 1000, "");
                preciosList = Array.isArray(preciosResp) ? preciosResp : (preciosResp as any).data || [];
            } catch (e) {
                preciosList = [];
            }

            // Contar productos únicos con descuento > 0
            const productosConDescuento = new Set<number>();
            preciosList.forEach(p => {
                const descuento = Number(p.descuento_porcentaje ?? p.descuento ?? 0);
                const pid = Number(p.productoId ?? p.producto?.id ?? 0);
                if (pid > 0 && descuento > 0) productosConDescuento.add(pid);
            });

            // Precio promedio: calculado a partir de la lista de productos (campo precio normalizado)
            // Intentamos obtener una página amplia de productos para calcular el promedio
            let productosForAvg: any[] = [];
            try {
                const prodsAll = await getProductos(1, 1000, "", "");
                productosForAvg = (prodsAll as any).data || (Array.isArray(prodsAll) ? prodsAll : []);
            } catch (e) {
                productosForAvg = [];
            }
            const preciosNums = productosForAvg.map(p => Number(p.precio ?? 0)).filter(v => !isNaN(v));
            const precioPromedio = preciosNums.length > 0 ? preciosNums.reduce((a,b) => a+b, 0)/preciosNums.length : 0;

            setStats({
                totalProductos: Number(totalProductos ?? 0),
                productosEnPromocion: productosConDescuento.size,
                precioPromedio: Number(precioPromedio ?? 0),
            });
        } catch (err) {
            console.error('Error calculando estadísticas de precios:', err);
        }
    }, []);

    // Cargar estadísticas al montar el componente
    React.useEffect(() => {
        updateStats();
    }, [updateStats]);

    // Handlers para asegurar que las estadísticas se actualicen después de una operación
    const handleFormSubmitWithStats = async (data: CreatePrecioData | UpdatePrecioData) => {
        setFormError("");
        try {
            await handleFormSubmit(data);
            updateStats();
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || "Error al guardar el precio/promoción.";
            setFormError(msg);
        }
    };

    const handleDeleteWithStats = async (id: number) => {
        await handleDelete(id);
        updateStats();
    };

    const editingPrecio = editingItem as PrecioConProducto | null;

    // Función de Importar (simulada)
    const handleImport = () => {
        alert("Función de Importar Precios no implementada. [Pendiente de desarrollo]");
    };
    
    // Opciones del filtro (si se usa un filtro de estado de promoción)
    const ESTADO_PROMOCION_FILTRO = [
        { label: "Todos", value: "" },
        { label: "Normal", value: "Normal" },
        { label: "En Promoción", value: "En Promoción" },
    ];

    const handlePromocionFilterChange = (value: string) => {
        setEstadoPromocionFiltro(value);
        handlePageChange(1);
    };


    return (
        <AuthenticatedLayout>
            <div className="space-y-6">

                {/* --- WIDGETS DE RESUMEN --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CardStat 
                        title="Total Productos" 
                        value={stats.totalProductos.toString()} 
                        color="text-indigo-600" 
                        icon={<BarChart className="h-4 w-4" />} 
                    />
                    <CardStat 
                        title="En Promoción" 
                        value={`${stats.productosEnPromocion.toString()}`}
                        color="text-green-600" 
                        icon={<Percent className="h-4 w-4" />} 
                    />
                    <CardStat 
                        title="Precio Promedio" 
                        // Formatear la moneda aquí. Asumiendo que es un número.
                        value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(stats.precioPromedio)}
                        color="text-gray-600" 
                        icon={<DollarSign className="h-4 w-4" />} 
                    />
                </div>

                {/* --- CONTENIDO PRINCIPAL --- */}
                <div className="bg-white shadow rounded-2xl p-6 border border-gray-300">
                    
                    {/* TÍTULO Y BOTONES */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <DollarSign className="w-6 h-6 text-indigo-600" />
                                Precios y Ofertas
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Gestiona los precios y promociones de tus productos
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <ActionButton 
                                icon={<Upload className="w-5 h-5 mr-1" />}
                                label="Importar Precios"
                                onClick={handleImport}
                                color="primary"
                            />
                            <ActionButton
                                icon={<Plus className="w-5 h-5 mr-1" />}
                                label="Agregar Precio"
                                onClick={handleAdd}
                                color="primary"
                            />
                        </div>
                    </div>

                    {/* BUSCADOR Y FILTROS */}
                    <div className="w-full mb-6">
                        <FilterBar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            searchPlaceholder="Buscar producto por nombre o código..."
                            selectOptions={ESTADO_PROMOCION_FILTRO}
                            selectFilterValue={estadoPromocionFiltro}
                            onSelectFilterChange={handlePromocionFilterChange}
                        />
                    </div>

                    {/* TABLA DE PRECIOS */}
                    <PreciosTable
                        data={currentItems}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDeleteWithStats}
                    />

                    {/* PAGINADOR */}
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-600">
                            {!loading && totalItems > 0 
                                ? `Mostrando ${currentItems.length} de ${totalItems} registros de precio` 
                                : (loading ? "Cargando..." : "No hay registros de precio")}
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
                        title={editingPrecio ? "Editar Precio/Promoción" : "Nuevo Precio/Promoción"}
                    >
                        <PreciosForm
                            initialData={editingPrecio}
                            onSubmit={handleFormSubmitWithStats}
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
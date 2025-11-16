// /components/hooks/useCrudCatalog.ts (NUEVO)

import { useState, useEffect, useMemo } from "react";

type LoadItemsFunction<T> = (
  all: boolean, 
  page: number, 
  size: number, 
  searchTerm: string, 
  ...customFilters: any[]
) => Promise<PaginacionResponse<T> | T[]>;

// Definición de tipos genéricos para las funciones de servicio CRUD
type CrudService<T, C, U> = {
    loadItems: LoadItemsFunction<T>; // Usamos la nueva función tipada
    createItem: (data: C) => Promise<any>;
    updateItem: (id: number, data: U) => Promise<any>;
    deleteItem: (id: number) => Promise<void>;
};

// Tipo para el ítem, debe tener 'id' y 'nombre'
interface CrudItem {
  id: number;
  // 'nombre' es útil en muchos catálogos, pero no todos los ítems lo tienen (por ejemplo PrecioConProducto).
  // Lo dejamos opcional para soportar tipos que no exponen 'nombre'.
  nombre?: string;
  [key: string]: any; // Permite propiedades adicionales como estadoId, categoria, etc.
}

interface ItemForm {
    [key: string]: any;
}
export interface PaginacionResponse<T> {
    data: T[];
    total: number;
}

interface CrudOptions {
    customDependencies?: any[]; 
}

export const useCrudCatalog = <T extends CrudItem, C extends ItemForm, U extends ItemForm>(
  service: CrudService<T, C, U>,
  itemKey: string, // Ej: 'Categoría' o 'Subcategoría'
  options: CrudOptions = {}
) => {
  // allItemsFull mantiene la lista completa cuando el servicio devuelve un array
  // currentItems contiene los items que se muestran en la tabla (paginados)
  const [allItemsFull, setAllItemsFull] = useState<T[]>([]);
  const [currentItems, setCurrentItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Lógica para auto-ocultar la notificación
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Función de carga de datos
  const loadItems = async () => {
    setLoading(true);
  try {
            console.debug("useCrudCatalog: loadItems called", { currentPage, pageSize, searchTerm, customDeps: options.customDependencies });
            // 🔑 Llamamos a loadItems con todos los parámetros de paginación/búsqueda/filtros
      const response = await service.loadItems(
        false,
        currentPage,
        pageSize,
        searchTerm,
        ...(options.customDependencies || []) // Pasamos los filtros custom (ej: estadoStockFiltro)
      );

      console.debug("useCrudCatalog: service.loadItems response:", response && (Array.isArray(response) ? `array(${(response as any).length})` : `object(data:${(response as any)?.data?.length ?? 'na'}, total:${(response as any)?.total ?? 'na'})`));

      // Aceptamos dos formatos de respuesta del servicio:
      // 1) { data: T[], total: number }  (paginación desde backend)
      // 2) T[] (lista simple)
      if (Array.isArray(response)) {
        const items = response as T[];
        setAllItemsFull(items);
        let total = items.length;

        // Heurística: si la respuesta parece contener exactamente `pageSize` items,
        // puede que el backend esté devolviendo sólo la página actual (sin total).
        // Intentamos pedir la lista completa (`all = true`) para conocer el total real.
        if (items.length === pageSize) {
          try {
            const fullResp = await service.loadItems(
              true,
              1,
              Math.max(1000, pageSize),
              searchTerm,
              ...(options.customDependencies || [])
            );
            if (Array.isArray(fullResp)) {
              total = (fullResp as T[]).length;
              setAllItemsFull(fullResp as T[]);
            } else if ((fullResp as any).data) {
              total = (fullResp as any).total ?? total;
              setAllItemsFull((fullResp as any).data as T[]);
            }
          } catch (err) {
            // Si falla el intento de full list, seguimos con el conteo parcial
            console.debug("No se pudo obtener lista completa para total, usando longitud parcial", err);
          }
        }

  setTotalItems(total);

        // Si la página solicitada excede el total disponible, ajustarla y salir
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) {
          setCurrentPage(totalPages);
          // Dejamos que el efecto que depende de currentPage recargue los items
          return;
        }

        // Calcular la porción paginada para mostrar en la tabla
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paged = items.slice(start, end);
        console.debug("useCrudCatalog: using array response; items", items.length, "-> paged", paged.length, { start, end });
        setCurrentItems(paged);
      } else if ((response as any).data) {
        const items = (response as any).data as T[];
        // Cuando el backend implementa paginación, `items` debería corresponder
        // a la página actual y `total` al total real. Sin embargo algunos
        // endpoints pueden devolver la lista completa dentro de `data`.
        // Detectamos ese caso y aplicamos un slice para garantizar que
        // currentItems nunca exceda pageSize.
        const total = (response as any).total ?? (items?.length ?? 0);
        setTotalItems(total);
        // Guardamos la lista completa sólo si parece serlo
        if (items.length > pageSize && items.length === total) {
          // Parece que `data` contiene la lista completa -> paginar localmente
          setAllItemsFull(items);
          const start = (currentPage - 1) * pageSize;
          const paged = items.slice(start, start + pageSize);
          console.debug("useCrudCatalog: backend returned full list inside data; slicing to", paged.length, { start, pageSize });
          setCurrentItems(paged);
        } else {
          // Caso normal: `data` ya está paginado por el backend
          setAllItemsFull(items);
          const totalPages = Math.max(1, Math.ceil(total / pageSize));
          if (currentPage > totalPages) {
            setCurrentPage(totalPages);
            return;
          }
          console.debug("useCrudCatalog: using paginated backend response; items", items.length, "total", total);
          setCurrentItems(items);
        }
      } else {
        // Fallback: si la respuesta es inesperada, tratamos como array
        const items = (response as unknown) as T[];
        setAllItemsFull(items || []);
        setTotalItems((items as any)?.length ?? 0);
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paged = (items || []).slice(start, end);
        console.debug("useCrudCatalog: fallback array; items", (items || []).length, "-> paged", paged.length, { start, end });
        setCurrentItems(paged);
      }

    }catch (error) {
      console.error(`Error cargando ${itemKey}s:`, error);
      setNotification({ message: `Error al cargar las ${itemKey}s.`, type: 'error' });
      setAllItemsFull([]);
      setCurrentItems([]);
      setTotalItems(0);
        } finally {
            setLoading(false);
        }
  };

 useEffect(() => {
        loadItems();
    }, [currentPage, pageSize, searchTerm, ...(options.customDependencies || [])]);

    // 🔑 HANDLER DE BÚSQUEDA AJUSTADO PARA RESETEAR LA PÁGINA
  const handleSearch = (term: string) => {
    // Sólo actualizar y resetear página si el término realmente cambió.
    // Esto evita que componentes como SearchInput (debounced)
    // provoquen un reset a 1 al montarse si el valor es el mismo.
    if (term === searchTerm) return;
    setSearchTerm(term);
    // Resetear a la página 1 cuando se realiza una nueva búsqueda
    setCurrentPage(1);
  };

    // Wrapper para cambiar el tamaño de página y resetear a la página 1
    const handlePageSizeChangeWrapper = (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
    };

    // Wrapper para cambiar de página (evita valores inválidos)
    const handlePageChangeWrapper = (page: number) => {
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const clamped = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clamped);
    };

  // currentItems ya está calculado arriba (paginado o devuelto por backend)

  // (Eliminada duplicidad de totalItems)

  // Handlers
  const handleEdit = (item: T) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setShowModal(false);
  };

  const handleFormSubmit = async (formData: C | U) => {
    const isEditing = !!editingItem;

    try {
      if (isEditing) {
        await service.updateItem(editingItem!.id, formData as U);
      } else {
        await service.createItem(formData as C);
      }

      setNotification({
        message: `${itemKey} "${formData.nombre}" ${
          isEditing ? "actualizada" : "creada"
        } correctamente.`,
        type: "success",
      });

      handleCloseModal();
      await loadItems(); // Recargar datos después de la operación
    } catch (error) {
            const err: any = error;
            const message = err?.response?.data?.message || err?.message || "Error al procesar la solicitud.";
            setNotification({ message: Array.isArray(message) ? message.join(', ') : String(message), type: "error" });
            throw error; 
        }
  };

  const handleDelete = async (id: number) => {
    const item = allItemsFull.find((c) => c.id === id);
    if (
      item &&
      confirm(`¿Estás seguro de eliminar ${itemKey.toLowerCase()} "${item.nombre}"?`)
    ) {
       try {
                await service.deleteItem(item.id);
                setNotification({ message: `${itemKey} eliminado correctamente.`, type: "success" });
                await loadItems(); 
            } catch (error) {
            setNotification({ message: `Error al eliminar la ${itemKey.toLowerCase()}.`, type: "error" });
        }
    }
  };

  // Retornamos todos los estados y handlers necesarios
  return {
    // Datos y Estado
    currentItems,
    loading,
    totalItems,
    searchTerm,
    currentPage,
    pageSize,
    showModal,
    editingItem,
    notification,

    // Exponer setNotification para que las páginas puedan cerrar/ajustar la notificación
    setNotification,

    // Handlers
    setSearchTerm: handleSearch,
  handlePageChange: handlePageChangeWrapper,
  handlePageSizeChange: handlePageSizeChangeWrapper,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleCloseModal,
  };
};
// /components/hooks/useCrudCatalog.ts (NUEVO)

import { useState, useEffect, useMemo, useCallback, useRef } from "react";

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

  // Memoizar dependencias custom por valor para evitar recrear el callback en cada render
  // cuando el componente padre pasa un array nuevo pero con el mismo contenido.
  // Comparar contenido del array, no la referencia
  const customDepsArray = options.customDependencies ?? [];
  const customDepsKey = customDepsArray.join('|');
  
  const customDependencies = useMemo(
    () => {
      console.log('[useMemo customDependencies] evaluando:', customDepsArray);
      return customDepsArray;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customDepsKey]
  );

  // Función de carga de datos (memoizada para usar en el efecto)
  // Mantener una referencia estable al servicio para evitar que cambios de
  // referencia en el objeto 'service' provoquen recreaciones innecesarias
  // de callbacks que dependen de él.
  const serviceRef = useRef(service);
  useEffect(() => {
    serviceRef.current = service;
  }, [service]);

  // Evitar llamadas concurrentes superpuestas que pueden producir múltiples
  // requests si algo provoca re-render rápido (por ejemplo, cambios de estado
  // externos). Usamos un ref booleano para no depender de `loading` en las deps.
  const fetchInProgressRef = useRef(false);
  
  // 🔥 DEBUG: Log para detectar cambios en dependencias
  useEffect(() => {
    console.log('[useCrudCatalog] customDependencies changed:', customDependencies);
  }, [customDependencies]);

  const fetchItems = useCallback(async () => {
    if (fetchInProgressRef.current) {
      console.log('[useCrudCatalog] ⚠️ fetchItems ya en progreso, ignorando llamada');
      return;
    }
    console.log('[useCrudCatalog] 🔵 fetchItems INICIADO:', { currentPage, pageSize, searchTerm, customDeps: customDependencies });
    fetchInProgressRef.current = true;
    setLoading(true);
    try {
      console.debug("useCrudCatalog: fetchItems called", { currentPage, pageSize, searchTerm, customDeps: customDependencies });
      const response = await serviceRef.current.loadItems(
        false,
        currentPage,
        pageSize,
        searchTerm,
        ...customDependencies
      );

      console.debug("useCrudCatalog: service.loadItems response:", response && (Array.isArray(response) ? `array(${(response as any).length})` : `object(data:${(response as any)?.data?.length ?? 'na'}, total:${(response as any)?.total ?? 'na'})`));

      if (Array.isArray(response)) {
        const items = response as T[];
        setAllItemsFull(items);
        let total = items.length;

        if (items.length === pageSize) {
          try {
            const fullResp = await serviceRef.current.loadItems(
              true,
              1,
              Math.max(1000, pageSize),
              searchTerm,
              ...customDependencies
            );
            if (Array.isArray(fullResp)) {
              total = (fullResp as T[]).length;
              setAllItemsFull(fullResp as T[]);
            } else if ((fullResp as any).data) {
              total = (fullResp as any).total ?? total;
              setAllItemsFull((fullResp as any).data as T[]);
            }
          } catch (err) {
            console.debug("No se pudo obtener lista completa para total, usando longitud parcial", err);
          }
        }

        setTotalItems(total);

        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) {
          setCurrentPage(totalPages);
          return;
        }

        const start = (currentPage - 1) * pageSize;
        const paged = items.slice(start, start + pageSize);
        setCurrentItems(paged);
      } else if ((response as any).data) {
        const items = (response as any).data as T[];
        const total = (response as any).total ?? (items?.length ?? 0);
        setTotalItems(total);

        if (items.length > pageSize && items.length === total) {
          setAllItemsFull(items);
          const start = (currentPage - 1) * pageSize;
          const paged = items.slice(start, start + pageSize);
          setCurrentItems(paged);
        } else {
          setAllItemsFull(items);
          const totalPages = Math.max(1, Math.ceil(total / pageSize));
          if (currentPage > totalPages) {
            setCurrentPage(totalPages);
            return;
          }
          setCurrentItems(items);
        }
      } else {
        const items = (response as unknown) as T[];
        setAllItemsFull(items || []);
        setTotalItems((items as any)?.length ?? 0);
        const start = (currentPage - 1) * pageSize;
        const paged = (items || []).slice(start, start + pageSize);
        setCurrentItems(paged);
      }
    } catch (error) {
      console.error(`Error cargando ${itemKey}s:`, error);
      setNotification({ message: `Error al cargar las ${itemKey}s.`, type: 'error' });
      setAllItemsFull([]);
      setCurrentItems([]);
      setTotalItems(0);
    } finally {
      fetchInProgressRef.current = false;
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, itemKey, customDependencies]);


  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
      let result: any;
      if (isEditing) {
        result = await serviceRef.current.updateItem(editingItem!.id, formData as U);
      } else {
        result = await serviceRef.current.createItem(formData as C);
      }

      const itemName = (formData as any).nombre || `${itemKey}`;
      
      setNotification({
        message: `${itemKey} ${
          isEditing ? "actualizado/a" : "creado/a"
        } correctamente.`,
        type: "success",
      });

      // NO cerrar el modal aquí - dejar que el formulario lo maneje después de subir la imagen
      // handleCloseModal();
      
      // Recargar datos después de la operación
      await fetchItems();
      
      // Devolver el resultado para que el formulario pueda usarlo (ej: obtener ID)
      return result;
    } catch (error) {
        const err: any = error;
        const message = err?.response?.data?.message || err?.message || "Error al procesar la solicitud.";
        setNotification({ message: Array.isArray(message) ? message.join(', ') : String(message), type: "error" });
        // Retornar null en caso de error para que el formulario sepa que falló
        return null;
      }
  };

  const handleDelete = async (id: number) => {
    const item = allItemsFull.find((c) => c.id === id);
    if (
      item &&
      confirm(`¿Estás seguro de eliminar ${itemKey.toLowerCase()} "${item.nombre}"?`)
    ) {
       try {
                await serviceRef.current.deleteItem(item.id);
                setNotification({ message: `${itemKey} eliminado correctamente.`, type: "success" });
                await fetchItems(); 
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

    // Refrescar manualmente los datos (útil cuando se actualiza imagen después del submit)
    refreshItems: fetchItems,

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
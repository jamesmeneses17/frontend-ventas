// /components/hooks/useCrudCatalog.ts (NUEVO)

import { useState, useEffect, useMemo } from "react";

type LoadItemsFunction<T> = (
    all: boolean, 
    page: number, 
    size: number, 
    searchTerm: string, 
    ...customFilters: any[]
) => Promise<PaginacionResponse<T>>;

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
  nombre: string;
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
  const [allItems, setAllItems] = useState<T[]>([]);
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
            // 🔑 Llamamos a loadItems con todos los parámetros de paginación/búsqueda/filtros
            const response = await service.loadItems(
                false, 
                currentPage, 
                pageSize, 
                searchTerm, 
                ...(options.customDependencies || []) // Pasamos los filtros custom (ej: estadoStockFiltro)
            );

            setAllItems(response.data);
            setTotalItems(response.total);

        }catch (error) {
            console.error(`Error cargando ${itemKey}s:`, error);
            setNotification({ message: `Error al cargar las ${itemKey}s.`, type: 'error' });
            setAllItems([]);
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
        setSearchTerm(term);
        // Resetear a la página 1 cuando se realiza una nueva búsqueda
        setCurrentPage(1); 
    };

  // Lógica de filtrado y paginación (Memoizada)
  const currentItems = useMemo(() => {
    let filteredData = allItems;

    if (searchTerm) {
      // Búsqueda genérica por el campo 'nombre'. 
      // Si la Subcategoría necesita buscar por 'categoria.nombre', esto debe extenderse.
      filteredData = filteredData.filter((item) =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.categoria?.nombre && item.categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [allItems, currentPage, pageSize, searchTerm]);

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
    const item = allItems.find((c) => c.id === id);
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
    handlePageChange: setCurrentPage,
    handlePageSizeChange: setPageSize,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleCloseModal,
  };
};
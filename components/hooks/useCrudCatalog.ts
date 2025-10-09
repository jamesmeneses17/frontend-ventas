// /components/hooks/useCrudCatalog.ts (NUEVO)

import { useState, useEffect, useMemo } from "react";

// Definición de tipos genéricos para las funciones de servicio CRUD
type CrudService<T, C, U> = {
  loadItems: (all: boolean) => Promise<T[]>;
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

export const useCrudCatalog = <T extends CrudItem, C extends ItemForm, U extends ItemForm>(
  service: CrudService<T, C, U>,
  itemKey: string // Ej: 'Categoría' o 'Subcategoría'
) => {
  const [allItems, setAllItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Usamos la función de carga específica inyectada
      const data = await service.loadItems(true); 
      const sortedData = data.sort((a, b) => b.id - a.id);
      setAllItems(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error(`Error cargando ${itemKey}s:`, error);
      setNotification({ message: `Error al cargar las ${itemKey}s.`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

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

  const totalItems = allItems.length;

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
      // Lógica de extracción de error (simplificada, la página puede manejar la notificación)
      const err: any = error;
      const message = err?.response?.data?.message || err?.message || "Error al procesar la solicitud.";
      
      setNotification({ message: Array.isArray(message) ? message.join(', ') : String(message), type: "error" });
      throw error; // Lanzamos el error para que el formulario sepa que falló
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
            setNotification({ message: `${itemKey} eliminada correctamente.`, type: "success" });
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

    // Handlers
    setSearchTerm,
    handlePageChange: setCurrentPage,
    handlePageSizeChange: setPageSize,
    handleAdd,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleCloseModal,
  };
};
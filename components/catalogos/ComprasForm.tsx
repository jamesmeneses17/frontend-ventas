"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { getProductos, Producto } from "../services/productosService";
import { getClientes, Cliente } from "../services/clientesServices";
import { CreateCompraDTO } from "../services/comprasService";
import { formatCurrency } from "../../utils/formatters";

type FormData = {
  fecha_compra: string;
  clienteId: string;
  productoId: string;
  cantidad: number;
  costo_unitario: number;
  productoSearch: string;
  clienteSearch: string; // Nuevo campo para buscar cliente
};

interface Props {
  initialData?: any;
  onSubmit: (data: CreateCompraDTO) => void;
  onCancel: () => void;
  formError?: string;
}

export default function ComprasForm({
  initialData,
  onSubmit,
  onCancel,
  formError,
}: Props) {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      fecha_compra: new Date().toISOString().substring(0, 10),
      clienteId: "",
      productoId: "",
      cantidad: 1,
      costo_unitario: 0,
      productoSearch: "",
      clienteSearch: "",
    },
  });

  const formValues = watch();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Cliente[]>([]); // Todos los proveedores cargados
  const [filteredProveedores, setFilteredProveedores] = useState<Cliente[]>([]); // Para el autocomplete
  const [cart, setCart] = useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // Estado para el buscador de productos
  const [productoSearchTerm, setProductoSearchTerm] = useState("");
  // Estado para el buscador de clientes
  const [clienteSearchTerm, setClienteSearchTerm] = useState("");
  const [showClienteSuggestions, setShowClienteSuggestions] = useState(false);

  const clienteInputRef = useRef<HTMLDivElement>(null);

  // 🔄 Cargar productos iniciales y proveedores
  useEffect(() => {
    const loadData = async () => {
      setLoadingLookups(true);
      try {
        const prodRes = await getProductos(1, 100);
        // Cargar suficientes clientes...
        const cliRes = await getClientes("", 1, 100);

        const loadedProducts = prodRes?.data ?? prodRes ?? [];
        setProductos(loadedProducts);

        const clientesList = cliRes ?? [];
        setProveedores(clientesList);
        setFilteredProveedores(clientesList);
      } catch (err) {
        console.error("Error cargando datos iniciales", err);
      } finally {
        setLoadingLookups(false);
      }
    };

    loadData();
  }, []);

  // 📝 Cargar datos iniciales si es edición
  useEffect(() => {
    if (initialData) {
      console.log("Cargando initialData:", initialData);

      // 1. Fecha
      if (initialData.fecha) {
        setValue("fecha_compra", new Date(initialData.fecha).toISOString().substring(0, 10));
      }

      // 2. Cliente
      if (initialData.cliente) {
        setValue("clienteId", String(initialData.cliente.id));
        setClienteSearchTerm(initialData.cliente.nombre);
      } else if (initialData.clienteId) {
        setValue("clienteId", String(initialData.clienteId));
        // Si solo tenemos ID, intentar buscar nombre en lista de proveedores (si ya cargó)
        // Ojo: proveedores carga async, así que esto podría necesitar un efecto dependiente de proveedores
      }

      // 3. Cart
      if (initialData.detalles && Array.isArray(initialData.detalles)) {
        const mappedCart = initialData.detalles.map((det: any) => ({
          producto_id: det.producto?.id || det.producto_id,
          nombre: det.producto?.nombre || "Producto desconocido",
          codigo: det.producto?.codigo || "",
          cantidad: Number(det.cantidad),
          costo_unitario: Number(det.costo_unitario),
          subtotal: Number(det.cantidad) * Number(det.costo_unitario),
        }));
        setCart(mappedCart);
      }
    }
  }, [initialData, setValue]);

  // Efecto separado: Si tenemos clienteId pero no nombre (ej: recarga), mapear nombre cuando proveedores carguen
  useEffect(() => {
    if (initialData?.clienteId && proveedores.length > 0 && !clienteSearchTerm) {
      const found = proveedores.find(p => String(p.id) === String(initialData.clienteId));
      if (found) {
        setClienteSearchTerm(found.nombre);
      }
    }
  }, [proveedores, initialData, clienteSearchTerm]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clienteInputRef.current && !clienteInputRef.current.contains(event.target as Node)) {
        setShowClienteSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔍 Filtro de Clientes en Tiempo Real
  useEffect(() => {
    const term = clienteSearchTerm.toLowerCase();
    if (!term) {
      setFilteredProveedores(proveedores);
      return;
    }

    const filtered = proveedores.filter(c =>
      c.nombre.toLowerCase().includes(term) ||
      c.numero_documento?.includes(term)
    );
    setFilteredProveedores(filtered);
    setShowClienteSuggestions(true);
  }, [clienteSearchTerm, proveedores]);


  // 🔍 Lógica de Búsqueda de Productos (Debounce)
  useEffect(() => {
    const term = productoSearchTerm.trim();
    if (!term) return;

    const normalized = term.toLowerCase();

    // 1) Intentar encontrar en la lista local primero
    const exactLocal = productos.find(
      (p) => p.codigo?.toLowerCase() === normalized
    );

    if (exactLocal) {
      setValue("productoId", String(exactLocal.id), { shouldValidate: true });
    }

    // 2) Consultar API (Debounce)
    const timer = setTimeout(async () => {
      try {
        const res = await getProductos(1, 20, "", term);
        const list = Array.isArray(res) ? res : res?.data ?? [];

        if (list.length > 0) {
          setProductos((prev) => {
            const merged = [...prev];
            list.forEach((item: Producto) => {
              if (!merged.some((p) => p.id === item.id)) {
                merged.push(item);
              }
            });
            return merged;
          });

          // Autoseleccionar si no hay nada seleccionado
          if (!formValues.productoId) {
            const exact = list.find((p) => p.codigo?.toLowerCase() === normalized);
            const partial = list.find((p) => p.codigo?.toLowerCase().startsWith(normalized));
            const target = exact || partial;
            if (target) {
              setValue("productoId", String(target.id), { shouldValidate: true });
            }
          }
        }
      } catch (err) {
        console.error("Error buscando producto por código", err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [productoSearchTerm, setValue]);

  const handleProductoSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue("productoId", val);
    const selected = productos.find(p => String(p.id) === val);
    if (selected) {
      setProductoSearchTerm(selected.codigo || selected.nombre);
    }
  };

  const selectCliente = (cliente: Cliente) => {
    setValue("clienteId", String(cliente.id));
    setClienteSearchTerm(cliente.nombre); // Mostrar nombre seleccionado
    setShowClienteSuggestions(false);
  };

  // ➕ Agregar producto al carrito
  const addToCart = () => {
    if (!formValues.productoId) return;

    const producto = productos.find(
      (p) => p.id === Number(formValues.productoId)
    );
    if (!producto) return;

    if (formValues.cantidad <= 0 || formValues.costo_unitario <= 0) {
      alert("Cantidad y costo deben ser mayores a 0");
      return;
    }

    const item = {
      producto_id: producto.id,
      nombre: producto.nombre,
      codigo: producto.codigo,
      cantidad: Number(formValues.cantidad),
      costo_unitario: Number(formValues.costo_unitario),
      subtotal:
        Number(formValues.cantidad) * Number(formValues.costo_unitario),
    };

    setCart((prev) => [...prev, item]);

    setValue("productoId", "");
    setValue("cantidad", 1);
    setValue("costo_unitario", 0);
    setProductoSearchTerm("");
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const submitForm = (data: FormData) => {
    if (!data.clienteId) {
      alert("Selecciona un proveedor");
      return;
    }

    if (cart.length === 0) {
      alert("Agrega al menos un producto a la compra");
      return;
    }

    const payload: CreateCompraDTO = {
      fecha: data.fecha_compra,
      cliente_id: Number(data.clienteId),
      items: cart.map((item) => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        costo_unitario: item.costo_unitario,
      })),
    };

    onSubmit(payload);
  };

  const totalCompra = cart.reduce((acc, item) => acc + item.subtotal, 0);

  const productosOpciones = productos.filter(p => {
    if (!productoSearchTerm) return true;
    const term = productoSearchTerm.toLowerCase();
    return p.codigo?.toLowerCase().includes(term) || p.nombre?.toLowerCase().includes(term);
  }).map(p => ({
    value: String(p.id),
    label: `${p.codigo} - ${p.nombre}`
  }));

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ===================== BÚSQUEDA DE CLIENTE (AUTOCOMPLETE) ===================== */}
        <div className="relative" ref={clienteInputRef}>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Proveedor(Cédula o Nombre) *</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Buscar cliente..."
            value={clienteSearchTerm}
            onChange={(e) => {
              setClienteSearchTerm(e.target.value);
              setValue("clienteId", ""); // Reset si cambia texto manual
            }}
            onFocus={() => setShowClienteSuggestions(true)}
          />
          {/* Lista desplegable */}
          {showClienteSuggestions && filteredProveedores.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
              {filteredProveedores.map(cliente => (
                <div
                  key={cliente.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-0"
                  onClick={() => selectCliente(cliente)}
                >
                  <div className="font-bold text-gray-800">{cliente.nombre}</div>
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>CC: {cliente.numero_documento}</span>
                    {cliente.tipoContacto && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">
                        {cliente.tipoContacto.nombre}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Campo oculto para validar req */}
          <input type="hidden" name="clienteId" value={formValues.clienteId} />
        </div>

        {/* ===================== FECHA ===================== */}
        <FormInput
          label="Fecha de Compra"
          type="date"
          name="fecha_compra"
          value={formValues.fecha_compra}
          onChange={(e) => setValue("fecha_compra", e.target.value)}
          required
        />
      </div>

      {/* ===================== AGREGAR PRODUCTOS ===================== */}
      <div className="border p-4 rounded-md bg-gray-50 space-y-4">
        <h3 className="font-semibold text-gray-700">Agregar producto</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Buscador Producto */}
          <FormInput
            label="Buscar Producto (Código o Nombre)"
            name="productoSearch"
            value={productoSearchTerm}
            onChange={(e) => setProductoSearchTerm(e.target.value)}
            placeholder="Escribe para buscar..."
          />

          {/* 2. Select Filtrado Producto */}
          <FormSelect
            label="Producto *"
            name="productoId"
            value={formValues.productoId}
            onChange={handleProductoSelectChange}
            options={productosOpciones}
            disabled={loadingLookups}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Cantidad *"
            type="number"
            name="cantidad"
            value={String(formValues.cantidad)}
            onChange={(e) => setValue("cantidad", Number(e.target.value))}
          />

          <FormInput
            label="Costo Unitario *"
            type="number"
            name="costo_unitario"
            value={String(formValues.costo_unitario)}
            onChange={(e) =>
              setValue("costo_unitario", Number(e.target.value))
            }
          />
        </div>

        <Button type="button" onClick={addToCart}>
          Agregar a la lista
        </Button>
      </div>

      {/* ===================== TABLA CARRITO ===================== */}
      {cart.length > 0 && (
        <div className="space-y-3">
          <table className="w-full text-sm border bg-white rounded-md shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Código</th>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-center">Cantidad</th>
                <th className="p-3 text-right">Subtotal</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{item.codigo}</td>
                  <td className="p-2">{item.nombre}</td>
                  <td className="p-2 text-center">{item.cantidad}</td>
                  <td className="p-3 text-right font-medium">
                    {formatCurrency(item.subtotal)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                      onClick={() => removeItem(i)}
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right font-bold text-xl text-gray-800 mt-2">
            Total Compra: <span className="text-blue-600">{formatCurrency(totalCompra)}</span>
          </div>
        </div>
      )}

      {/* ===================== BOTONES ===================== */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-600">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Compra"}
        </Button>
      </div>

      {formError && (
        <div className="text-red-600 text-sm text-center font-medium bg-red-50 p-2 rounded-md border border-red-200">
          {formError}
        </div>
      )}
    </form>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

import { getProductos, Producto } from "../services/productosService";
import { getClientes } from "../services/clientesServices";
import { CreateCompraDTO } from "../services/comprasService";
import { formatCurrency } from "../../utils/formatters";

type FormData = {
  fecha_compra: string;
  clienteId: string;
  productoId: string;
  cantidad: number;
  costo_unitario: number;
  productoSearch: string; // Campo para el buscador
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
    },
  });

  const formValues = watch();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // Estado para el buscador
  const [productoSearchTerm, setProductoSearchTerm] = useState("");

  // 🔄 Cargar productos iniciales y proveedores
  useEffect(() => {
    const loadData = async () => {
      setLoadingLookups(true);
      try {
        const prodRes = await getProductos(1, 100);
        const cliRes = await getClientes("", 1, 100);

        setProductos(prodRes?.data ?? prodRes ?? []);
        setProveedores(cliRes ?? []);
      } catch (err) {
        console.error("Error cargando datos iniciales", err);
      } finally {
        setLoadingLookups(false);
      }
    };

    loadData();
  }, []);

  // 🔍 Lógica de Búsqueda de Productos (Debounce + API)
  useEffect(() => {
    const term = productoSearchTerm.trim();
    if (!term) return;

    const normalized = term.toLowerCase();

    // 1) Intentar encontrar en la lista local primero
    const exactLocal = productos.find(
      (p) => p.codigo?.toLowerCase() === normalized
    );
    const partialLocal = productos.find((p) =>
      p.codigo?.toLowerCase().startsWith(normalized)
    );

    // Si encontramos exacto localmente, lo seleccionamos
    if (exactLocal) {
      setValue("productoId", String(exactLocal.id), { shouldValidate: true });
      // No retornamos aquí para permitir que la búsqueda en API traiga más opciones si es necesario
    }

    // 2) Consultar API si no es una coincidencia exacta local o para traer más opciones
    const timer = setTimeout(async () => {
      try {
        // Buscamos en el backend
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

          // Si obtuvimos resultados y no habiamos seleccionado nada, intentar seleccionar el mejor match
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
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [productoSearchTerm, setValue]); // Removemos productos de dependencias para evitar loop infinito si setProductos cambia referencias

  // Sincronizar input de búsqueda cuando se selecciona un producto manualmente del combo
  const handleProductoSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setValue("productoId", val);

    const selected = productos.find(p => String(p.id) === val);
    if (selected) {
      setProductoSearchTerm(selected.codigo || selected.nombre);
    }
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

    // Reset campos de producto pero mantener el proveedor
    setValue("productoId", "");
    setValue("cantidad", 1);
    setValue("costo_unitario", 0);
    setProductoSearchTerm(""); // Limpiar buscador
  };

  // ❌ Quitar item del carrito
  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // 📤 Enviar compra completa
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

  // Filtrar las opciones del select basado en la búsqueda para UX más limpia
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
      {/* ===================== PROVEEDOR ===================== */}
      <FormSelect
        label="Proveedor"
        name="clienteId"
        value={formValues.clienteId}
        onChange={(e) => setValue("clienteId", e.target.value)}
        options={proveedores.map((p) => ({
          value: String(p.id),
          label: p.nombre,
        }))}
        required
      />

      {/* ===================== FECHA ===================== */}
      <FormInput
        label="Fecha de Compra"
        type="date"
        name="fecha_compra"
        value={formValues.fecha_compra}
        onChange={(e) => setValue("fecha_compra", e.target.value)}
        required
      />

      {/* ===================== AGREGAR PRODUCTOS ===================== */}
      <div className="border p-4 rounded-md bg-gray-50 space-y-4">
        <h3 className="font-semibold">Agregar producto</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Buscador */}
          <FormInput
            label="Buscar Producto (Código o Nombre)"
            name="productoSearch"
            value={productoSearchTerm}
            onChange={(e) => setProductoSearchTerm(e.target.value)}
            placeholder="Escribe para buscar..."
          />

          {/* 2. Select Filtrado */}
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
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Código</th>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-center">Cantidad</th>
                <th className="p-2 text-right">Subtotal</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{item.codigo}</td>
                  <td className="p-2">{item.nombre}</td>
                  <td className="p-2 text-center">{item.cantidad}</td>
                  <td className="p-2 text-right">
                    {formatCurrency(item.subtotal)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      className="text-red-600 text-xs hover:underline"
                      onClick={() => removeItem(i)}
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right font-bold text-lg">
            Total Compra: {formatCurrency(totalCompra)}
          </div>
        </div>
      )}

      {/* ===================== BOTONES ===================== */}
      <div className="flex justify-end gap-3">
        <Button type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>Guardar Compra</Button>
      </div>

      {formError && (
        <div className="text-red-600 text-sm text-center">{formError}</div>
      )}
    </form>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus } from "lucide-react";

import Button from "../ui/button";
import FormInput from "../common/form/FormInput";
import ModalVentana from "../ui/ModalVentana";
import ClientesForm from "./ClientesForm";

import { getClientes } from "../services/clientesServices";
import {
  createCredito,
  getCreditoById,
  updateCredito,
} from "../services/cuentasCobrarService";
import { getProductos } from "../services/productosService";

/* =======================
   VALIDACIÓN
======================= */
const schema = z.object({
  cliente_id: z.number().int().positive("El cliente es obligatorio"),
  num_factura: z.string().min(1, "El número de factura es obligatorio"),
  articulo: z.string().min(1),
  valor_credito: z.number().positive("El valor debe ser mayor a 0"),
  fecha_inicial: z.string().optional(),
  fecha_final: z.string().optional(),
});

type FormData = z.infer<typeof schema> & { id?: number };

interface Props {
  initialData?: Partial<FormData> | null;
  onSaved: () => void;
  onCancel: () => void;
}

/* =======================
   COMPONENTE
======================= */
export default function CuentasCobrarForm({
  initialData = null,
  onSaved,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cliente_id: 0,
      num_factura: "",
      articulo: "",
      valor_credito: 0,
      fecha_inicial: "",
      fecha_final: "",
    },
  });

  /* =======================
     ESTADOS
  ======================= */
  const [clientesOptions, setClientesOptions] = useState<
    { value: string; label: string; cedula?: string }[]
  >([]);
  const [clienteSearch, setClienteSearch] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [showClienteModal, setShowClienteModal] = useState(false);

  const [productosOptions, setProductosOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [articuloSearch, setArticuloSearch] = useState("");
  const [selectedArticulos, setSelectedArticulos] = useState<
    { codigo: string; nombre: string }[]
  >([]);

  /* =======================
     UTILIDADES
  ======================= */
  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredClientes = clientesOptions.filter((c) => {
    if (!clienteSearch.trim()) return true;
    const search = normalizeText(clienteSearch);
    return (
      normalizeText(c.label).includes(search) ||
      (c.cedula && normalizeText(c.cedula).includes(search))
    );
  });

  /* =======================
     CARGA DE DATOS
  ======================= */
  useEffect(() => {
    (async () => {
      try {
        const clientes = await getClientes();
        setClientesOptions(
          clientes.map((c: any) => ({
            value: String(c.id),
            label: c.nombre || c.nombre_cliente || `Cliente ${c.id}`,
            cedula: c.cedula || c.documento || "",
          }))
        );
      } catch {}

      try {
        const resp = await getProductos(1, 100, "", "");
        setProductosOptions(
          (resp?.data || []).map((p: any) => ({
            value: String(p.id),
            label: p.nombre ?? `Producto ${p.id}`,
          }))
        );
      } catch {}

      if (initialData?.id) {
        const full = await getCreditoById(Number(initialData.id));
        reset(full);
      } else if (initialData) {
        reset(initialData as any);
      }
    })();
  }, [initialData, reset]);

  /* =======================
     SUBMIT
  ======================= */
  const onSubmit = async (data: FormData) => {
    if (selectedArticulos.length === 0) {
      alert("Debe seleccionar al menos un artículo");
      return;
    }

    const payload = {
      ...data,
      detalles: selectedArticulos.map((a) => ({
        articulo_codigo: a.codigo,
      })),
    };

    try {
      if (initialData?.id) {
        await updateCredito(initialData.id, payload);
      } else {
        await createCredito(payload);
      }
      await onSaved();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error al guardar");
    }
  };

  /* =======================
     JSX
  ======================= */
  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col max-h-[70vh] bg-white rounded-lg"
      >
        {/* ================= CONTENIDO CON SCROLL ================= */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">

          <FormInput
            label="Número de Factura"
            type="text"
            {...register("num_factura")}
            error={errors.num_factura?.message}
          />

          {/* ===== CLIENTE ===== */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Buscar cliente..."
                value={clienteSearch}
                onChange={(e) => {
                  setClienteSearch(e.target.value);
                  setShowAutocomplete(true);
                  setHighlightedIndex(0);
                }}
                onFocus={() => setShowAutocomplete(true)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
              />

              <button
                type="button"
                className="absolute right-2 top-2 text-indigo-600"
                onClick={() => setShowClienteModal(true)}
              >
                <UserPlus size={18} />
              </button>

              {showAutocomplete && filteredClientes.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
                  {filteredClientes.map((c, i) => (
                    <li
                      key={c.value}
                      className={`p-2 cursor-pointer ${
                        i === highlightedIndex ? "bg-indigo-100" : ""
                      }`}
                      onMouseDown={() => {
                        setValue("cliente_id", Number(c.value));
                        setClienteSearch(c.label);
                        setShowAutocomplete(false);
                      }}
                    >
                      {c.label} {c.cedula && `- ${c.cedula}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              type="hidden"
              {...register("cliente_id", { valueAsNumber: true })}
            />
            {errors.cliente_id && (
              <p className="text-red-500 text-xs mt-1">
                {errors.cliente_id.message}
              </p>
            )}
          </div>

          {/* ===== ARTÍCULOS ===== */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Artículos *
            </label>

            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Buscar artículo..."
              value={articuloSearch}
              onChange={(e) => setArticuloSearch(e.target.value)}
            />

            {articuloSearch && (
              <ul className="border rounded mt-1 bg-white max-h-40 overflow-y-auto">
                {productosOptions
                  .filter(
                    (p) =>
                      p.label
                        .toLowerCase()
                        .includes(articuloSearch.toLowerCase()) &&
                      !selectedArticulos.some(
                        (a) => a.codigo === p.value
                      )
                  )
                  .map((p) => (
                    <li
                      key={p.value}
                      className="p-2 cursor-pointer hover:bg-indigo-100"
                      onMouseDown={() => {
                        setSelectedArticulos([
                          ...selectedArticulos,
                          { codigo: p.value, nombre: p.label },
                        ]);
                        setArticuloSearch("");
                        setValue("articulo", p.label);
                      }}
                    >
                      {p.value} - {p.label}
                    </li>
                  ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {selectedArticulos.map((a, idx) => (
                <span
                  key={a.codigo}
                  className="bg-indigo-100 px-2 py-1 rounded text-sm"
                >
                  {a.codigo} - {a.nombre}
                  <button
                    type="button"
                    className="ml-2 text-red-500"
                    onClick={() =>
                      setSelectedArticulos(
                        selectedArticulos.filter((_, i) => i !== idx)
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <FormInput
            label="Valor crédito"
            type="number"
            {...register("valor_credito", { valueAsNumber: true })}
          />
          <FormInput
            label="Fecha inicial"
            type="date"
            {...register("fecha_inicial")}
          />
          <FormInput
            label="Fecha final"
            type="date"
            {...register("fecha_final")}
          />
        </div>

        {/* ================= FOOTER FIJO ================= */}
        <div className="pt-4 mt-4 border-t flex justify-end gap-3 bg-white">
          <Button type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {initialData?.id ? "Guardar" : "Crear"}
          </Button>
        </div>
      </form>

      {/* ================= MODAL CLIENTE ================= */}
      {showClienteModal && (
        <ModalVentana
          isOpen={showClienteModal}
          onClose={() => setShowClienteModal(false)}
          title="Agregar Cliente"
        >
          <ClientesForm
            onSuccess={async (nuevo: any) => {
              setShowClienteModal(false);
              const clientes = await getClientes();
              setClientesOptions(
                clientes.map((c: any) => ({
                  value: String(c.id),
                  label: c.nombre,
                  cedula: c.cedula || "",
                }))
              );
              setValue("cliente_id", nuevo.id);
              setClienteSearch(nuevo.nombre);
            }}
            onCancel={() => setShowClienteModal(false)}
          />
        </ModalVentana>
      )}
    </>
  );
}

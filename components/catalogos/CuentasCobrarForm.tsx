
"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "../ui/button";
import { UserPlus } from "lucide-react";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";

import { getClientes, createCliente } from "../services/clientesServices"; // asume tienes servicio clientes
import ModalVentana from "../ui/ModalVentana";
import ClientesForm from "./ClientesForm";
import { createCredito, getCreditoById, updateCredito } from "../services/cuentasCobrarService";
import { getProductos } from "../services/productosService";

const schema = z.object({
  cliente_id: z.number().int().positive(),
  articulo_id: z.number().int().positive().optional(),
  articulo: z.string().min(1),
  valor_credito: z.number().positive(),
  fecha_inicial: z.string().optional(),
  fecha_final: z.string().optional(),
});

type FormData = z.infer<typeof schema> & { id?: number };

interface Props {
  initialData?: Partial<FormData> | null;
  onSaved: () => void;
  onCancel: () => void;
}

export default function CuentasCobrarForm({ initialData = null, onSaved, onCancel }: Props) {
  const { register, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cliente_id: 0, articulo_id: undefined, articulo: "", valor_credito: 0, fecha_inicial: "", fecha_final: "" }
  });

  const [clientesOptions, setClientesOptions] = useState<{ value: string; label: string; cedula?: string }[]>([]);
  const [clienteSearch, setClienteSearch] = useState("");
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [clientesFull, setClientesFull] = useState<any[]>([]);
  const [productosOptions, setProductosOptions] = useState<{ value: string; label: string; nombre?: string }[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Función para quitar tildes/acentos
  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  let filteredClientes = clientesOptions;
  if (clienteSearch.trim().length > 0) {
    const searchNorm = normalizeText(clienteSearch);
    filteredClientes = clientesOptions.filter(c =>
      normalizeText(c.label).includes(searchNorm) ||
      (c.cedula && normalizeText(c.cedula).includes(searchNorm))
    );
  }
  useEffect(() => {
    (async () => {
      // load clientes for select
      try {
        const clientes = await getClientes();
        setClientesFull(clientes || []);
        const opts = (clientes || []).map((c:any) => ({
          value: String(c.id),
          label: c.nombre || c.nombre_completo || c.nombre_cliente || `Cliente ${c.id}`,
          cedula: c.cedula || c.documento || c.numero_documento || ""
        }));
        setClientesOptions(opts);
        // No seleccionar automáticamente el primer cliente, dejar que el usuario elija

        // Filtrado de clientes por nombre o cédula (debe estar antes del return)
        
      } catch (e) {
        // ignore
      }

      // cargar productos para seleccionar artículo
      try {
        const resp = await getProductos(1, 100, "", "");
        const productosList = resp?.data || [];
        const pOpts = (productosList || []).map((p:any) => ({ value: String(p.id), label: String(p.nombre ?? `Producto ${p.id}`), nombre: String(p.nombre ?? "") }));
        setProductosOptions(pOpts);
        if (productosList && productosList.length > 0 && !initialData) {
          // si no hay artículo seleccionado por defecto, dejar el primero
          setValue("articulo_id", Number(pOpts[0].value));
          setValue("articulo", pOpts[0].nombre ?? pOpts[0].value);
        }
      } catch (err) {
        // ignore
      }

      if (initialData?.id) {
        // reload full item
        const full = await getCreditoById(Number(initialData.id));
        reset({
            cliente_id: full.cliente_id,
            articulo_id: full.articulo_id ?? undefined,
            articulo: full.articulo,
            valor_credito: Number(full.valor_credito),
            fecha_inicial: full.fecha_inicial ?? "",
            fecha_final: full.fecha_final ?? ""
          });
      } else if (initialData) {
        reset(initialData as any);
      }
    })();
  }, [initialData, reset, setValue]);

  const onSubmit = async (data: FormData) => {
    console.log("[CuentasCobrarForm] onSubmit start", { data, isSubmitting, initialData });
    try {
      if (initialData?.id) {
        console.log("[CuentasCobrarForm] updating credito id=", initialData.id, data);
        const updated = await updateCredito(initialData.id, data);
        console.log("[CuentasCobrarForm] update response:", updated);
      } else {
        // Asegurarnos que `articulo` sea string antes de enviarlo
        const safeData = { ...data, articulo: data.articulo ? String(data.articulo) : "" };
        console.log("[CuentasCobrarForm] submit payload:", safeData);
        const created = await createCredito(safeData as any);
        console.log("[CuentasCobrarForm] create response:", created);
      }

      // Aguardar a que la acción de la página (cerrar modal, recargar) concluya y capturar errores
      try {
        await onSaved();
      } catch (err2) {
        console.error("[CuentasCobrarForm] onSaved error:", err2);
      }
    } catch (err: any) {
      console.error("[CuentasCobrarForm] error", err);
      // Mostrar mensaje más descriptivo si viene del servidor
      const msg = err?.response?.data?.message || err?.message || "Error al guardar";
      alert(msg);
    }
  };

  const clienteId = watch("cliente_id");
  // Mostrar en el input el nombre del cliente seleccionado, o el texto de búsqueda si está escribiendo
  const selectedCliente = clientesOptions.find(c => Number(c.value) === Number(clienteId));
  const inputValue = selectedCliente && clienteSearch === "" ? `${selectedCliente.label}${selectedCliente.cedula ? ` - ${selectedCliente.cedula}` : ''}` : clienteSearch;

  // Nueva función para manejar la selección de un cliente de la lista de sugerencias
  const handleClienteSelect = (cliente: typeof clientesOptions[0]) => {
    setValue("cliente_id", Number(cliente.value));
    setClienteSearch(cliente.label);
    setShowAutocomplete(false);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit, (errs) => {
          console.log("[CuentasCobrarForm] validation errors:", errs);
        })}
        className="space-y-4"
      >
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente <span className="text-red-500">*</span></label>
          <div
            className="relative flex flex-col gap-2"
            onKeyDown={(e) => {
              if (filteredClientes.length === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex(prev => (prev < filteredClientes.length - 1 ? prev + 1 : prev));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
              } else if (e.key === "Enter" && showAutocomplete) {
                e.preventDefault();
                handleClienteSelect(filteredClientes[highlightedIndex]);
              } else if (e.key === "Escape") {
                setShowAutocomplete(false);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowAutocomplete(false), 200);
            }}
          >
            <div className="flex items-center">
              <input
                type="text"
                className="w-full border rounded px-3 py-2 text-sm pr-10"
                placeholder="Buscar por nombre o cédula..."
                value={clienteSearch}
                onChange={e => {
                  const val = e.target.value;
                  setClienteSearch(val);
                  setShowAutocomplete(true);
                  setHighlightedIndex(0);
                  if (!val.trim()) {
                    setValue("cliente_id", 0);
                    return;
                  }
                  const valNorm = normalizeText(val);
                  const match = clientesOptions.find(c => {
                    // Coincidencia exacta por nombre o por cédula
                    return normalizeText(c.label) === valNorm ||
                      (c.cedula && normalizeText(c.cedula) === valNorm);
                  });
                  if (match) {
                    setValue("cliente_id", Number(match.value));
                  } else {
                    setValue("cliente_id", 0);
                  }
                }}
                onFocus={() => {
                  if (clienteSearch.trim() || !clienteId) {
                    setShowAutocomplete(true);
                  }
                }}
                autoComplete="off"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 p-1"
                title="Nuevo Cliente"
                onClick={() => setShowClienteModal(true)}
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
            {showAutocomplete && clienteSearch.trim() !== "" && filteredClientes.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto top-full mt-1">
                {filteredClientes.map((c, index) => (
                  <li
                    key={c.value}
                    className={`p-2 text-sm cursor-pointer ${index === highlightedIndex ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}
                    onMouseDown={() => handleClienteSelect(c)}
                  >
                    {c.label} {c.cedula ? `- ${c.cedula}` : ""}
                  </li>
                ))}
              </ul>
            )}
            {showAutocomplete && clienteSearch.trim() !== "" && filteredClientes.length === 0 && (
              <div className="p-2 text-sm text-gray-500 bg-white border border-gray-300 rounded-md shadow-lg absolute z-10 w-full top-full mt-1">
                No se encontraron clientes.
              </div>
            )}
            <input type="hidden" {...register("cliente_id", { valueAsNumber: true })} />
            {errors.cliente_id && (
              <p className="text-red-500 text-xs mt-1">El cliente es obligatorio.</p>
            )}
          </div>
        </div>
      <FormSelect
        label="Artículo"
        name="articulo_id"
        value={String(watch("articulo_id") ?? "")}
        onChange={(e:any) => {
          const val = e.target.value;
          setValue("articulo_id", Number(val));
          // también setear nombre legible en `articulo`
          const found = productosOptions.find(p => p.value === String(val));
          setValue("articulo", found?.nombre ?? String(val));
        }}
        options={productosOptions}
      />
      {/* field oculto para `articulo` (nombre) - registrado para validación y envío */}
      <input type="hidden" {...register("articulo")} />
      <FormInput label="Valor crédito" type="number" {...register("valor_credito", { valueAsNumber: true })} />
      <FormInput label="Fecha inicial" type="date" {...register("fecha_inicial")} />
      <FormInput label="Fecha final" type="date" {...register("fecha_final")} />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>{initialData?.id ? "Guardar" : "Crear"}</Button>
      </div>
    </form>

    {/* Modal para agregar cliente */}
    {showClienteModal && (
      <ModalVentana isOpen={showClienteModal} onClose={() => setShowClienteModal(false)} title="Agregar Cliente">
        <ClientesForm
          onSuccess={async (nuevoCliente: any) => {
            setShowClienteModal(false);
            // Recargar clientes y seleccionar el nuevo
            const clientes = await getClientes();
            setClientesFull(clientes || []);
            const opts = (clientes || []).map((c:any) => ({ value: String(c.id), label: c.nombre || c.nombre_completo || c.nombre_cliente || `Cliente ${c.id}`, cedula: c.cedula || c.documento || "" }));
            setClientesOptions(opts);
            setClienteSearch("");
            setValue("cliente_id", nuevoCliente?.id);
          }}
          onCancel={() => setShowClienteModal(false)}
        />
      </ModalVentana>
    )}
  </>
  );
}

// components/precios/PreciosForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormInput from "../common/form/FormInput";
import FormSelect from "../common/form/FormSelect";
import Button from "../ui/button";

// 🔑 Importamos los tipos de Precios (y Product, si es necesario para el selector)
import { 
    PrecioConProducto, 
    CreatePrecioData, 
    UpdatePrecioData 
} from "../services/preciosService";
import { getProductos, Producto } from "../services/productosService";
import { formatCurrency } from "../../utils/formatters"; 

// 🎯 Tipado para los datos del formulario de Precios
type FormData = CreatePrecioData & { id?: number };

interface Props {
  initialData?: Partial<PrecioConProducto> | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  formError?: string;
}

export default function PreciosForm({ initialData, onSubmit, onCancel, formError }: Props) {
    const {
        handleSubmit,
        formState: { isSubmitting },
        setValue,
        watch,
        reset,
    } = useForm<FormData>({
        defaultValues: {
            id: initialData?.id || undefined,
            productoId: initialData?.productoId || (initialData as any)?.producto?.id || 0,
            valor_unitario: initialData?.valor_unitario ?? 0,
            descuento_porcentaje: initialData?.descuento_porcentaje ?? 0,
            fecha_inicio: initialData?.fecha_inicio || new Date().toISOString().substring(0, 10), // Fecha actual por defecto
            fecha_fin: initialData?.fecha_fin || "",
        },
    });

    const formValues = watch();

    // Estado para la lista de productos disponibles para asignar precios
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loadingLookups, setLoadingLookups] = useState(false);

    // 💡 Lógica para cargar productos (necesario para el selector)
    useEffect(() => {
        const loadProductos = async () => {
            setLoadingLookups(true);
            try {
                // 🔑 Usamos getProductos en modo "all" o con una búsqueda limitada para el selector
                // NOTA: Es mejor crear un `getProductosLookup` en el servicio para evitar traer todos los datos.
                const { data } = await getProductos(1, 100, "", ""); 
                setProductos(data);

                const isEditing = Boolean(initialData?.id);
                let defaultProductoId = isEditing
                    ? initialData?.productoId || (initialData as any)?.producto?.id
                    : data.length > 0 ? data[0].id : 0;
                
                // Si es edición, asegúrate de que el producto del initialData esté seleccionado
                if (initialData && initialData.productoId && defaultProductoId === 0) {
                    defaultProductoId = initialData.productoId;
                }

                // Resetear el formulario con los valores iniciales y los defaults
                reset({
                    id: initialData?.id ?? undefined,
                    productoId: defaultProductoId,
                    valor_unitario: initialData?.valor_unitario ?? 0,
                    descuento_porcentaje: initialData?.descuento_porcentaje ?? 0,
                    fecha_inicio: initialData?.fecha_inicio || new Date().toISOString().substring(0, 10),
                    fecha_fin: initialData?.fecha_fin || "",
                });

            } catch (error) {
                console.error("Error al cargar productos para lookup:", error);
            } finally {
                setLoadingLookups(false);
            }
        };

        loadProductos();
    }, [initialData, reset]);


    const submitForm: SubmitHandler<FormData> = (data) => {
        // Aseguramos que los números se envíen limpios
        data.valor_unitario = Number(String(data.valor_unitario).replace(/[^\d]/g, ""));
        data.descuento_porcentaje = Number(data.descuento_porcentaje || 0);
        
        // Convertimos el productoId a número
        data.productoId = Number(data.productoId);

        onSubmit(data);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const isIdField = name === "productoId";

        // Lógica de formateo para el Precio
        if (name === "valor_unitario") {
            const numericValue = value.replace(/[^\d]/g, "");
            const numberValue = Number(numericValue || 0);
            setValue(name as keyof FormData, numberValue as any, { shouldValidate: true });
            return;
        }
        
        // Lógica de formateo para el Descuento (mantener como número si es tipo number)
        if (name === "descuento_porcentaje") {
            const numberValue = Number(value || 0);
            // Limitar descuento entre 0 y 100
            const finalValue = Math.min(100, Math.max(0, numberValue));
            setValue(name as keyof FormData, finalValue as any, { shouldValidate: true });
            return;
        }

        const parsedValue = type === "number" || isIdField ? Number(value) : value;
        setValue(name as keyof FormData, parsedValue as any, { shouldValidate: true });
    };

    const productoOptions = productos.map((p) => ({
        value: String(p.id),
        label: `${p.codigo} - ${p.nombre}`,
    }));
    
    // Cálculo de precio final para mostrar en el formulario
    const valorUnitario = Number(formValues.valor_unitario || 0);
    const descuento = Number(formValues.descuento_porcentaje || 0);
    const precioFinal = valorUnitario * (1 - descuento / 100);

    // Precio/costo del producto seleccionado (readonly)
    const selectedProducto = productos.find(p => Number(p.id) === Number(formValues.productoId));
    const costoProducto = Number(selectedProducto?.precio ?? 0);

    return (
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
            
            {/* Fila 1: Selector de Producto, Costo (readonly) y Precio Base */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 🔑 Selector de Producto: Solo si es Creación o si se permite cambiar la asignación */}
                <FormSelect
                    label="Producto a Asignar"
                    name="productoId"
                    value={String(formValues.productoId)}
                    onChange={handleChange}
                    options={productoOptions}
                    disabled={loadingLookups || Boolean(initialData?.id)} // 🛑 Deshabilitar en Edición
                    required
                />
                {/* Costo del producto (readonly) */}
                <FormInput
                    label="Costo (producto)"
                    name="costo_producto"
                    type="text"
                    value={formatCurrency(costoProducto)}
                    disabled
                />
                
                <FormInput
                    label="Valor Unitario (Precio Base)"
                    name="valor_unitario"
                    type="text" 
                    value={formatCurrency(valorUnitario)} // Muestra formateado
                    onChange={handleChange}
                    placeholder="$100,000"
                    required
                />
            </div>

            {/* Fila 2: Descuento y Precio Final Calculado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Descuento (%)"
                    name="descuento_porcentaje"
                    type="number"
                    value={String(formValues.descuento_porcentaje || 0)}
                    onChange={handleChange}
                    placeholder="0"
                    min={0}
                    max={100}
                />
                 <FormInput
                    label="Precio Final Calculado"
                    name="precio_final_display"
                    type="text"
                    value={formatCurrency(precioFinal)}
                    disabled // Es un campo de solo lectura (calculado)
                    placeholder="$100,000"
                />
            </div>

            {/* Fila 3: Vigencia (Fechas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Fecha de Inicio de Vigencia"
                    name="fecha_inicio"
                    type="date"
                    value={formValues.fecha_inicio}
                    onChange={handleChange}
                    required
                />
                <FormInput
                    label="Fecha de Fin de Vigencia (Opcional)"
                    name="fecha_fin"
                    type="date"
                    value={formValues.fecha_fin || ""}
                    onChange={handleChange}
                    // No es requerido, por lo que puede ser vacío.
                />
            </div>
            
            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting || loadingLookups}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || loadingLookups}>
                    {initialData?.id ? "Actualizar Precio" : "Asignar Precio"}
                </Button>
            </div>
            {formError && (
                <div className="text-red-600 text-sm mt-2 text-center">{formError}</div>
            )}
        </form>
    );
}
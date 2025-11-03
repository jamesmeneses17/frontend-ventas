// components/catalogos/ProductosForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
// IMPORTACIONES CORREGIDAS
import FormInput from "../common/form/FormInput"; // Usamos el nombre FormInput que proporcionaste
import FormSelect from "../common/form/FormSelect"; // Usamos el nombre FormSelect que proporcionaste
import Button from "../ui/button"; // Asumo que el botón es una importación UI estándar

import { Producto, CreateProductoData } from "../services/productosService";
import { getCategorias, Categoria } from "../services/categoriasService"; 
import { getEstados, Estado } from "../services/estadosService"; 

// Definición de las propiedades esperadas por el formulario
type FormData = CreateProductoData & { id?: number };

interface Props {
  initialData?: Partial<Producto> | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export default function ProductosForm({ initialData, onSubmit, onCancel }: Props) {
  const { 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    setValue, // Usaremos setValue para cambiar el estado
    watch, // Usaremos watch para obtener los valores actuales y pasarlos a 'value'
  } = useForm<FormData>({
    defaultValues: {
      id: initialData?.id || undefined,
      nombre: initialData?.nombre || "",
      codigo: initialData?.codigo || "",
      precio: (initialData as any)?.precio ?? 0, 
      stock: (initialData as any)?.stock ?? 0,  
      descripcion: initialData?.descripcion || "",
      ficha_tecnica_url: initialData?.ficha_tecnica_url || "",
      categoriaId: initialData?.categoriaId || 0, 
      estadoId: initialData?.estadoId || 1,        
    },
  });

  // Observa todos los campos para pasarlos como 'value' a los componentes manuales
  const formValues = watch(); 

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]); 
  const [loadingLookups, setLoadingLookups] = useState(false);

  // Carga de datos de Lookup (Categorías y Estados)
  useEffect(() => {
    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const [catResponse, estResponse] = await Promise.all([
          getCategorias(), 
          getEstados(),    
        ]);
        
        setCategorias(catResponse);
        setEstados(estResponse);

        // Aseguramos que los IDs de selección se establezcan
        if (initialData?.categoriaId) setValue('categoriaId', initialData.categoriaId);
        if (initialData?.estadoId) setValue('estadoId', initialData.estadoId);
        
      } catch (error) {
        console.error("Error al cargar datos de lookup:", error);
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, [initialData, setValue]);

  const submitForm: SubmitHandler<FormData> = (data) => {
    onSubmit(data);
  };
  
  // Función genérica de manejo de cambio para FormInput/FormSelect
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // RHF necesita el tipo correcto, así que manejamos la conversión a Number si es necesario
    const parsedValue = (type === 'number' || name === 'categoriaId' || name === 'estadoId') 
      ? Number(value) 
      : value;
      
    // Usar setValue en lugar de useState para que RHF se mantenga al día
    setValue(name as keyof FormData, parsedValue as any, { shouldValidate: true });
  };


  const categoriaOptions = categorias.map(c => ({ 
    value: String(c.id), // FormSelect espera valores string
    label: c.nombre 
  }));
  const estadoOptions = estados.map(e => ({ 
    value: String(e.id), // FormSelect espera valores string
    label: e.nombre 
  }));


return (
  <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
    {/* Fila 1: Nombre y Código */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormInput
        label="Nombre del Producto"
        name="nombre"
        value={formValues.nombre} // Usa watch
        onChange={handleChange} // Usa la función genérica
        placeholder="Ej: Teclado Mecánico RGB"
        // NO podemos usar errors.nombre?.message directamente sin el register
        // pero podemos pasar un error simulado si es necesario
        // error={errors.nombre?.message} 
        required 
      />
      <FormInput
        label="Código"
        name="codigo"
        value={formValues.codigo} // Usa watch
        onChange={handleChange} // Usa la función genérica
        placeholder="TEC-RGB-001"
        required
      />
    </div>

    {/* Fila 2: Categoría y Estado */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormSelect
        label="Categoría"
        name="categoriaId"
        value={String(formValues.categoriaId)} // Convierte a String para el componente
        onChange={handleChange}
        options={categoriaOptions}
        disabled={loadingLookups}
        required
      />
      <FormSelect
        label="Estado"
        name="estadoId"
        value={String(formValues.estadoId)} // Convierte a String para el componente
        onChange={handleChange}
        options={estadoOptions}
        disabled={loadingLookups}
        required
      />
    </div>

    {/* Fila 3: Precio y Stock */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormInput
        label="Precio"
        name="precio"
        type="number"
        value={String(formValues.precio)} // Convierte a String para el input
        onChange={handleChange}
        placeholder="180.00"
        required
      />
      <FormInput
        label="Stock"
        name="stock"
        type="number"
        value={String(formValues.stock)} // Convierte a String para el input
        onChange={handleChange}
        placeholder="45"
        required
      />
    </div>

    {/* Fila 4: Descripción */}
    {/* NOTA: Ya que no tenemos FormTextArea en los componentes de catálogo,
       podemos usar un FormInput con type="textarea" si lo implementaste así, 
       o simplemente usar el <textarea> nativo si es como lo hiciste en ContactForm. 
       Aquí uso FormInput, asumiendo que FormInput soporta type="textarea" */}
    <FormInput
      label="Descripción"
      name="descripcion"
      type="textarea"
      value={formValues.descripcion}
      onChange={handleChange}
      placeholder="Una descripción breve del producto."
    />

    {/* Fila 5: URL Ficha Técnica */}
    <FormInput
      label="URL Ficha Técnica (Opcional)"
      name="ficha_tecnica_url"
      value={formValues.ficha_tecnica_url || ""}
      onChange={handleChange}
      placeholder="https://ejemplo.com/ficha.pdf"
    />

    {/* Botones */}
    <div className="flex justify-end gap-3 pt-4">
      <Button 
        type="button" 
        onClick={onCancel} 
        disabled={isSubmitting || loadingLookups}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting || loadingLookups}
      >
        {initialData?.id ? "Guardar Cambios" : "Crear Producto"}
      </Button>
    </div>
  </form>
);
}

import { createSlug } from './slug'; 


export interface BaseProductType {
    id: number;
    nombre: string;
    precios?: { valor_unitario: string | number }[]; 
    inventario?: { stock: number }[];
}


export interface ProductCardData {
    id: number;
    nombre: string; // Mantener el nombre original para ser pasado al componente
    displayPrice: string; // El precio formateado para mostrar
    numericPrice: number; // El precio en número para ordenamiento
    imageSrc: string; // La URL de la imagen (mapeada)
    href: string; // El enlace al detalle del producto
    brand: string;
    rating: number;
    stock: number; 
}


// --- 2. Utilidades de Formato y Mapeo ---


export const mapProductToImage = (nombre: string): string => {
    // Utilizamos createSlug para una comparación más robusta (insensible a mayúsculas/espacios)
    const slug = createSlug(nombre); 
    switch (true) {
        case slug.includes("panel"): return "/images/panel.webp";
        case slug.includes("bateria"): return "/images/bateria.webp";
        case slug.includes("controlador"): return "/images/controladores.webp";
        case slug.includes("inversor"): return "/images/inversor.webp";
        default: return "/images/imagen.webp";
    }
};


export const formatPrice = (priceStr: string | number | undefined): string => {
    const priceNum = parseFloat(String(priceStr || 0));
    if (isNaN(priceNum) || priceNum === 0) { return "Consultar Precio"; }
    return priceNum.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    });
};


export const getNumericPrice = (priceStr: string | number | undefined): number => {
    return parseFloat(String(priceStr || 0));
}
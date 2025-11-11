
import { createSlug } from './slug'; 


export interface BaseProductType {
    id: number;
    nombre: string;
	precios?: { valor_unitario: string | number; descuento_porcentaje?: number; descuento?: number; valor_final?: number }[];
	inventario?: { stock: number }[];
	// La API puede devolver `categoria` como objeto o string
	categoria?: any;
	// Posible campo de ventas si el backend lo entrega
	ventas?: number;
	sales?: number;
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
	categoria?: string;
	discountPercent?: number;
	salesCount?: number;
    /** Estado calculado de stock: 'Disponible' | 'Stock Bajo' | 'Agotado' */
    stockStatus?: string;
}


// --- 2. Utilidades de Formato y Mapeo ---


// Imágenes de respaldo para asignar cuando no hay coincidencias por nombre
const fallbackImages = [
	"/images/panel.webp",
	"/images/bateria.webp",
	"/images/controladores.webp",
	"/images/iluminacion-solar.webp",
];

/**
 * Mapear un producto a una imagen.
 * - Si el nombre contiene palabras clave (panel, bateria, controlador, inversor) usa imágenes específicas.
 * - Si no coincide, usa la imagen del array `fallbackImages` elegido por el `id` (si se proporciona) para variar las miniaturas.
 */
export const mapProductToImage = (nombre: string, id?: number): string => {
	// Utilizamos createSlug para una comparación más robusta (insensible a mayúsculas/espacios)
	const slug = createSlug(nombre);
	if (slug.includes("panel")) return "/images/panel.webp";
	if (slug.includes("bateria")) return "/images/bateria.webp";
	if (slug.includes("controlador")) return "/images/controladores.webp";
	if (slug.includes("inversor")) return "/images/inversor.webp";

	// Si no hay coincidencias por nombre, asignar una imagen de fallback basada en el id
	if (typeof id === "number" && !isNaN(id)) {
		const idx = Math.abs(id) % fallbackImages.length;
		return fallbackImages[idx];
	}

	// Valor por defecto
	return "/images/imagen.webp";
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
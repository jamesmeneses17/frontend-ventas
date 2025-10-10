// /utils/slug.ts

/**
 * Convierte una cadena (nombre) en un slug (URL amigable) eliminando tildes,
 * caracteres especiales y reemplazando espacios por guiones.
 * @param text La cadena a convertir (ej: "Paneles Solares").
 * @returns El slug (ej: "paneles-solares").
 */
export const createSlug = (text: string): string => {
    return text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Elimina tildes (ej: á -> a)
        .trim() // Elimina espacios al inicio/fin
        .replace(/[^\w\s-]/g, '') // Elimina caracteres no alfanuméricos (excepto guiones y espacios)
        .replace(/\s+/g, '-'); // Reemplaza espacios múltiples por un solo guión
};
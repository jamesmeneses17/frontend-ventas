// /hooks/useProductListLogic.ts

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProductos } from '@/components/services/productosService'; 
import {
    BaseProductType,
    ProductCardData,
    getNumericPrice,
    formatPrice,
    mapProductToImage,
} from '@/utils/ProductUtils'; 

// --- Tipos de Ordenamiento (Exportable) ---
export type SortOption = 'relevancia' | 'precio-asc' | 'precio-desc';

/**
 * Hook personalizado para manejar el estado, la obtención y el ordenamiento de la lista de productos.
 * @param initialSort Opción de ordenamiento inicial.
 * @returns {object} Estado y funciones de mutación para la lista de productos.
 */
export const useProductListLogic = (initialSort: SortOption = 'relevancia') => {
    // 1. Obtención de Parámetros de URL
    const searchParams = useSearchParams();
    const subcategoriaIdParam = searchParams.get('subcategoriaId');
    const categoriaIdParam = searchParams.get('categoriaId');

    // 2. Estados Locales
    const [productos, setProductos] = useState<BaseProductType[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState<SortOption>(initialSort);

    // 3. Efecto para Cargar Productos
    useEffect(() => {
        setLoading(true);
        const fetchProductos = async () => {
            try {
                // Parsear IDs de los parámetros de URL
                const subId = subcategoriaIdParam ? parseInt(subcategoriaIdParam, 10) : undefined;
                const catId = categoriaIdParam ? parseInt(categoriaIdParam, 10) : undefined;
                
                // Llamada al servicio de productos
                // Pasamos subcategoriaId y categoriaId en los parámetros opcionales del servicio
                // y solicitamos un size amplio para la vista pública (traer muchos elementos)
                const response = await getProductos(1, 1000, "", "", subId, catId);

                // Nota: Algunos backends no aplican correctamente el filtro por categoría en el endpoint.
                // Para asegurar que la UI muestre únicamente los productos de la categoría seleccionada,
                // aplicamos un filtro en el cliente si `catId` o `subId` están presentes.
                let fetched = response.data || [];
                if (typeof catId !== 'undefined') {
                    const cid = Number(catId);
                    fetched = fetched.filter((p: any) => {
                        // El backend puede devolver `categoriaId` directo o un objeto `categoria`.
                        if (typeof p.categoriaId !== 'undefined') return Number(p.categoriaId) === cid;
                        if (p.categoria && typeof p.categoria.id !== 'undefined') return Number(p.categoria.id) === cid;
                        // fallback: algunos modelos usan `categoria` como nombre o slug
                        return String(p.categoria)?.toLowerCase() === String(cid).toLowerCase();
                    });
                }
                if (typeof subId !== 'undefined') {
                    const sid = Number(subId);
                    fetched = fetched.filter((p: any) => Number(p.subcategoriaId || p.subCategoriaId || 0) === sid);
                }

                setProductos(fetched);
                setLoading(false);
            } catch (err) {
                console.error("Error al cargar productos:", err);
                setLoading(false);
            }
        };
        fetchProductos();
    }, [subcategoriaIdParam, categoriaIdParam]); // Dependencias para recargar si cambian los filtros de URL

    // 4. Mapeo y Ordenamiento (Memorizado)
    const displayedProducts = useMemo(() => {
        // Mapeo: Transformar datos de la API a formato de tarjeta
        let mappedProducts: ProductCardData[] = productos.map((p) => {
            const priceValue = p.precios?.[0]?.valor_unitario;
            
                return {
                id: p.id,
                nombre: p.nombre,
                displayPrice: formatPrice(priceValue), // Desde utils
                numericPrice: getNumericPrice(priceValue), // Desde utils
                    imageSrc: mapProductToImage(p.nombre, p.id), // Desde utils (ahora variamos por id si hace falta)
                href: `/producto/${p.id}`,
                brand: "DISEM SAS", // Valor fijo (mockeado)
                rating: 4.5, // Valor fijo (mockeado)
                stock: Number(p.inventario?.[0]?.stock) || 0,
            } as ProductCardData;
        });

        let sortedProducts = mappedProducts.slice(); // Clonar para ordenar

        // Lógica de Ordenamiento
        switch (sortOption) {
            case 'precio-asc':
                sortedProducts.sort((a, b) => {
                    // Lógica para que los productos con precio 0 (Consultar Precio) vayan al final
                    if (a.numericPrice === 0 && b.numericPrice !== 0) return 1;
                    if (b.numericPrice === 0 && a.numericPrice !== 0) return -1;
                    return a.numericPrice - b.numericPrice;
                });
                break;
            case 'precio-desc':
                // Ordenar del más caro al más barato
                sortedProducts.sort((a, b) => b.numericPrice - a.numericPrice);
                break;
            case 'relevancia':
            default:
                // Relevancia: mantener el orden por ID (asumiendo que es el orden por defecto de la API)
                sortedProducts.sort((a, b) => a.id - b.id);
                break;
        }

        return sortedProducts;
    }, [productos, sortOption]); // Recalcular solo si cambian los productos o la opción de orden

    // 5. Devolver la interfaz pública del hook
    return {
        displayedProducts,
        loading,
        sortOption,
        setSortOption,
    };
};
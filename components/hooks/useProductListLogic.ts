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
                const response = await getProductos(subId, catId);
                setProductos(response.data);
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
                imageSrc: mapProductToImage(p.nombre), // Desde utils
                href: `/producto/${p.id}`,
                brand: "DISEM SAS", // Valor fijo (mockeado)
                rating: 4.5, // Valor fijo (mockeado)
                stock: p.inventario?.[0]?.stock || 0,
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
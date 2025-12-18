// /hooks/useProductListLogic.ts

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProductos } from '@/components/services/productosService'; 
import { getPrecios } from '@/components/services/preciosService';
import {
    BaseProductType,
    ProductCardData,
    getNumericPrice,
    formatPrice,
    mapProductToImage,
    isImageUrl,
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
    const qParam = searchParams.get('q');

    // 2. Estados Locales
    const [productos, setProductos] = useState<BaseProductType[]>([]);
    const [preciosList, setPreciosList] = useState<any[]>([]);
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
                // Pasar el parámetro de búsqueda `qParam` al backend para que realice el filtrado
                const response = await getProductos(1, 1000, "", qParam ?? "", subId, catId);

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
                // Obtener precios/promociones para enriquecer los productos (si el endpoint está disponible)
                try {
                    const preciosRes = await getPrecios(1, 1000, "");
                    let preciosArray: any[] = [];
                    if (Array.isArray(preciosRes)) {
                        preciosArray = preciosRes as any[];
                    } else if (preciosRes && Array.isArray((preciosRes as any).data)) {
                        preciosArray = (preciosRes as any).data;
                    }
                    // Debug: mostrar cuantos precios trajimos y una muestra
                    console.debug('[useProductListLogic] preciosArray.length =', preciosArray.length);
                    if (preciosArray.length > 0) console.debug('[useProductListLogic] precios sample', preciosArray.slice(0, 8));
                    setPreciosList(preciosArray);
                } catch (e) {
                    // Si falla obtener precios, seguimos sin promociones
                    setPreciosList([]);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error al cargar productos:", err);
                setLoading(false);
            }
        };
        fetchProductos();
    }, [subcategoriaIdParam, categoriaIdParam, qParam]); // Dependencias para recargar si cambian los filtros de URL o la búsqueda

    // 4. Mapeo y Ordenamiento (Memorizado)
    const displayedProducts = useMemo(() => {
        // Filtrar productos inactivos (solo mostrar activos)
        const productosActivos = productos.filter((p) => p.activo === true);
        // Mapeo: Transformar datos de la API a formato de tarjeta
        let mappedProducts: ProductCardData[] = productosActivos.map((p) => {
            // Preferir precio activo/proyecto desde el servicio de `precios` si existe
            const precioEntry = preciosList.find(pr => Number(pr.productoId ?? pr.producto?.id) === Number(p.id));
            
            // OBTENER EL PRECIO ORIGINAL (precio_venta sin descuento)
            // Prioridad: precio_venta > precios[0].valor_final > precio > precio_costo
            const precioVentaOriginal =
                (p as any).precio_venta ??
                p.precios?.[0]?.valor_final ??
                p.precios?.[0]?.valor_unitario ??
                precioEntry?.valor_final ??
                precioEntry?.valor_unitario ??
                (p as any).precioVenta ??
                (p as any).precio ??
                (p as any).precio_costo;
            
            // OBTENER PORCENTAJE DE DESCUENTO
            // PRIORIDAD: promocion_porcentaje del producto > descuento en precios > otros campos
            const descuentoProducto = (p as any).promocion_porcentaje ?? (p as any).promocion;
            const descuentoPrecios = precioEntry?.descuento_porcentaje ?? precioEntry?.descuento;
            const descuentoArrayPrecios = p.precios?.[0]?.descuento_porcentaje ?? p.precios?.[0]?.descuento;
            
            // Usar el primer valor válido encontrado, priorizando promocion_porcentaje
            const discountValue = descuentoProducto ?? descuentoArrayPrecios ?? descuentoPrecios ?? 0;
            const parsedDiscount = Number(discountValue);
            const discountPercent = Number.isFinite(parsedDiscount) && parsedDiscount > 0 ? parsedDiscount : undefined;

            const stockNum = Number((p as any).stock ?? p.inventario?.[0]?.stock) || 0;
            const stockMin = Number((p as any).stockMinimo ?? (p as any).stockMin ?? 5);
            let stockStatus = 'Disponible';
            if (stockNum <= 0) stockStatus = 'Agotado';
            else if (stockNum <= stockMin) stockStatus = 'Stock Bajo';
            
            // CALCULAR PRECIO FINAL Y PRECIO ORIGINAL
            const precioVentaNumerico = getNumericPrice(precioVentaOriginal);
            let precioFinal: number;
            let originalPrice: string | undefined;
            
            if (discountPercent && discountPercent > 0) {
                // Si hay descuento: precio_venta es el ORIGINAL, calculamos el precio CON descuento
                precioFinal = precioVentaNumerico - (precioVentaNumerico * discountPercent / 100);
                originalPrice = formatPrice(precioVentaNumerico); // Precio original (tachado)
            } else {
                // Sin descuento: mostrar el precio de venta normal
                precioFinal = precioVentaNumerico;
                originalPrice = undefined;
            }

            return {
                id: p.id,
                nombre: p.nombre,
                displayPrice: formatPrice(precioFinal), // Precio CON descuento (o normal si no hay descuento)
                originalPrice: originalPrice, // Precio original SIN descuento (solo si hay promoción)
                numericPrice: precioFinal, // Para ordenamiento
                imageSrc: (() => {
                  // Prioridad: primera imagen del array imagenes[] > imagen_url antigua > fallback
                  if ((p as any).imagenes && Array.isArray((p as any).imagenes) && (p as any).imagenes.length > 0) {
                    const firstImage = (p as any).imagenes[0];
                    if (firstImage.url_imagen) return firstImage.url_imagen;
                  }
                  if ((p as any).imagen_url && isImageUrl((p as any).imagen_url)) {
                    return (p as any).imagen_url;
                  }
                  return (p as any).imageSrc || mapProductToImage(p.nombre, p.id);
                })(),
                href: `/users/especificaciones/${p.id}`,
                brand: "DISEM SAS",
                rating: 4.5,
                stock: stockNum,
                categoria: p.categoria?.nombre || p.categoria || undefined,
                discountPercent: discountPercent,
                salesCount: Number(p.ventas ?? p.sales ?? 0) || undefined,
                stockStatus,
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

        // Si existe un parámetro de búsqueda `q`, filtrar por nombre, marca o categoría
        if (qParam && qParam.trim().length > 0) {
            const q = String(qParam).toLowerCase();
            const filtered = sortedProducts.filter(p => {
                const name = String(p.nombre ?? '').toLowerCase();
                const brand = String(p.brand ?? '').toLowerCase();
                const category = String(p.categoria ?? '').toLowerCase();
                return (
                    name.includes(q) ||
                    brand.includes(q) ||
                    category.includes(q)
                );
            });
            return filtered;
        }

        return sortedProducts;
    }, [productos, sortOption, preciosList, qParam]); // Recalcular si cambian productos, precios, sort o parámetro de búsqueda

    // 5. Devolver la interfaz pública del hook
    return {
        displayedProducts,
        loading,
        sortOption,
        setSortOption,
    };
};
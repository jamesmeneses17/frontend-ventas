"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import SearchInput from './SearchInput'; // Componente de input que se reutiliza
import useDebounce from '../../hooks/useDebounce'; // Hook personalizado para el 'debounce'
import { SearchIcon, XIcon, TagIcon } from 'lucide-react'; // Íconos de lucide-react
import { CubeIcon } from '@heroicons/react/24/solid'; // Ícono para productos (asumiendo que tienes instalado @heroicons/react)
// NOTA: Asegúrate de que '@/utils/formatters' exista y contenga 'formatCurrency'
import { formatCurrency } from '@/utils/formatters'; 
import { getProductos } from '@/components/services/productosService';


// --- TIPOS DE DATOS ---

interface SearchResultItem {
    id: number | string;
    nombre: string;
    tipo: 'producto' | 'categoria';
    href: string;
    precio?: number; // Precio, solo si el resultado es un producto
}

// Llamada real a la API de productos usando el servicio disponible.
// Devuelve resultados de productos (no incluye categorías). Si quieres resultados mixtos
// (categorías + productos) añade una llamada a `categoriasService` similar.
const fetchSearchProducts = async (query: string, limit: number): Promise<SearchResultItem[]> => {
    if (!query || query.length < 2) return [];
    // getProductos(page, size, stockFiltro, searchTerm, subcategoriaId?, categoriaId?)
    const response = await getProductos(1, limit, "", query);
    const items = response?.data || [];
    const mapped: SearchResultItem[] = items.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        tipo: 'producto',
        href: `/users/especificaciones/${p.id}`,
        precio: typeof p.precio !== 'undefined' ? Number(p.precio) : undefined
    }));
    return mapped;
};

// ----------------------------------------------------------------------
// 3. Componente de Búsqueda con Desplegable
// ----------------------------------------------------------------------

interface SearchDropdownProps {
    placeholder: string;
    // Callback opcional para notificar el término de búsqueda al componente padre (debounced)
    onSearchTermChange?: (value: string) => void;
    // Callback opcional cuando el usuario hace submit (Enter o "Ver todos...")
    onSearchSubmit?: (value: string) => void;
    // Número máximo de resultados a mostrar en el desplegable
    maxResults?: number;
    // Tiempo de debounce en ms (por defecto 300)
    debounceMs?: number;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ 
    placeholder, 
    onSearchTermChange, 
    onSearchSubmit, 
    maxResults = 5, 
    debounceMs = 300 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const debouncedSearchTerm = useDebounce(searchTerm, debounceMs); 
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Lógica para realizar la búsqueda instantánea (API)
    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedSearchTerm.length < 2) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Llamada a la API real usando el servicio de productos
                const data = await fetchSearchProducts(debouncedSearchTerm, maxResults);
                setResults(data.slice(0, maxResults));
            } catch (error) {
                console.error("Error en la búsqueda instantánea:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedSearchTerm, maxResults]);

    // Ocultar resultados si se hace clic fuera del componente
    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsFocused(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    // Mostrar dropdown si está enfocado O si está cargando resultados
    const showDropdown = (isFocused || loading) && searchTerm.length > 0;

    useEffect(() => {
        if (onSearchTermChange) onSearchTermChange(debouncedSearchTerm);
    }, [debouncedSearchTerm, onSearchTermChange]);

    // Función para manejar la navegación a la página completa de resultados
    const handleFullSearch = () => {
        const term = debouncedSearchTerm.length > 0 ? debouncedSearchTerm : searchTerm;
        setIsFocused(false); // Esconde el dropdown
        
        if (onSearchSubmit) {
            onSearchSubmit(term);
            return;
        }
        // Redirigir a la página completa de resultados de búsqueda (usa el parámetro 'q')
        window.location.href = `/users/productos?q=${encodeURIComponent(term)}`;
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {/* Campo de Búsqueda */}
            <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder={placeholder}
                onFocus={() => setIsFocused(true)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFullSearch();
                    }
                }}
            />

            {/* Icono de borrado (Clear button) */}
            {searchTerm && (
                <button 
                    onClick={() => { setSearchTerm(''); setResults([]); setLoading(false); }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 z-10"
                    aria-label="Limpiar búsqueda"
                >
                    <XIcon className="h-5 w-5" />
                </button>
            )}

            {/* Desplegable de Resultados */}
            {showDropdown && (
                <div className="absolute z-50 mt-1 w-full rounded-lg shadow-2xl bg-white ring-1 ring-gray-200">
                    <div className="py-1">
                        
                        {loading && (
                            <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
                                {/* Animación de carga */}
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Buscando...
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <>
                                <p className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase">
                                    Resultados sugeridos
                                </p>
                                {results.map((item) => (
                                    <Link
                                        key={`${item.tipo}-${item.id}`}
                                        href={item.href}
                                        onClick={() => { setIsFocused(false); setSearchTerm(''); }}
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                                    >
                                        {/* Icono dinámico: CubeIcon para Producto, TagIcon para Categoría */}
                                        {item.tipo === 'producto' ? (
                                            <CubeIcon className="h-5 w-5 mr-3 text-amber-500" />
                                        ) : (
                                            <TagIcon className="h-5 w-5 mr-3 text-blue-500" />
                                        )}

                                        <span className="truncate">{item.nombre}</span>

                                        <div className="ml-auto flex items-center gap-3">
                                            {/* MOSTRAR PRECIO: Solo si es producto y tiene precio */}
                                            {item.tipo === 'producto' && item.precio !== undefined && (
                                                <span className="text-sm font-semibold text-gray-800">
                                                    {formatCurrency(item.precio)}
                                                </span>
                                            )}

                                            {/* Etiqueta de tipo */}
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                item.tipo === 'producto' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {item.tipo === 'producto' ? 'Producto' : 'Categoría'}
                                            </span>
                                        </div>
                                    </Link>
                                ))}

                                {/* Opción de Búsqueda Completa */}
                                <div className="border-t mt-1 pt-1">
                                    <button
                                        onClick={handleFullSearch}
                                        className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 flex items-center"
                                    >
                                        <SearchIcon className="h-4 w-4 mr-3" />
                                        Ver todos los resultados para "{searchTerm}"
                                    </button>
                                </div>
                            </>
                        )}

                        {/* No hay resultados */}
                        {!loading && results.length === 0 && debouncedSearchTerm.length >= 2 && (
                            <div className="px-4 py-3 text-sm text-gray-500">
                                No se encontraron coincidencias para "{searchTerm}".
                                <div className="border-t mt-3 pt-2">
                                     <button
                                        onClick={handleFullSearch}
                                        className="w-full text-left px-0 py-1 text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                        <SearchIcon className="h-4 w-4 mr-2" />
                                        Buscar de todos modos en el catálogo
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Mensaje de tip, solo si está enfocado y no ha escrito nada */}
                        {!loading && searchTerm.length < 2 && isFocused && (
                             <div className="px-4 py-3 text-sm text-gray-500">
                                Por favor, ingresa al menos 2 caracteres para iniciar la búsqueda.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;
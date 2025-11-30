"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import SearchInput from './SearchInput'; // Reutilizamos el componente SearchInput
import useDebounce from '../../hooks/useDebounce';
import { SearchIcon, XIcon, BoxIcon, TagIcon } from 'lucide-react'
import { CubeIcon } from '@heroicons/react/16/solid';


// --- TIPOS DE DATOS ---

// Tipo de resultado genérico
interface SearchResultItem {
    id: number | string;
    nombre: string;
    tipo: 'producto' | 'categoria';
    href: string;
}

// SIMULACIÓN: Esta función DEBE ser reemplazada por tu llamada API real
// que busque tanto en productos como en categorías.
// La simulación genera resultados falsos basados en el término de búsqueda.
const simulateSearchResults = async (query: string): Promise<SearchResultItem[]> => {
    if (query.length < 2) return [];
    
    // Simular retraso de API
    await new Promise(resolve => setTimeout(resolve, 300));

    const lowerQuery = query.toLowerCase();
    const results: SearchResultItem[] = [];

    // 1. Simulación de Productos
    if (lowerQuery.includes('panel')) {
        results.push({ id: 1, nombre: 'Panel Solar Monocristalino 500W', tipo: 'producto', href: '/producto/panel-500w' });
        results.push({ id: 2, nombre: 'Inversor Híbrido 3kW', tipo: 'producto', href: '/producto/inversor-3kw' });
    }
    
    // 2. Simulación de Categorías
    if (lowerQuery.includes('bate')) {
        results.push({ id: 101, nombre: 'Baterías de Litio', tipo: 'categoria', href: '/productos?categoriaId=101' });
    }

    if (results.length === 0) {
        // Fallback genérico para mostrar al menos algo si la API no devuelve nada
        results.push({ id: 99, nombre: `Producto Genérico relacionado con "${query}"`, tipo: 'producto', href: '/producto/generico' });
    }

    return results; // devolver todos y limitará el padre según `maxResults`
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

const SearchDropdown: React.FC<SearchDropdownProps> = ({ placeholder, onSearchTermChange, onSearchSubmit, maxResults = 8, debounceMs = 300 }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    // Hook para aplicar un retraso (debounce) a la búsqueda
    const debouncedSearchTerm = useDebounce(searchTerm, debounceMs); 
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Lógica para realizar la búsqueda cuando el término con debounce cambia
    useEffect(() => {
        const fetchResults = async () => {
            if (debouncedSearchTerm.length < 2) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // LLAMADA A LA API REAL AQUÍ (reemplazar simulateSearchResults)
                const data = await simulateSearchResults(debouncedSearchTerm);
                setResults(data.slice(0, maxResults));
            } catch (error) {
                console.error("Error en la búsqueda instantánea:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedSearchTerm]);

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

    const showDropdown = (isFocused || loading) && searchTerm.length > 0;

    // Notificar al componente padre con el término debounced (mejor para rendimiento)
    useEffect(() => {
        if (onSearchTermChange) onSearchTermChange(debouncedSearchTerm);
    }, [debouncedSearchTerm, onSearchTermChange]);

    // Función para manejar la navegación o submit de búsqueda
    const handleFullSearch = () => {
        const term = debouncedSearchTerm.length > 0 ? debouncedSearchTerm : searchTerm;
        if (onSearchSubmit) {
            onSearchSubmit(term);
            return;
        }
        // Por defecto: Redirigir a la página completa de resultados de búsqueda
        window.location.href = `/search?q=${encodeURIComponent(term)}`;
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {/* Campo de Búsqueda */}
            <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder={placeholder}
                onFocus={() => setIsFocused(true)}
                // Cuando se presiona Enter, forzar la búsqueda completa
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFullSearch();
                    }
                }}
            />

            {/* Icono de borrado (limpia el input y resetea resultados) */}
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
                                        {/* Icono dinámico */}
                                        {item.tipo === 'producto' ? (
                                            <CubeIcon className="h-4 w-4 mr-3 text-amber-500" />
                                        ) : (
                                            <TagIcon className="h-4 w-4 mr-3 text-blue-500" />
                                        )}
                                        
                                        <span className="truncate">{item.nombre}</span>
                                        
                                        {/* Etiqueta de tipo */}
                                        <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
                                            item.tipo === 'producto' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {item.tipo === 'producto' ? 'Producto' : 'Categoría'}
                                        </span>
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
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;
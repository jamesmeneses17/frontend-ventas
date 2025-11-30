// /components/common/SearchInput.tsx

import React, { useEffect, useState } from 'react';

interface SearchInputProps {
    // Compatibilidad: puede recibir `searchTerm` + `onSearchChange` (FilterBar)
    // o `value` + `onChange` (otras páginas que llamaban así).
    searchTerm?: string;
    onSearchChange?: (value: string) => void;

    value?: string;
    onChange?: (value: string) => void;

    placeholder?: string;
    // Tiempo en ms para debounce (por defecto 300ms). Si 0, sin debounce.
    debounceMs?: number;
    // Eventos adicionales que pueden necesitar los consumidores
    onFocus?: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function SearchInput({
    searchTerm,
    onSearchChange,
    value,
    onChange,
    placeholder = "Buscar...",
    debounceMs = 300,
    onFocus,
    onKeyDown,
}: SearchInputProps) {
    // Estado interno para input controlado localmente y debounce
    const initial = typeof searchTerm !== 'undefined' ? searchTerm : (typeof value !== 'undefined' ? value : '');
    const [inputValue, setInputValue] = useState<string>(initial);

    // Mantener sincronía si el prop externo cambia desde fuera
    useEffect(() => {
        const external = typeof searchTerm !== 'undefined' ? searchTerm : value;
        if (typeof external === 'string' && external !== inputValue) {
            setInputValue(external);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, value]);

    // Efecto para debounce y llamar al callback apropiado
    useEffect(() => {
        if (debounceMs <= 0) {
            // llamar inmediato
            if (onSearchChange) onSearchChange(inputValue);
            if (onChange) onChange(inputValue);
            return;
        }

        const t = setTimeout(() => {
            if (onSearchChange) onSearchChange(inputValue);
            if (onChange) onChange(inputValue);
        }, debounceMs);

        return () => clearTimeout(t);
    }, [inputValue, debounceMs, onSearchChange, onChange]);

    return (
        <div className="relative max-w-sm">
            <input
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={onFocus}
                onKeyDown={onKeyDown}
                className="p-2 pl-10 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
        </div>
    );
}
// /components/common/SearchInput.tsx

import React from 'react';

interface SearchInputProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchInput({ 
    searchTerm, 
    onSearchChange, 
    placeholder = "Buscar...", 
}: SearchInputProps) {
    return (
        // El max-w-sm es opcional, pero ayuda a que el buscador no ocupe todo el ancho.
        <div className="relative max-w-sm">
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                // Estilo para dejar espacio al icono (pl-10)
                className="p-2 pl-10 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {/* Icono de búsqueda (SVG) */}
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
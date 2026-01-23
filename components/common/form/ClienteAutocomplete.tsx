"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../services/apiConfig';

interface Cliente {
    id: number;
    nombre: string;
    numero_documento: string;
}

interface Props {
    onSelect: (cliente: Cliente) => void;
    // 1. Cambiamos el nombre de la prop aquí para que coincida con el uso
    initialValue?: string;
    placeholder?: string;
    disabled?: boolean;
}

// 2. Desestructuramos 'initialValue' en lugar de 'defaultValue'
export default function ClienteAutocomplete({
    onSelect,
    initialValue = "",
    placeholder = "Buscar cliente...",
    disabled = false
}: Props) {
    // 3. Ahora el estado puede usar 'initialValue' sin errores
    const [query, setQuery] = useState(initialValue);
    const [results, setResults] = useState<Cliente[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (query.length < 3) {
            setResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await axios.get(`${API_URL}/clientes?search=${query}`);
                setResults(res.data.data || res.data);
            } catch (err) {
                console.error("Error buscando clientes", err);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="relative w-full">
            <input
                type="text"
                className="form-input w-full border-gray-300 rounded-md shadow-sm text-sm"
                placeholder={placeholder}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                disabled={disabled}
            />

            {isOpen && results.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                    {results.map((c) => (
                        <li
                            key={c.id}
                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b last:border-0"
                            onClick={() => {
                                setQuery(`${c.nombre} (${c.numero_documento})`);
                                onSelect(c);
                                setIsOpen(false);
                            }}
                        >
                            <span className="font-bold">{c.nombre}</span>
                            <span className="block text-xs text-gray-500">{c.numero_documento}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
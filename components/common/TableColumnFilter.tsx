"use client";

import React, { useState, useMemo } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

interface Props {
    title: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export default function TableColumnFilter({ title, options, selected, onChange }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const buttonRef = React.useRef<HTMLDivElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const [placement, setPlacement] = useState<"bottom" | "top">("bottom");

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [options, searchTerm]);

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const handleSelectAll = () => {
        if (filteredOptions.length === 0) return;
        const allFilteredAreSelected = filteredOptions.every(opt => selected.includes(opt));

        if (allFilteredAreSelected) {
            onChange(selected.filter(s => !filteredOptions.includes(s)));
        } else {
            const newSelected = new Set(selected);
            filteredOptions.forEach(opt => newSelected.add(opt));
            onChange(Array.from(newSelected));
        }
    };

    const clearFilter = () => {
        onChange([]);
        setIsOpen(false);
    };

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const desiredHeight = 350; // Aproximado max-height

            // Decidir si mostrar arriba o abajo
            // Preferimos abajo, a menos que no quepa y arriba haya más espacio
            let showBelow = true;
            if (spaceBelow < desiredHeight && spaceAbove > spaceBelow) {
                showBelow = false;
            }

            const style: React.CSSProperties = {
                left: rect.left,
                width: 256, // w-64
            };

            if (showBelow) {
                style.top = rect.bottom;
                style.maxHeight = Math.min(desiredHeight, spaceBelow - 10);
                setPlacement("bottom");
            } else {
                style.bottom = window.innerHeight - rect.top;
                style.maxHeight = Math.min(desiredHeight, spaceAbove - 10);
                setPlacement("top");
            }

            setDropdownStyle(style);
        }
        setIsOpen(!isOpen);
    };

    // Portal content
    const Dropdown = (
        <>
            <div className="fixed inset-0 z-[9999]" onClick={() => setIsOpen(false)} />
            <div
                className={`fixed rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 z-[10000] focus:outline-none flex flex-col ${placement === "top" ? "origin-bottom-left" : "origin-top-left"}`}
                style={dropdownStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Contenido (orden inverso si está arriba? No, flex-col normal funciona bien, solo la posición cambia) 
                    PERO si está arriba, el "pico" visual o la animación deberían cambiar. 
                    Por ahora mantenemos el orden interno: Search -> List -> Actions 
                */}

                {/* header */}
                <div className="p-2 border-b bg-gray-50 rounded-t-md shrink-0">
                    <input
                        type="text"
                        placeholder={`Buscar ${title}...`}
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* list */}
                <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                    <div
                        className="flex items-center px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm font-bold text-indigo-700 border-b border-dashed border-gray-200"
                        onClick={handleSelectAll}
                    >
                        <span>(Seleccionar Todo)</span>
                    </div>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, idx) => (
                            <div
                                key={idx}
                                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                                onClick={() => toggleOption(option)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(option)}
                                    onChange={() => { }}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                />
                                <span className="ml-2 text-sm text-gray-700 break-words w-full" title={option}>
                                    {option}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-8 text-gray-500 text-sm text-center italic">
                            No se encontraron resultados
                        </div>
                    )}
                </div>

                {/* footer */}
                <div className="p-2 border-t bg-gray-50 rounded-b-md flex justify-between items-center shrink-0">
                    <button
                        className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                        onClick={clearFilter}
                    >
                        Borrar filtro
                    </button>
                    <button
                        className="text-xs text-gray-600 hover:text-gray-900 font-bold px-3 py-1 border rounded bg-white hover:bg-gray-100 shadow-sm transition"
                        onClick={() => setIsOpen(false)}
                    >
                        Listo
                    </button>
                </div>
            </div>
        </>
    );

    // We only render the portal if we have access to document body (client-side)
    const [mounted, setMounted] = useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Resize Listener to update position if open
    React.useEffect(() => {
        if (!isOpen) return;
        const updatePos = () => {
            if (buttonRef.current) {
                // Re-calculamos lógica simple para resize/scroll
                const rect = buttonRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const desiredHeight = 350;

                let showBelow = true;
                if (spaceBelow < desiredHeight && spaceAbove > spaceBelow) showBelow = false;

                const style: React.CSSProperties = {
                    left: rect.left,
                    width: 256,
                };

                if (showBelow) {
                    style.top = rect.bottom;
                    style.maxHeight = Math.min(desiredHeight, spaceBelow - 10);
                } else {
                    style.bottom = window.innerHeight - rect.top;
                    style.maxHeight = Math.min(desiredHeight, spaceAbove - 10);
                }
                setDropdownStyle(style);
            }
        };
        window.addEventListener('scroll', updatePos);
        window.addEventListener('resize', updatePos);
        return () => {
            window.removeEventListener('scroll', updatePos);
            window.removeEventListener('resize', updatePos);
        };
    }, [isOpen]);


    return (
        <div className="relative inline-block text-left" ref={buttonRef}>
            <div className="flex items-center gap-1 cursor-pointer group hover:opacity-80 transition" onClick={toggleOpen}>
                <span className="font-semibold">{title}</span>
                <button
                    className={`p-1 rounded transition ${selected.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'text-gray-400 group-hover:text-gray-600'}`}
                >
                    <Filter className="w-3.5 h-3.5" />
                </button>
            </div>

            {isOpen && mounted && (
                // Use a proper Portal if available, but for simplicity we rely on fixed position + z-index high enough.
                // Since fixed is relative to viewport, it breaks out of overflow containers.
                // We render it here but with 'fixed' strategy. 
                // Actually, if we render it inside this div, and this div is hidden by overflow, fixed might still be hidden in some browsers if containing block establishes stacking context? 
                // No, fixed usually escapes unless transform is used.
                // To be 100% safe, we use createPortal.

                // We need to import createPortal
                // Since this file didn't import 'react-dom', we check imports.

                // Wait, I can't easily add 'import { createPortal } from "react-dom"' inside the function.
                // I will assume I can edit imports or just use existing imports. 
                // The current file imports `React`. 
                // I will add the import in the top of the file in a separate chunk or if `replace_file_content` allows it.
                // I am replacing the whole function so I should be fine, but I need to handle imports.
                // I will try to use `ReactDOM.createPortal` if `ReactDOM` is typically available or adds it. 
                // React 18 usually imports ReactDOM from 'react-dom/client' or 'react-dom'.

                // Let's modify imports first or just do it in one go.
                // I will assume `import { createPortal } from 'react-dom'` is needed.
                null
            )}
            {/* The actual rendering */}
            {isOpen && mounted && (
                typeof document !== 'undefined'
                    ? (require('react-dom').createPortal(Dropdown, document.body))
                    : null
            )}
        </div>
    );
}

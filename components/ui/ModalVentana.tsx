// /components/ui/Modal.tsx

"use client";

import { ReactNode } from "react";

interface ModalProps {
    children: ReactNode;
    isOpen: boolean; 
    onClose: () => void; // Hacemos onClose requerido
    title?: string;
    // Opcional: Permite cambiar el ancho del modal, por si lo necesitas más grande después.
    maxWidth?: string; 
}

export default function Modal({ 
    children, 
    isOpen, 
    onClose, 
    title, 
    // 🔥 CLAVE DEL DISEÑO: Usamos 'max-w-md' como valor predeterminado
    // Esto asegura que el formulario se vea compacto como antes.
    maxWidth = "max-w-md" 
}: ModalProps) {
    
    if (!isOpen) return null;

    return (
        // 1. Fondo (Overlay): Fijo, ocupa toda la pantalla, z-index alto.
        // Hacemos que el clic en el fondo oscuro lo cierre.
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose} 
        >
            {/* 2. Contenedor del Modal */}
            <div 
                // Detiene la propagación del evento, para que el clic dentro del modal no lo cierre
                onClick={(e) => e.stopPropagation()}
                // Clases del contenedor: fondo blanco, redondeado, shadow, w-full, centrado
                // y usamos la clase maxWidth.
                className={`bg-white rounded-lg shadow-2xl p-6 w-full ${maxWidth} mx-4`}
            >
                {/* Título (Usa el mismo estilo que tenías antes: text-xl font-bold) */}
                {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
                
                {/* Contenido del formulario */}
                {children}
            </div>
        </div>
    );
}
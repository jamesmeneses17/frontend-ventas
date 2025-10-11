// /components/forms/ContactForm.tsx

"use client";

import React, { useState } from 'react';
import InputField from '../../ui/InputField'; 
// Asumiendo que tienes un componente para alertas simples, 
// si no lo tienes, puedes crear uno básico o usar la lógica simple que incluyo.

/**
 * Formulario de contacto que redirige a WhatsApp con feedback visual.
 */
const ContactForm: React.FC = () => {
    
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
    });
    
    // 🛑 Nuevo estado para manejar el feedback visual al usuario
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const phoneNumber = '573115504487';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);
        setStatusMessage(null); // Limpiar mensaje anterior
        
        const whatsappMessage = 
`¡Hola! Me gustaría más información sobre energía solar.
        
*Datos de Contacto:*
- Nombre: ${formData.nombre}
- Email: ${formData.email}
- Teléfono: ${formData.telefono}
        
*Mensaje:*
${formData.mensaje}`;

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // 1. Mostrar mensaje de éxito inmediatamente
        setStatusMessage('¡Mensaje enviado con éxito! Abriendo WhatsApp...');

        // 2. Redirigir y limpiar el formulario después de un breve delay
        // El delay (1.5s) permite al usuario leer el mensaje de confirmación antes de la redirección.
        setTimeout(() => {
            window.open(whatsappURL, '_blank');
            setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
            setIsLoading(false);
            // Opcional: Quitar el mensaje de éxito después de la redirección
            setTimeout(() => setStatusMessage(null), 5000); 
            
        }, 1500); 
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Envíanos un Mensaje</h3>
            
            {/* 🛑 FEEDBACK VISUAL: Alerta de éxito */}
            {statusMessage && (
                <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-100 border border-green-300">
                    {statusMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Campos de formulario (Nombre, Email, Teléfono, Mensaje) */}
                {/* ... (Mantener la conexión con handleChange y value para cada InputField y textarea) ... */}
                
                <InputField 
                    label="Nombre Completo" id="nombre" name="nombre" placeholder="Juan Pérez"
                    value={formData.nombre} onChange={handleChange} required
                />
                <InputField 
                    label="Email" id="email" name="email" type="email" placeholder="juan@ejemplo.com"
                    value={formData.email} onChange={handleChange} required
                />
                <InputField 
                    label="Teléfono" id="telefono" name="telefono" placeholder="+57 300 123 4567"
                    value={formData.telefono} onChange={handleChange}
                />
                
                <div>
                    <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje
                    </label>
                    <textarea
                        id="mensaje"
                        name="mensaje"
                        rows={4}
                        placeholder="Cuéntanos sobre tu proyecto..."
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
                        value={formData.mensaje}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>
                
                {/* Botón de Enviar */}
                <button
                    type="submit"
                    className="w-full bg-gray-800 text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-900 transition duration-200 shadow-md flex items-center justify-center disabled:bg-gray-500"
                    disabled={isLoading} // Deshabilitar el botón durante el proceso
                >
                    {/* 🛑 Feedback de carga */}
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Abriendo Chat...
                        </>
                    ) : (
                        'Enviar Mensaje'
                    )}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
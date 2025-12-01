// /components/layout/FooterPublic.tsx

import React from 'react';
// Eliminamos el componente 'Image' ya que no usaremos logo
// Iconos: Teléfono, Email, Ubicación
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'; 

const ACCENT_COLOR_TAILWIND = "text-[#2e9fdb]"; // Azul DISEM para íconos
const HOVER_COLOR_TAILWIND = "hover:text-[#2e9fdb]"; 
const BG_COLOR = "bg-gray-900"; 

// Datos de Contacto y Enlaces
const CONTACT_INFO = {
    telefono: '+57 (601) 286 1451',
    whatsappMovil: '+57 3206197545',
    email: 'informacion@disemsas.com.co',
    
    direcciones: [
        { ciudad: 'Bogotá', detalle: 'Calle 17 # 12 – 79 Centro' },
        { ciudad: 'Villavicencio', detalle: 'Calle 35 # 26 – 63' },
        { ciudad: 'Medellín', detalle: 'Calle 51 # 55 – 69 / Local 131' },
    ]
};

// Se eliminan los QUICK_LINKS ya que la columna 1 será 'Síguenos'

/**
 * Footer minimalista, compacto y profesional.
 */
const FooterPublic: React.FC = () => {
    return (
        <footer className={`${BG_COLOR} text-white mt-auto`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
                
                {/* Contenedor Principal (3 Columnas: Síguenos, Contacto, Direcciones) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-700 pb-8">
                    
                    {/* Columna 1: Síguenos (Redes Sociales) - MUEVE LAS REDES AQUÍ */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Síguenos</h3>
                        
                        {/* Redes Sociales */}
                        <div className="flex space-x-2">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={`p-1 border border-gray-700 rounded-md text-gray-400 ${HOVER_COLOR_TAILWIND} transition`} aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={`p-1 border border-gray-700 rounded-md text-gray-400 ${HOVER_COLOR_TAILWIND} transition`} aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={`p-1 border border-gray-700 rounded-md text-gray-400 ${HOVER_COLOR_TAILWIND} transition`} aria-label="Twitter"><Twitter className="w-4 h-4" /></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={`p-1 border border-gray-700 rounded-md text-gray-400 ${HOVER_COLOR_TAILWIND} transition`} aria-label="LinkedIn"><Linkedin className="w-4 h-4" /></a>
                        </div>
                    </div>

                    {/* Columna 2: Contáctanos (Teléfono y Email) - SE MANTIENE */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Contáctanos</h3>
                        
                        {/* Teléfono */}
                        <div className="mb-4">
                            <div className={`flex items-center mb-1 ${ACCENT_COLOR_TAILWIND}`}>
                                <Phone className="w-5 h-5 mr-2" />
                                <span className="font-semibold text-base">Llámanos:</span>
                            </div>
                            <p className="text-gray-400 text-sm ml-7">Fijo: {CONTACT_INFO.telefono}</p>
                            <p className="text-gray-400 text-sm ml-7">WhatsApp: {CONTACT_INFO.whatsappMovil}</p>
                        </div>
                        
                        {/* Email */}
                        <div>
                            <div className={`flex items-center mb-1 ${ACCENT_COLOR_TAILWIND}`}>
                                <Mail className="w-5 h-5 mr-2" />
                                <span className="font-semibold text-base">Email:</span>
                            </div>
                            <p className="text-gray-400 text-sm ml-7 break-words">{CONTACT_INFO.email}</p>
                        </div>
                    </div>
                    
                    {/* Columna 3: Ubicación y Direcciones - SE MANTIENE SOLO DIRECCIONES */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Ubicación y Direcciones</h3>
                        
                        {/* Direcciones */}
                        <div className="mb-6">
                            <div className={`flex items-center mb-2 ${ACCENT_COLOR_TAILWIND}`}>
                                <MapPin className="w-5 h-5 mr-2" />
                                <span className="font-semibold text-base">Sedes:</span>
                            </div>
                            {CONTACT_INFO.direcciones.map((dir, index) => (
                                <p key={index} className="text-gray-400 text-sm ml-7 mb-1">
                                    <span className="font-medium text-white">{dir.ciudad}:</span> {dir.detalle}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Derechos de Autor */}
                <div className="mt-4 text-center text-gray-500 text-xs">
                    © {new Date().getFullYear()} DISEM SAS. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};

export default FooterPublic;
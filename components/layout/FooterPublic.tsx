"use client";
import React, { useEffect, useState } from 'react';
// Eliminamos el componente 'Image' ya que no usaremos logo
// Iconos: Teléfono, Email, Ubicación
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'; 

const ACCENT_COLOR_TAILWIND = "text-[#2e9fdb]"; // Azul DISEM para íconos
const HOVER_COLOR_TAILWIND = "hover:text-[#2e9fdb]"; 
const BG_COLOR = "bg-gray-900"; 

import { getInformacionEmpresa } from "../services/configuracionWebService";
import { InformacionEmpresa } from "../../types/configuracion";

// Se eliminan los QUICK_LINKS ya que la columna 1 será 'Síguenos'

/**
 * Footer minimalista, compacto y profesional.
 */

const FooterPublic: React.FC = () => {
    const [info, setInfo] = useState<InformacionEmpresa | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getInformacionEmpresa()
            .then(setInfo)
            .catch(() => setInfo(null))
            .finally(() => setLoading(false));
    }, []);

    return (
        <footer className={`${BG_COLOR} text-white`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-700 pb-8">
                    {/* Columna 1: Síguenos (Redes Sociales) */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Síguenos</h3>
                        <div className="flex space-x-2">
                            {info?.urlFacebook && (
                                <a href={info.urlFacebook} target="_blank" rel="noopener noreferrer" className={`p-1 border border-gray-700 rounded-md text-gray-400 ${HOVER_COLOR_TAILWIND} transition`} aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
                            )}
                            {info?.urlInstagram && (
                                <a href={info.urlInstagram} target="_blank" rel="noopener noreferrer" className={`p-1 border border-gray-700 rounded-md text-gray-400 ${HOVER_COLOR_TAILWIND} transition`} aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
                            )}
                            {info?.urlLinkedIn && (
                                <a href={info.urlLinkedIn} target="_blank" rel="noopener noreferrer" className={`p-1 border border-gray-700 rounded-md text-gray-400 ${HOVER_COLOR_TAILWIND} transition`} aria-label="LinkedIn"><Linkedin className="w-4 h-4" /></a>
                            )}
                        </div>
                    </div>
                    {/* Columna 2: Contáctanos */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Contáctanos</h3>
                       
                        {/* Teléfonos juntos */}
                        {(info?.telefonoFijo || info?.whatsapp) && (
                            <div className="mb-4">
                                <div className={`flex items-center mb-1 text-[#2e9fdb]`}>
                                    <Phone className="w-5 h-5 mr-2" />
                                    <span className="font-semibold text-base">Llámanos:</span>
                                </div>
                                {info?.telefonoFijo && (
                                    <p className="text-gray-400 text-sm ml-7">{info.telefonoFijo}</p>
                                )}
                                {info?.whatsapp && (
                                    <p className="text-gray-400 text-sm ml-7">{info.whatsapp}</p>
                                )}
                            </div>
                        )}
                        {/* Email */}
                        {info?.emailInfo && (
                            <div>
                                <div className={`flex items-center mb-1 ${ACCENT_COLOR_TAILWIND}`}>
                                    <Mail className="w-5 h-5 mr-2" />
                                    <span className="font-semibold text-base">Email:</span>
                                </div>
                                <p className="text-gray-400 text-sm ml-7 break-words">{info.emailInfo}</p>
                            </div>
                        )}
                    </div>
                    {/* Columna 3: Ubicación y Direcciones */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Ubicación y Direcciones</h3>
                        {info?.direccionPrincipal && (
                            <div className="mb-6">
                                <div className={`flex items-center mb-2 ${ACCENT_COLOR_TAILWIND}`}>
                                    <MapPin className="w-5 h-5 mr-2" />
                                    <span className="font-semibold text-base">Dirección:</span>
                                </div>
                                <p className="text-gray-400 text-sm ml-7 mb-1">
                                    {info.direccionPrincipal}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Derechos de Autor */}
                <div className="mt-4 text-center text-gray-500 text-xs">
                    © {new Date().getFullYear()} { "DISEM SAS"}. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};

export default FooterPublic;
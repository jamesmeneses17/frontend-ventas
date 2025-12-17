// /components/ui/ContactInfo.tsx

"use client";
import React, { useEffect, useState } from 'react';
import { getInformacionEmpresa } from "../services/configuracionWebService";
import { InformacionEmpresa } from "../../types/configuracion";
// Usaremos iconos de Lucide de nuevo
import { Phone, Mail, MapPin, Clock } from 'lucide-react'; 

// Subcomponente para un elemento de contacto (Teléfono, Email, Dirección)
interface ContactItemProps {
    icon: React.ReactNode;
    title: string;
    content: React.ReactNode;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, title, content }) => (
    <div className="flex items-start space-x-4 mb-6">
        <div className="flex-shrink-0 mt-1" style={{ color: '#2563eb' }}>{icon}</div>
        <div>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <div className="text-black text-sm">{content}</div>
        </div>
    </div>
);

/**
 * Muestra la información de contacto estática y el horario de atención.
 */
const ContactInfo: React.FC = () => {
    const [info, setInfo] = useState<InformacionEmpresa | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getInformacionEmpresa()
            .then(setInfo)
            .catch(() => setInfo(null))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            {/* Bloque: Información de Contacto */}
            <div className="bg-white p-8 rounded-xl shadow-md mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Información de Contacto</h3>
                {/* Teléfonos */}
                {(info?.telefonoFijo || info?.whatsapp) && (
                    <ContactItem
                        icon={<Phone className="w-5 h-5" />}
                        title="Llámanos:"
                        content={
                            <>
                                {info?.telefonoFijo && (
                                    <a href={`tel:${info.telefonoFijo}`} className="block hover:text-[#0e121a] transition">{info.telefonoFijo}</a>
                                )}
                                {info?.whatsapp && (
                                    <a href={`tel:${info.whatsapp}`} className="block hover:text-[#0a0d13] transition">{info.whatsapp}</a>
                                )}
                            </>
                        }
                    />
                )}
                {/* Emails */}
                {(info?.emailVentas || info?.emailInfo) && (
                    <ContactItem
                        icon={<Mail className="w-5 h-5" />}
                        title="Email"
                        content={
                            <>
                                {info?.emailVentas && (
                                    <a href={`mailto:${info.emailVentas}`} className="block hover:text-[#101214] transition">{info.emailVentas}</a>
                                )}
                                {info?.emailInfo && (
                                    <a href={`mailto:${info.emailInfo}`} className="block hover:text-[#090c13] transition">{info.emailInfo}</a>
                                )}
                            </>
                        }
                    />
                )}
                {/* Dirección */}
                {info?.direccionPrincipal && (
                    <ContactItem
                        icon={<MapPin className="w-5 h-5" />}
                        title="Dirección"
                        content={<p>{info.direccionPrincipal}</p>}
                    />
                )}
            </div>

            {/* Bloque: Horario de Atención (Fondo Azul corporativo) */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-8 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-[#2e9fdb]" />
                    Horario de Atención
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between border-b border-white/30 pb-1">
                        <span className="font-medium">Lunes - Viernes:</span>
                        <span>{info?.horarioLunesViernes || "8:00 AM - 6:00 PM"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/30 pb-1">
                        <span className="font-medium">Sábados:</span>
                        <span>{info?.horarioSabados || "9:00 AM - 2:00 PM"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Domingos:</span>
                        <span className="font-bold text-white">{info?.horarioDomingos || "Cerrado"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactInfo;
// /components/ui/ContactInfo.tsx

import React from 'react';
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
        <div className="text-amber-600 flex-shrink-0 mt-1">{icon}</div>
        <div>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <div className="text-gray-600 text-sm">{content}</div>
        </div>
    </div>
);

/**
 * Muestra la información de contacto estática y el horario de atención.
 */
const ContactInfo: React.FC = () => {
    return (
        <div>
            {/* Bloque: Información de Contacto */}
            <div className="bg-white p-8 rounded-xl shadow-md mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Información de Contacto</h3>
                
                <ContactItem
                    icon={<Phone className="w-5 h-5" />}
                    title="Teléfono"
                    content={
                        <>
                            <a href="tel:+573001234567" className="block hover:text-amber-600 transition">+57 300 123 4567</a>
                            <a href="tel:+576012345678" className="block hover:text-amber-600 transition">+57 601 234 5678</a>
                        </>
                    }
                />
                
                <ContactItem
                    icon={<Mail className="w-5 h-5" />}
                    title="Email"
                    content={
                        <>
                            <a href="mailto:ventas@disemsas.com" className="block hover:text-amber-600 transition">ventas@disemsas.com</a>
                            <a href="mailto:info@disemsas.com" className="block hover:text-amber-600 transition">info@disemsas.com</a>
                        </>
                    }
                />
                
                <ContactItem
                    icon={<MapPin className="w-5 h-5" />}
                    title="Dirección"
                    content={
                        <p>
                            Calle 123 #45-67 <br/>
                            Bogotá, Colombia
                        </p>
                    }
                />
            </div>

            {/* Bloque: Horario de Atención (Fondo Naranja como en la imagen) */}
            <div className="bg-orange-500 text-white p-8 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Clock className="w-6 h-6 mr-3" />
                    Horario de Atención
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between border-b border-white/30 pb-1">
                        <span className="font-medium">Lunes - Viernes:</span>
                        <span>8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between border-b border-white/30 pb-1">
                        <span className="font-medium">Sábados:</span>
                        <span>9:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Domingos:</span>
                        <span className="font-bold text-black">Cerrado</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactInfo;
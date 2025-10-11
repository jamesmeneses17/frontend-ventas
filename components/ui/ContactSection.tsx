// /components/ui/ContactSection.tsx

import React from 'react';
import ContactInfo from './ContactInfo'; // Información estática
import ContactForm from '../common/form/ContactForm'; // Formulario

/**
 * Sección completa de Contacto para la landing page.
 */
const ContactSection: React.FC = () => {
    return (
        <section id="contacto" className="py-20 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-extrabold text-gray-900">
                    Contáctanos
                </h2>
                <p className="mt-4 text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                    ¿Listo para dar el paso hacia la energía solar? Escríbenos y te asesoraremos sin compromiso.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                    {/* Lado Izquierdo: Información y Horario */}
                    <ContactInfo />
                    
                    {/* Lado Derecho: Formulario */}
                    <ContactForm />
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
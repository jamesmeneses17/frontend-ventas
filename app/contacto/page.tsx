// /app/contacto/page.tsx

"use client";

import React, { Suspense } from 'react';
// Importamos PublicLayout, asumiendo que está en esta ruta relativa o absoluta
// Importamos el componente de la sección de contacto
import ContactSection from '@/components/ui/ContactSection'; 
import PublicLayout from '../../components/layout/PublicLayout';

// ----------------------------------------------------------------------
// 1. Componente de Contenido de la Página
// ----------------------------------------------------------------------

function ContactoPageContent() {
    return (
        // Envolvemos el contenido en el PublicLayout para obtener el Header y el Footer
        <PublicLayout>
            {/* El PublicLayout envuelve el contenido en una etiqueta <main>. 
              Asegúrate de que ContactSection tenga un padding superior e inferior adecuados.
              (Si usas el ContactSection modificado anteriormente, esto ya está listo).
            */}
            <ContactSection />
        </PublicLayout>
    );
}

// ----------------------------------------------------------------------
// 2. Componente de Página con Suspense
// ----------------------------------------------------------------------

export default function ContactoPage() {
    return (
        <Suspense
            fallback={
                <div className="text-center py-12 text-gray-500">
                    Cargando página de contacto...
                </div>
            }
        >
            <ContactoPageContent />
        </Suspense>
    );
}
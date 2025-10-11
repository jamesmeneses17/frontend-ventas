// /components/layout/FooterPublic.tsx

import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Sun } from 'lucide-react'; // Iconos para redes y el logo

// 🛑 Mock Data para los enlaces (debes adaptar esto a tus rutas reales)
const footerLinks = {
    Productos: [
        { name: 'Paneles Solares', href: '/productos?q=paneles' },
        { name: 'Baterías Solares', href: '/productos?q=baterias' },
        { name: 'Controladores', href: '/productos?q=controladores' },
        { name: 'Iluminación Solar', href: '/productos?q=iluminacion' },
        { name: 'Kits Completos', href: '/productos?q=kits' },
    ],
    Empresa: [
        { name: 'Sobre Nosotros', href: '/nosotros' },
        { name: 'Proyectos', href: '/proyectos' },
        { name: 'Testimonios', href: '/testimonios' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contacto', href: '/contacto' },
    ],
    Legal: [
        { name: 'Términos y Condiciones', href: '/legal/terminos' },
        { name: 'Política de Privacidad', href: '/legal/privacidad' },
        { name: 'Garantías', href: '/legal/garantias' },
        { name: 'Devoluciones', href: '/legal/devoluciones' },
        { name: 'Portal Admin', href: '/admin' }, // Enlace al área de administración
    ],
};

// Componente para una columna de enlaces
interface LinkColumnProps {
    title: string;
    links: { name: string; href: string }[];
}

const LinkColumn: React.FC<LinkColumnProps> = ({ title, links }) => (
    <div>
        <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
        <ul className="space-y-3">
            {links.map((link) => (
                <li key={link.name}>
                    <a 
                        href={link.href} 
                        className="text-gray-400 hover:text-amber-500 transition duration-150 text-sm"
                    >
                        {link.name}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

/**
 * Footer completo de la aplicación con diseño oscuro.
 */
const FooterPublic: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white mt-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                
                {/* Contenedor Principal (4 Columnas) */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-10 border-b border-gray-700 pb-10">
                    
                    {/* Columna 1: Logo y Propuesta de Valor */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            {/* Logo/Icono Naranja */}
                            <Sun className="w-8 h-8 text-amber-500" fill="currentColor" />
                            <span className="text-2xl font-bold text-white">DISEM SAS</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                            Soluciones de energía solar para un futuro sostenible. Calidad, garantía y servicio profesional.
                        </p>
                        
                        {/* Iconos de Redes Sociales */}
                        <div className="flex space-x-4">
                            <a href="https://facebook.com/disemsas" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-amber-500 transition"><Facebook className="w-6 h-6" /></a>
                            <a href="https://instagram.com/disemsas" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-amber-500 transition"><Instagram className="w-6 h-6" /></a>
                            <a href="https://twitter.com/disemsas" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-amber-500 transition"><Twitter className="w-6 h-6" /></a>
                            <a href="https://linkedin.com/company/disemsas" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-amber-500 transition"><Linkedin className="w-6 h-6" /></a>
                        </div>
                    </div>

                    {/* Columna 2: Productos */}
                    <LinkColumn title="Productos" links={footerLinks.Productos} />

                    {/* Columna 3: Empresa */}
                    <LinkColumn title="Empresa" links={footerLinks.Empresa} />

                    {/* Columna 4: Legal */}
                    <LinkColumn title="Legal" links={footerLinks.Legal} />
                </div>

                {/* Derechos de Autor */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} DISEM SAS. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
};

export default FooterPublic;
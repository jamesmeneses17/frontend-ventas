// /components/layout/HeaderPublic.tsx (Ajuste para coincidir con la imagen)

import React from 'react';

const HeaderPublic: React.FC = () => {
  // Simulación de navegación (ajusta las rutas según tu app)
  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/productos' },
    { name: 'Nosotros', href: '/nosotros' }, // Ajuste de la URL
    { name: 'Contacto', href: '/contacto' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo de DISEM SAS */}
            <div className="flex-shrink-0 flex items-center">
              {/* Reemplazar con el logo real si tienes un componente de Logo */}
              <span className="text-xl font-bold text-amber-600">DISEM SAS</span>
            </div>
            
            {/* Navegación principal */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-amber-300 hover:text-amber-700"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          
          {/* Botón de Admin/Login */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <a
              href="/login" // O /auth/login, dependiendo de tu ruta
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderPublic;
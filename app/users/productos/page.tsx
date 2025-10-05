// /app/productos/page.tsx (PÁGINA PÚBLICA PARA EL CLIENTE)

"use client";

import React from 'react';
import PublicLayout from '../../../components/layout/PublicLayout';
// IMPORTANTE: NO usamos AuthenticatedLayout.
// Asumo que tienes un componente para renderizar la lista de productos
// import ProductGrid from '../../components/productos/ProductGrid'; 

export default function ProductosClientePage() {
  
  // Lógica para cargar los productos del cliente (fetch de API pública)
  // const [productos, setProductos] = useState([]);

  return (
    <PublicLayout>
      <div className="space-y-10 py-6">
        
        {/* Sección de Banner y Descripción (como en tu imagen) */}
        <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-sm font-medium text-yellow-800">
                ⚡ Energía Solar Sostenible
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Ilumina tu futuro con <span className="text-indigo-600">energía solar</span>
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
                En DISEM SAS ofrecemos soluciones completas de energía solar para hogares y empresas...
            </p>
            <div className="mt-8 flex justify-center space-x-4">
                <a href="#productos" className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition">
                    Ver Productos →
                </a>
                <a href="/cotizar" className="px-6 py-3 border border-gray-300 text-black rounded-lg font-medium hover:bg-gray-50 transition">
                    Cotizar Ahora
                </a>
            </div>
        </div>

        {/* Sección de Listado de Productos (Grid) */}
        <section id="productos" className="pt-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Explora Nuestro Catálogo</h2>
            
            {/* Aquí puedes reutilizar componentes comunes para filtros/búsqueda */}
            {/* <SearchBar onSearch={(query) => console.log(query)} /> */}

            {/* Reemplaza esto con tu componente ProductGrid/Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Ejemplo de tarjeta de producto (reemplazar con data real) */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900">Panel Fotovoltaico</h3>
                        <p className="text-gray-600 mt-1">Potencia: 450W</p>
                        <p className="text-xl font-bold text-indigo-600 mt-3">$250.00</p>
                    </div>
                </div>
                {/* Repetir tarjetas... */}
            </div>
        </section>

      </div>
    </PublicLayout>
  );
}
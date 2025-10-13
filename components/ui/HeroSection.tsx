// /components/ui/HeroSection.tsx (MODIFICADO para integrar estadísticas)

"use client";

import React from "react";

const HeroSection: React.FC = () => {
  return (
    // Contenedor principal que da el fondo blanco/crema y el padding vertical
    <section className="pt-10 pb-16 bg-white sm:pt-16 lg:pt-24">
      
      {/* Contenedor de Centrado: max-w-7xl y px-4 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Contenedor de la parte superior: Texto y Imagen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Columna Izquierda: Texto y Botones */}
          <div className="lg:pr-10">
            {/* ... (Todo el contenido de etiqueta, título y descripción) ... */}
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              ⚡ Energía Solar Sostenible
            </span>

            <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Ilumina tu futuro con{" "}
              <span className="text-amber-600">energía solar</span>
            </h1>

            <p className="mt-6 text-xl text-gray-600">
              En DISEM SAS ofrecemos soluciones completas de energía solar para
              hogares y empresas. Paneles solares, baterías, controladores y
              más, con la mejor calidad y garantía del mercado.
            </p>

            {/* Botones de Acción */}
            <div className="mt-10 flex space-x-4">
              <a
                href="/users/productos"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-black hover:bg-gray-800"
              >
                Ver Productos →
              </a>
              <a
                href="/cotizar"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-50"
              >
                Cotizar Ahora
              </a>
            </div>

            {/* SECCIÓN DE ESTADÍSTICAS (AJUSTADA) 
               Eliminamos 'border-t' y reducimos el padding superior y margen superior.
            */}
            <div className="mt-12 pt-6 grid grid-cols-3 gap-8 text-center sm:text-left">
              
              {/* Estadística 1 */}
              <div>
                <p className="text-4xl font-extrabold text-gray-900">500+</p>
                <p className="mt-1 text-lg font-medium text-gray-600">Clientes</p>
              </div>
              
              {/* Estadística 2 */}
              <div>
                <p className="text-4xl font-extrabold text-gray-900">10+</p>
                <p className="mt-1 text-lg font-medium text-gray-600">Años</p>
              </div>
              
              {/* Estadística 3 */}
              <div>
                <p className="text-4xl font-extrabold text-gray-900">98%</p>
                <p className="mt-1 text-lg font-medium text-gray-600">
                  Satisfacción
                </p>
              </div>
            </div>
          </div> 
          {/* Fin Columna Izquierda */}

          {/* Columna Derecha: Imagen */}
          <div className="relative flex justify-center lg:justify-end">
            {/* ... (El código de la imagen con la etiqueta de garantía) ... */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                className="object-cover w-full h-auto max-h-[500px]"
                src="/images/solar.webp"
                alt="Paneles Solares de DISEM SAS"
              />

              <div className="absolute bottom-4 right-4 bg-white p-3 rounded-xl shadow-lg flex items-center space-x-2">
                <span className="text-amber-500 text-2xl">⚡</span>
                <div>
                  <p className="text-lg font-bold">25 años</p>
                  <p className="text-sm text-gray-500">Garantía en paneles</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NOTA: Eliminamos la sección de estadísticas que estaba aquí, 
           porque la movemos a la columna izquierda para un mejor diseño en móvil y escritorio. 
        */}
      </div>
    </section>
  );
};

export default HeroSection;
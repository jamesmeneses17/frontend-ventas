// /components/ui/HeroSection.tsx

"use client";

import React from "react";

const HeroSection: React.FC = () => {
  return (
    // Contenedor principal para toda la sección Hero y estadísticas
    <section className="pt-10 pb-16 bg-white sm:pt-16 lg:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Contenedor de la parte superior: Texto y Imagen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna Izquierda: Texto y Botones */}
          <div className="lg:pr-10">
            {/* Etiqueta de Resaltado */}
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
              ⚡ Energía Solar Sostenible
            </span>

            {/* Título Principal */}
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Ilumina tu futuro con{" "}
              <span className="text-amber-600">energía solar</span>
            </h1>

            {/* Descripción */}
            <p className="mt-6 text-xl text-gray-600">
              En DISEM SAS ofrecemos soluciones completas de energía solar para
              hogares y empresas. Paneles solares, baterías, controladores y
              más, con la mejor calidad y garantía del mercado.
            </p>

            {/* Botones de Acción */}
            <div className="mt-10 flex space-x-4">
              <a
                href="/productos"
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
          </div>

          {/* Columna Derecha: Imagen */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Usar una etiqueta <img> real y estilos de Tailwind para la imagen */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              {/* Reemplaza 'tu-imagen-paneles.jpg' con la ruta real de tu imagen */}
              <img
                className="object-cover w-full h-auto max-h-[500px]"
                src="/images/solar.webp"
                alt="Paneles Solares de DISEM SAS"
              />

              {/* Etiqueta de Garantía Superpuesta */}
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

        {/* Sección de Estadísticas (debajo de las dos columnas) */}
        <div className="mt-16 border-t border-gray-200 pt-10 grid grid-cols-3 gap-8 text-center sm:mt-20 sm:pt-12">
          {/* Estadística 1 */}
          <div>
            <p className="text-4xl font-extrabold text-gray-900">500+</p>
            <p className="mt-2 text-lg font-medium text-gray-600">Clientes</p>
          </div>
          {/* Estadística 2 */}
          <div>
            <p className="text-4xl font-extrabold text-gray-900">10+</p>
            <p className="mt-2 text-lg font-medium text-gray-600">Años</p>
          </div>
          {/* Estadística 3 */}
          <div>
            <p className="text-4xl font-extrabold text-gray-900">98%</p>
            <p className="mt-2 text-lg font-medium text-gray-600">
              Satisfacción
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

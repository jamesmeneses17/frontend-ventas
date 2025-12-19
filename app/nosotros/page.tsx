"use client";

import React, { Suspense } from "react";
import PublicLayout from "../../components/layout/PublicLayout";

function NosotrosPageContent() {
  return (
    <PublicLayout>
      {/* CABECERA AZUL CORPORATIVA */}
      <section className="bg-gradient-to-b from-[#b6ddf5] to-[#32aef1] py-24 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold">
            Sobre Nosotros
          </h1>
        </div>
      </section>

      {/* CONTENIDO CENTRAL */}
      <section className="-mt-20 pb-24">
        <div className="container mx-auto px-6">
          <div className="bg-white max-w-5xl mx-auto p-10 md:p-14 rounded-xl shadow-xl text-gray-700 space-y-6 text-lg leading-relaxed">
            <p>
             Somos una empresa dedicada a la comercialización de soluciones integrales en energía y movilidad, ofreciendo productos confiables y de alta calidad en un solo lugar.
            </p>

            <p>
              Nos especializamos en Energía Solar, Corriente Alterna, Productos Automotrices y Productos para Motocicletas, atendiendo las necesidades de hogares, empresas, industrias y usuarios particulares que buscan eficiencia, respaldo energético y mantenimiento confiable para sus vehículos.
            </p>

            <p>
           Nuestro compromiso es brindar productos de calidad, acompañados de asesoría técnica especializada, garantizando soluciones adecuadas para cada proyecto o requerimiento.
            </p>
            <p>Más que vender productos, buscamos construir relaciones de confianza, convirtiéndonos en un aliado estratégico para hogares, empresas y usuarios que valoran la eficiencia, la seguridad y la durabilidad.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export default function NosotrosPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center">Cargando...</div>}>
      <NosotrosPageContent />
    </Suspense>
  );
}

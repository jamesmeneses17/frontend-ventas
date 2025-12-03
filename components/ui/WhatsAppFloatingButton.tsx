"use client";

import React from "react";

const BUSINESS_PHONE = "573206197545";
// Mensaje predefinido enfocado en la necesidad de información en un e-commerce
const PREDEFINED_MESSAGE = encodeURIComponent(
  "¡Hola! Estoy navegando por su tienda online y estoy interesado/a en solicitar más información sobre un producto o hacer una consulta."
);

const WhatsAppFloatingButton: React.FC = () => {
  // Enlace con el número y el mensaje predefinido
  const whatsappLink = `https://wa.me/${BUSINESS_PHONE}?text=${PREDEFINED_MESSAGE}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir chat de WhatsApp con mensaje predefinido"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      // Fija la posición del botón
      className="fixed right-4 bottom-6 md:right-8 md:bottom-8 z-50"
    >
      {/*
        El div ahora solo define el tamaño y la transición.
        Hemos eliminado: rounded-full, shadow-2xl, overflow-hidden
        para que la imagen se muestre tal cual.
      */}
      <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform transform hover:scale-105 p-0">
        <img
          src="/images/logo-wasap.png"
          alt="WhatsApp"
          // Mantenemos w-full h-full para que la imagen ocupe todo el espacio del div
          // y eliminamos rounded-full para no forzar el recorte si la imagen ya lo trae.
          className="w-full h-full object-cover"
          width={64}
          height={64}
        />
      </div>
    </a>
  );
};

export default WhatsAppFloatingButton;
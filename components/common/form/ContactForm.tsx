// /components/forms/ContactForm.tsx

"use client";

import React, { useState } from "react";
import InputField from "../../ui/InputField";

/**
 * Formulario de contacto que redirige a WhatsApp con feedback visual y validaciones.
 */
const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error">("success"); // Nuevo: tipo de mensaje
  const [isLoading, setIsLoading] = useState(false);

  const phoneNumber = "573115504487";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (statusType === "error") {
      setStatusMessage(null);
      setStatusType("success");
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🛑 Función de validación (10 dígitos)
  const validate = () => {
    // Validación del teléfono: debe tener exactamente 10 dígitos (ignorando el signo +)
    const digitsOnly = formData.telefono.replace(/[^0-9]/g, "");

    if (digitsOnly.length !== 10) {
      setStatusType("error");
      setStatusMessage(
        "Error: El número de teléfono debe contener exactamente 10 dígitos."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Ejecutar validación
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    setStatusType("success"); // Resetear a éxito para el mensaje de WA

    // 🛑 MENSAJE DE INTERÉS ACTUALIZADO
    const initialGreeting =
      "¡Hola DISEM SAS! Estoy muy interesado/a en comprar o saber más sobre un producto solar.";

    const whatsappMessage = `${initialGreeting}
        
*Datos de Contacto:*
- Nombre: ${formData.nombre}
- Email: ${formData.email}
- Teléfono: ${formData.telefono}
        
*Mensaje Específico:*
${formData.mensaje || "No especificó un mensaje, pero requiere asesoría."}`; // Texto por defecto si el campo "mensaje" está vacío

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // 2. Mostrar mensaje de éxito inmediatamente
    setStatusType("success");
    setStatusMessage("¡Mensaje enviado con éxito! Abriendo WhatsApp...");

    // 3. Redirigir
    setTimeout(() => {
      window.open(whatsappURL, "_blank");
      setFormData({ nombre: "", email: "", telefono: "", mensaje: "" });
      setIsLoading(false);
      // Opcional: Quitar el mensaje de éxito después de la redirección
      setTimeout(() => setStatusMessage(null), 5000);
    }, 1500);
  };

  // Clases CSS dinámicas para la alerta
  const alertClasses =
    statusType === "success"
      ? "p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-100 border border-green-300"
      : "p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 border border-red-300";

  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Envíanos un Mensaje
      </h3>

      {/* 🛑 FEEDBACK VISUAL: Alerta dinámica */}
      {statusMessage && <div className={alertClasses}>{statusMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Nombre Completo"
          id="nombre"
          name="nombre"
          placeholder="Juan Pérez"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <InputField
          label="Email"
          id="email"
          name="email"
          type="email"
          placeholder="juan@ejemplo.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <InputField
          label="Teléfono (10 dígitos)"
          id="telefono"
          name="telefono"
          placeholder="3001234567"
          value={formData.telefono}
          onChange={handleChange}
          type="tel" // Usar tipo tel para mejor experiencia móvil
          required
        />

        <div>
          <label
            htmlFor="mensaje"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mensaje
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows={4}
            placeholder="Cuéntanos sobre tu proyecto, qué producto te interesa o si requieres una cotización..."
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
            value={formData.mensaje}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          className="w-full bg-gray-800 text-white py-3 rounded-lg text-lg font-semibold hover:bg-gray-900 transition duration-200 shadow-md flex items-center justify-center disabled:bg-gray-500"
          disabled={isLoading}
        >
          {/* Feedback de carga */}
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Abriendo Chat...
            </>
          ) : (
            "Enviar Mensaje"
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;

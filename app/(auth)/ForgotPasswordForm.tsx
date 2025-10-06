"use client";

// /components/auth/ForgotPasswordForm.tsx

import InputField from "../../components/ui/InputField"; // Ajusta la ruta según la ubicación real de tu InputField
// El archivo en el repositorio es `components/ui/button.tsx` (minúscula). Importamos usando el mismo nombre.
import Button from "../../components/ui/button";
import React from 'react';

// Este formulario solo necesita el campo de correo y un botón de envío
const ForgotPasswordForm: React.FC = () => {
  // 🚨 Aquí iría la lógica de estados y validación de Formik/React Hook Form (omito la lógica por simplicidad)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Solicitud de recuperación enviada.");
    // 🚨 Aquí iría la llamada a la API para enviar el correo de recuperación
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField
        label="Correo Electrónico"
        id="email"
        name="email"
        type="email"
        placeholder="tu.correo@ejemplo.com"
        required
        // 🚨 Aquí podrías añadir un ícono si tu InputField lo soporta
      />
      
      <Button
        type="submit"
        className="w-full justify-center bg-indigo-500 hover:bg-indigo-600 text-white"
      >
        Enviar Enlace de Recuperación
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
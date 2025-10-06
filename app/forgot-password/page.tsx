// /app/forgot-password/page.tsx

import AuthSplitPanel from "../../components/layout/AuthSplitPanel";
// El formulario de recuperación vive en `app/(auth)/ForgotPasswordForm.tsx` en este proyecto.
import ForgotPasswordForm from "../(auth)/ForgotPasswordForm";
import Link from 'next/link'; 


export default function ForgotPasswordPage() {
  return (
    <AuthSplitPanel imageSrc="/images/logodisem.jpg" imageAlt="Imagen de Recuperación">
      
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3 text-gray-900">
          Recuperar Contraseña
        </h2>
        <p className="text-lg font-bold mb-8 text-gray-500">
          Ingresa tu correo electrónico y te enviaremos un enlace.
        </p>
      </div>

      {/* 🚨 REEMPLAZA EL COMENTARIO CON EL FORMULARIO */}
      <ForgotPasswordForm /> 

      <Link
        href="/login"
        className="mt-6 block text-center text-sm font-semibold text-gray-500 hover:text-gray-700"
      >
        ← Volver al Login
      </Link>
      
    </AuthSplitPanel>
  );
}
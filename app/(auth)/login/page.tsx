// /app/login/page.tsx

import LoginForm from "../../../components/auth/LoginForm";
import AuthSplitPanel from "../../../components/layout/AuthSplitPanel"; // Layout reutilizable
import Link from 'next/link'; // Usamos Link de Next.js para una mejor navegación

export default function LoginPage() {
  return (
    <AuthSplitPanel imageSrc="/images/logo-disem.jpeg" imageAlt="Paneles Solares de DISEM">
      
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3 text-gray-900">
          Iniciar Sesión
        </h2>
        <p className="text-xl font-bold mb-8 text-gray-500">
          Ingresa tus datos para iniciar sesion
        </p>
      </div>

      <LoginForm />

      {/* Enlace al flujo de recuperación de contraseña */}
      <Link
        href="/forgot-password" 
        className="mt-6 block text-center text-sm font-semibold text-indigo-500 hover:text-indigo-400"
      >
        ¿Olvidaste tu contraseña?
      </Link>
      
    </AuthSplitPanel>
  );
}
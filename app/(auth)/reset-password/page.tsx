"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthSplitPanel from "../../../components/layout/AuthSplitPanel";
import ResetPasswordForm from "../ResetPasswordForm";
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <AuthSplitPanel imageSrc="/images/logodisem.jpg" imageAlt="Resetear Contraseña">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">
            Enlace Inválido
          </h2>
          <p className="text-lg font-bold mb-8 text-red-600">
            El enlace de recuperación no es válido o ha expirado.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block mt-6 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </AuthSplitPanel>
    );
  }

  return (
    <AuthSplitPanel imageSrc="/images/logodisem.jpg" imageAlt="Resetear Contraseña">
      
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3 text-gray-900">
          Establecer Nueva Contraseña
        </h2>
        <p className="text-lg font-bold mb-8 text-gray-500">
          Ingresa tu nueva contraseña para acceder a tu cuenta.
        </p>
      </div>

      <ResetPasswordForm token={token} />

      <Link
        href="/login"
        className="mt-6 block text-center text-sm font-semibold text-gray-500 hover:text-gray-700"
      >
        ← Volver al Login
      </Link>
      
    </AuthSplitPanel>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthSplitPanel imageSrc="/images/logodisem.jpg" imageAlt="Resetear Contraseña">
        <div className="text-center">
          <p className="text-lg text-gray-500">Cargando...</p>
        </div>
      </AuthSplitPanel>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

import AuthSplitPanel from "../../../../components/layout/AuthSplitPanel";
import ResetPasswordForm from "../../ResetPasswordForm";
import Link from 'next/link';

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = params;

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

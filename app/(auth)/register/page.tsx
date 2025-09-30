import RegisterForm from "../../../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img src="/images/logodisem.jpg" alt="Logo" className="mx-auto h-20 w-auto" />
        <h2 className="mt-10 text-center text-2xl font-bold text-gray-900">Crear una cuenta</h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <RegisterForm />
        <p className="mt-10 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="font-semibold text-indigo-500 hover:text-indigo-400">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}

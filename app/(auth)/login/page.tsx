import LoginForm from "../../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-white">
      <div className="flex w-full max-w-4xl overflow-hidden bg-white rounded-3xl border border-gray-700 h-[520px]">
        {/* Columna 1: El Formulario con centrado vertical */}
        <div className="w-full lg:w-1/2 p-16 flex flex-col justify-center items-center">
          <div className="w-full max-w-xs">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-3 text-gray-900">
                Iniciar Sesión
              </h2>
              <p className="text-xl font-bold mb-8 text-gray-500">
                Ingresa tus datos para iniciar sesion
              </p>
            </div>

            <LoginForm />

            <a
              href="#"
              className="mt-6 block text-center text-sm font-semibold text-indigo-500 hover:text-indigo-400"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        {/* Columna 2: La Imagen */}
        <div className="hidden lg:block lg:w-1/2">
          <img
            src="/images/logodisem.jpg"
            alt="Fondo de la empresa"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

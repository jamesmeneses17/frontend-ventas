import LoginForm from "../../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    // Contenedor principal para centrar la caja y darle el fondo blanco
    <div className="flex min-h-screen items-center justify-center p-6 bg-white">
      {/* Contenedor del Login Completo (Formulario + Imagen) */}
      <div className="flex w-full max-w-4xl overflow-hidden bg-white rounded-3xl shadow-2xl">
        {/* Columna 1: El Formulario */}
        <div className="w-full lg:w-1/2 p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3 text-gray-900">
              Iniciar Sesión
            </h2>
            <p className="text-1xl font-bold mb-3 text-gray-600">
              Ingresa tus datos para iniciar sesion
            </p>
          </div>

          {/* El componente LoginForm debe recibir las clases para que los inputs también sean redondeados */}
          <LoginForm />

          <a
            href="#" // Puedes dejarlo como # o /forgot-password
            className="mt-4 block text-center text-sm font-semibold text-green-600 hover:text-green-500" // Cambié el color a verde para que coincida con tu imagen
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Columna 2: La Imagen (Solo visible en pantallas grandes) */}
        <div className="hidden lg:block lg:w-1/2">
          {/* Reemplaza 'path/to/your/image.jpg' con la ruta de tu imagen */}
          <img
            src="/images/logodisem.jpg"
            alt="Fondo Indígena"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

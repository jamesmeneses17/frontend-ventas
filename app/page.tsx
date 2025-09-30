import Button from "../components/ui/button";
import InputField from "../components/ui/InputField";


export default function Login() {
  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img 
  src="/images/logodisem.jpg" 
  alt="Logo de la empresa"
  className="mx-auto h-20 w-auto"
/>
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Disem S.A.S.
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form action="#" method="POST" className="space-y-6">
          <InputField
            id="email"
            label="Correo electrónico"
            type="email"
            required
            autoComplete="email"
          />

          <InputField
            id="password"
            label="Contraseña"
            type="password"
            required
            autoComplete="current-password"
          />

          <Button type="submit">Acceder</Button>
        </form>

        <p className="mt-10 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <a href="#" className="font-semibold text-indigo-500 hover:text-indigo-400">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}

import PublicLayout from "../components/layout/PublicLayout";

export default function Home() {
  return (
    <PublicLayout>
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Bienvenido a DISEM SAS</h1>
          <p className="mt-4 text-lg text-gray-600">Catálogo y administración de productos. Inicia sesión para acceder al panel administrativo.</p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/productos"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Ver productos
            </a>
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
            >
              Iniciar sesión
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

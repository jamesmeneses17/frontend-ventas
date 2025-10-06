import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import HeaderPublic from "../components/layout/HeaderPublic";
import { CategoriesProvider } from "../contexts/CategoriesContext";
import { getCategorias } from "../components/services/categoriasService";

export const metadata = {
  title: "Sistema de Ventas - Disem S.A.S.",
  description: "Sistema de gestión de ventas",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch categories on the server once to avoid duplicate client fetches
  const initialCategories = await getCategorias();

  return (
    <html lang="es">
      {/* 🚨 Cambiamos la clase del body para tener el fondo blanco */}
      <body className="bg-white min-h-screen">
        {/* 🚨 El AuthProvider envuelve toda la lógica de la aplicación */}
        <AuthProvider>
          {/* 🚨 CategoriesProvider ahora recibe initialCategories desde el servidor */}
          <CategoriesProvider initialCategories={initialCategories}>
            <div className="min-h-screen flex flex-col">
              {/* 1. Header Público */}
              <HeaderPublic />

              {/* 2. Contenido Principal */}
              <main className="flex-grow">{children}</main>

              {/* 3. Footer simple (movido de PublicLayout) */}
              <footer className="bg-white border-t border-gray-100 mt-12 py-6">
                <div className="mx-auto max-w-7xl text-center text-sm text-gray-500">
                  © {new Date().getFullYear()} DISEM SAS. Todos los derechos
                  reservados.
                </div>
              </footer>
            </div>
          </CategoriesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

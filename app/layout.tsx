import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import Providers from '../components/Providers';

export const metadata = {
  title: 'Sistema de Ventas - Disem S.A.S.',
  description: 'Sistema de gestión de ventas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Providers>
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  ) 
}

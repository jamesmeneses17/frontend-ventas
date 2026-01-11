import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import Providers from '../components/Providers';
import WhatsAppFloatingButton from '../components/ui/WhatsAppFloatingButton';

export const metadata = {
  title: 'DISEM S.A.S. – Ventas',
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
            <WhatsAppFloatingButton />
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}

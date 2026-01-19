import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { SocketProvider } from '../contexts/SocketContext';
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
          <SocketProvider>
            <Providers>
              {children}
              <WhatsAppFloatingButton />
            </Providers>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

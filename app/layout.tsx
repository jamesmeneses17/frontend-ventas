import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { SocketProvider } from '../contexts/SocketContext';
import Providers from '../components/Providers';
import WhatsAppFloatingButton from '../components/ui/WhatsAppFloatingButton';

export const metadata = {
  title: 'DISEM S.A.S. - Sistema de Gestión',
  description: 'Sistema de gestión de ventas',
  icons: {
    icon: '/images/disem.png',
    apple: '/images/disem.png',
  },
  openGraph: {
    title: 'DISEM S.A.S. - Sistema de Gestión',
    description: 'Sistema de gestión de ventas',
    url: '/',
    siteName: 'DISEM S.A.S.',
    images: [
      {
        url: '/images/disem.png',
        width: 800,
        height: 600,
        alt: 'Logo DISEM S.A.S.',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
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

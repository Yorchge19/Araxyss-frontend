import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'Workspace App',
  description: 'Scalable Next.js and Firebase workspace dashboard',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es" className="dark">
      <body suppressHydrationWarning className="min-h-screen bg-canvas text-text-body">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

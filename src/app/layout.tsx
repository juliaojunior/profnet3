import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './styles.css'; // Adicione esta linha
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProfNet - Rede Social para Docentes',
  description: 'Plataforma para docentes compartilharem conhecimentos e gerarem conteúdo com IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

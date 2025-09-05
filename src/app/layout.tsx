import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AgendaEu.com - Agendamento Online Simplificado',
  description: 'A plataforma completa para agendamento, gerenciamento de clientes e pagamentos para profissionais e negócios.',
  manifest: '/manifest.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.className} suppressHydrationWarning>
      <head />
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

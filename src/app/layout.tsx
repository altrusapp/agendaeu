import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'AgeNails - Agendamento para Profissionais de Beleza',
  description: 'A plataforma completa para agendamento, gerenciamento de clientes e pagamentos para salões de beleza, clínicas de estética e barbearias.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}


import type {Metadata} from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const ptSans = PT_Sans({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-pt-sans',
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
   themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(var(--background))" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(var(--background))" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={ptSans.variable} suppressHydrationWarning>
      <head />
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}


import type {Metadata, Viewport} from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const ptSans = PT_Sans({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-pt-sans',
});

const APP_NAME = "AgendaEu.com";
const APP_DESCRIPTION = "Agenda online 24/7 para manicures, barbeiros e salões. Reduza faltas com lembretes e foque no seu trabalho. Simples, rápido e grátis para começar.";
const APP_URL = "https://agendaeu.com"; // TODO: Trocar pela URL de produção

export const metadata: Metadata = {
  title: {
    default: "AgendaEu.com | Agenda Online para Salão de Beleza e Barbearia",
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "agendamento online",
    "agenda para salão de beleza",
    "agenda para manicure",
    "agenda para barbearia",
    "software para salão",
    "sistema para barbearia",
    "agendamento de clientes",
    "lembretes whatsapp",
  ],
  authors: [{ name: "AgendaEu.com" }],
  creator: "AgendaEu.com",
  publisher: "AgendaEu.com",
  metadataBase: new URL(APP_URL),

  openGraph: {
    type: "website",
    url: APP_URL,
    title: "AgendaEu.com | Agenda Online 24/7",
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [{
      url: "/og-image.png", // Imagem de 1200x630px
      width: 1200,
      height: 630,
      alt: "Painel do AgendaEu.com em um notebook.",
    }],
  },

  twitter: {
    card: "summary_large_image",
    title: "AgendaEu.com | Agenda Online para Salão de Beleza e Barbearia",
    description: APP_DESCRIPTION,
    images: ["/og-image.png"],
  },
  
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/agendaeu_logo.png',
    apple: '/agendaeu_logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfdfd" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1b1e" },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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

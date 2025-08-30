
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, BarChart, Bell, Scissors, Palette, CreditCard } from "lucide-react"
import { Logo } from "@/components/logo"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline">AgeNails</span>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Criar Conta</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline tracking-tight">
            Sua agenda de beleza, <span className="text-primary">simplificada</span>.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            AgeNails é a plataforma completa para salões de beleza, clínicas de estética e barbearias. Gerencie sua agenda, clientes e pagamentos em um só lugar.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Comece agora, é grátis</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="bg-muted/50 dark:bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-headline tracking-tight">Tudo que você precisa para crescer</h2>
              <p className="mt-4 text-lg text-muted-foreground">Ferramentas poderosas e fáceis de usar.</p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="text-center transition-shadow">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Agenda Inteligente</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Seus clientes agendam online 24/7. Você tem controle total dos seus horários e serviços.
                </CardContent>
              </Card>
              <Card className="text-center transition-shadow">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Gestão de Clientes</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Mantenha um histórico completo de seus clientes, serviços realizados e preferências.
                </CardContent>
              </Card>
              <Card className="text-center transition-shadow">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Relatórios Simples</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Acompanhe seu desempenho com relatórios de agendamentos, faturamento e muito mais.
                </CardContent>
              </Card>
               <Card className="text-center transition-shadow">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                    <Bell className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="mt-4">Lembretes Automáticos</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Reduza as faltas com lembretes automáticos por WhatsApp para seus clientes.
                </CardContent>
              </Card>
              <Card className="text-center transition-shadow">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                    <CreditCard className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="mt-4">Pagamento Integrado</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Receba um sinal no agendamento e garanta o compromisso do seu cliente.
                </CardContent>
              </Card>
               <Card className="text-center transition-shadow">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                    <Palette className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="mt-4">Sua Marca, Seu Estilo</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                   Configure sua página de agendamento com seu nome e logo em menos de 1 minuto.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="relative isolate overflow-hidden bg-primary/90 px-6 py-24 text-center shadow-2xl rounded-2xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold font-headline tracking-tight text-primary-foreground sm:text-4xl">
              Pronto para transformar seu negócio?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
              Crie sua conta e tenha sua agenda online funcionando em menos de 5 minutos.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">Começar gratuitamente</Link>
              </Button>
            </div>
             <svg
                viewBox="0 0 1024 1024"
                className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
                aria-hidden="true"
              >
                <circle cx={512} cy={512} r={512} fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)" fillOpacity="0.7" />
                <defs>
                  <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                    <stop stopColor="#74B49B" />
                    <stop offset={1} stopColor="#A088B3" />
                  </radialGradient>
                </defs>
              </svg>
          </div>
        </section>

      </main>

      <footer className="bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span>© {new Date().getFullYear()} AgeNails. Todos os direitos reservados.</span>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary">Termos</Link>
            <Link href="#" className="hover:text-primary">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

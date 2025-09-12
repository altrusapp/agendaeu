
"use client"

import Link from "next/link"
import Image from "next/image"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Users, BarChart, MessageCircle, CreditCard, PenTool, CheckCircle, Menu, BookX, CalendarX2, Frown, Sparkles, Smile, Heart } from "lucide-react"
import { Logo } from "@/components/logo"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: <Calendar className="h-8 w-8 text-chart-1" />,
    title: "Agenda Online 24/7",
    description: "Seus clientes marcam sozinhos, sem você parar o trabalho.",
  },
  {
    icon: <Users className="h-8 w-8 text-chart-2" />,
    title: "Gestão de Clientes",
    description: "Saiba quem marcou, histórico de serviços e preferências.",
  },
   {
    icon: <MessageCircle className="h-8 w-8 text-chart-3" />,
    title: "Lembretes sem Esforço",
    description: "Envie lembretes por WhatsApp e reduza as faltas.",
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: "Relatórios Descomplicados",
    description: "Acompanhe agendamentos e faturamento sem planilhas.",
  },
]

export default function Home() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-primary/10 to-transparent -z-10"></div>
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline">AgendaEu.com</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Criar Conta Grátis</Link>
          </Button>
        </nav>
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Abrir menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="right">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>Navegação principal do site para dispositivos móveis.</SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col h-full">
                      <nav className="flex flex-col items-center gap-6 mt-16 text-center">
                          <Link href="/login" className="text-lg font-medium" onClick={() => setOpen(false)}>
                              Entrar
                          </Link>
                          <Button asChild size="lg" onClick={() => setOpen(false)}>
                              <Link href="/signup">Criar Conta Grátis</Link>
                          </Button>
                      </nav>
                  </div>
              </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
           <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline tracking-tight max-w-4xl mx-auto">
            App de Agendamento de Clientes Online Grátis
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Cansado de anotar no caderno e perder clientes por falta de organização? O AgendaEu.com deixa sua agenda online e disponível 24h. Feito para manicures, barbeiros e autônomos da beleza.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Criar Minha Agenda Grátis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="mt-16 sm:mt-24 relative">
             <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
             <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
             <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            <Image
              src="https://i.imgur.com/GXS3oms.jpeg"
              alt="Mockup do aplicativo AgendaEu.com em um notebook e celular"
              width={1200}
              height={650}
              className="rounded-xl shadow-2xl mx-auto ring-1 ring-black/10"
              data-ai-hint="app dashboard"
              priority
            />
          </div>
        </section>
        
        {/* Story & Pain Section */}
        <section id="story-pain" className="py-20 sm:py-24 bg-muted/50 dark:bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Sua agenda de papel está custando caro?</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Se você já marcou duas clientes no mesmo horário, passou o dia inteiro respondendo WhatsApp para agendar ou perdeu dinheiro com clientes que não apareceram, você sabe do que estamos falando.
                    </p>
                    <p className="mt-4 text-lg text-muted-foreground">
                        O AgendaEu.com nasceu exatamente para resolver isso: um sistema de agendamento online simples, que organiza sua rotina e devolve seu tempo.
                    </p>
                </div>
            </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Tudo que seu salão ou barbearia precisa</h2>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center p-6 rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border bg-chart-1/[0.05] border-chart-1/20">
                        <div className="inline-block p-3 rounded-lg bg-chart-1/10">
                            {features[0].icon}
                        </div>
                        <h3 className="mt-4 text-xl font-headline font-semibold">{features[0].title}</h3>
                        <p className="mt-2 text-muted-foreground">{features[0].description}</p>
                    </div>
                    <div className="text-center p-6 rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border bg-chart-2/[0.05] border-chart-2/20">
                        <div className="inline-block p-3 rounded-lg bg-chart-2/10">
                            {features[1].icon}
                        </div>
                        <h3 className="mt-4 text-xl font-headline font-semibold">{features[1].title}</h3>
                        <p className="mt-2 text-muted-foreground">{features[1].description}</p>
                    </div>
                    <div className="text-center p-6 rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border bg-chart-3/[0.05] border-chart-3/20">
                        <div className="inline-block p-3 rounded-lg bg-chart-3/10">
                            {features[2].icon}
                        </div>
                        <h3 className="mt-4 text-xl font-headline font-semibold">{features[2].title}</h3>
                        <p className="mt-2 text-muted-foreground">{features[2].description}</p>
                    </div>
                    <div className="text-center p-6 rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border bg-primary/5 border-primary/20">
                        <div className="inline-block p-3 rounded-lg bg-primary/10">
                            {features[3].icon}
                        </div>
                        <h3 className="mt-4 text-xl font-headline font-semibold">{features[3].title}</h3>
                        <p className="mt-2 text-muted-foreground">{features[3].description}</p>
                    </div>
                </div>
                 <div className="mt-16 text-center">
                    <Button size="lg" variant="default" asChild>
                        <Link href="/signup">Quero Organizar Minha Agenda</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Storytelling Section */}
        <section id="story" className="py-20 sm:py-24 bg-muted/50 dark:bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">De um caderno bagunçado para a agenda que resolve</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        O AgendaEu.com nasceu da necessidade real de uma manicure e mãe que, como você, precisava de mais organização e menos estresse.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {/* The Problem (Before) */}
                    <div className="bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-lg p-8 space-y-6">
                        <h3 className="text-2xl font-bold font-headline text-center text-destructive">O Problema (Antes)</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4">
                                <div className="p-2 bg-destructive/10 rounded-full">
                                    <BookX className="h-6 w-6 text-destructive" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Caderno bagunçado</h4>
                                    <p className="text-muted-foreground">Anotações difíceis de ler, rasuras e horários perdidos.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-2 bg-destructive/10 rounded-full">
                                    <CalendarX2 className="h-6 w-6 text-destructive" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Horários duplicados</h4>
                                    <p className="text-muted-foreground">Marcar duas clientes no mesmo horário e gerar frustração.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-2 bg-destructive/10 rounded-full">
                                    <Frown className="h-6 w-6 text-destructive" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Estresse e preocupação</h4>
                                    <p className="text-muted-foreground">Medo constante de ter esquecido algo ou de perder dinheiro.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* The Solution (After) */}
                    <div className="bg-success/5 dark:bg-success/10 border border-success/20 rounded-lg p-8 space-y-6">
                        <h3 className="text-2xl font-bold font-headline text-center text-success">A Solução (Depois)</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4">
                                <div className="p-2 bg-success/10 rounded-full">
                                    <Sparkles className="h-6 w-6 text-success" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Agenda que Resolve</h4>
                                    <p className="text-muted-foreground">Tudo online, organizado e acessível de qualquer lugar.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-2 bg-success/10 rounded-full">
                                    <Smile className="h-6 w-6 text-success" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Mais tranquilidade</h4>
                                    <p className="text-muted-foreground">Deixe os clientes agendarem sozinhos e foque no seu trabalho.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="p-2 bg-success/10 rounded-full">
                                    <Heart className="h-6 w-6 text-success" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">Foco no Cliente</h4>
                                    <p className="text-muted-foreground">Use seu tempo para cuidar bem de quem confia em você.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Detailed Features Section */}
        <section id="detailed-features" className="py-20 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Sua agenda online em menos de 5 minutos</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Esqueça complicação. No AgendaEu.com você cria sua conta grátis e já sai usando: agendamento, gestão de clientes, lembretes e muito mais.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-chart-1/[0.05] border border-chart-1/20">
                        <div className="inline-block p-3 bg-chart-1/10 rounded-lg">
                           <CreditCard className="h-8 w-8 text-chart-1" />
                        </div>
                        <div className="flex items-center gap-2">
                           <h3 className="text-xl font-headline font-semibold mt-4">Pagamentos Garantidos</h3>
                           <Badge variant="outline" className="mt-4">Em breve</Badge>
                        </div>
                        <p className="text-muted-foreground mt-2">Receba um sinal no agendamento e evite prejuízos. Menos furos, mais faturamento.</p>
                    </div>
                    <div className="p-8 rounded-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-chart-2/[0.05] border border-chart-2/20">
                        <div className="inline-block p-3 bg-chart-2/10 rounded-lg">
                            <PenTool className="h-8 w-8 text-chart-2" />
                        </div>
                        <h3 className="text-xl font-headline font-semibold mt-4">Sua Marca em Destaque</h3>
                        <p className="text-muted-foreground mt-2">Personalize sua página com nome e logo em 1 minuto. Deixe com a sua cara.</p>
                    </div>
                     <div className="p-8 rounded-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-chart-3/[0.05] border border-chart-3/20">
                        <div className="inline-block p-3 bg-chart-3/10 rounded-lg">
                            <CheckCircle className="h-8 w-8 text-chart-3" />
                        </div>
                        <h3 className="text-xl font-headline font-semibold mt-4">Organização em Minutos</h3>
                        <p className="text-muted-foreground mt-2">Crie sua conta, adicione seus serviços e tenha sua agenda online funcionando. Sem complicação.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 sm:py-24">
           <div className="container mx-auto px-4 sm:px-6 lg:px-8">
             <div className="relative isolate overflow-hidden bg-primary/90 px-6 py-20 text-center shadow-xl rounded-2xl sm:px-16">
                <h2 className="mx-auto max-w-2xl text-3xl font-bold font-headline tracking-tight text-primary-foreground sm:text-4xl">
                  Pronto para transformar seu negócio?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
                  Junte-se aos profissionais que já simplificaram suas agendas e estão focando no que realmente importa: seus clientes.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/signup">
                        Criar Conta Gratuita
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
                <svg
                    viewBox="0 0 1024 1024"
                    className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
                    aria-hidden="true"
                >
                    <circle cx={512} cy={512} r={512} fill="url(#gradient-circle)" fillOpacity="0.7" />
                    <defs>
                    <radialGradient id="gradient-circle">
                        <stop stopColor="#A088B3" />
                        <stop offset={1} stopColor="#8B5CF6" />
                    </radialGradient>
                    </defs>
                </svg>
             </div>
           </div>
        </section>

      </main>

      <footer className="bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span>© {new Date().getFullYear()} AgendaEu.com. Todos os direitos reservados.</span>
          </div>
          <div className="flex gap-4">
            <Link href="/termos" className="hover:text-primary">Termos</Link>
            <Link href="/privacidade" className="hover:text-primary">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

    
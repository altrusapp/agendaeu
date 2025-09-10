
"use client"

import Link from "next/link"
import Image from "next/image"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Users, BarChart, MessageCircle, CreditCard, PenTool, CheckCircle, Menu } from "lucide-react"
import { Logo } from "@/components/logo"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"

const features = [
  {
    icon: <Calendar className="h-8 w-8 text-chart-1" />,
    title: "Agenda Online 24/7",
    description: "Seus clientes marcam sozinhos, sem você parar o trabalho.",
    color: "chart-1"
  },
  {
    icon: <Users className="h-8 w-8 text-chart-2" />,
    title: "Gestão de Clientes",
    description: "Saiba quem marcou, histórico de serviços e preferências.",
    color: "chart-2"
  },
   {
    icon: <MessageCircle className="h-8 w-8 text-chart-3" />,
    title: "Lembretes sem Esforço",
    description: "Envie lembretes por WhatsApp e reduza as faltas.",
    color: "chart-3"
  },
  {
    icon: <BarChart className="h-8 w-8 text-chart-4" />,
    title: "Relatórios Descomplicados",
    description: "Acompanhe agendamentos e faturamento sem planilhas.",
    color: "chart-4"
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
            Chega de perder horários e anotar tudo no caderno.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Com o AgendaEu.com, sua agenda fica online, organizada e funcionando 24 horas por dia. Feito para manicures, barbeiros e pequenos salões que precisam praticidade sem complicação.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">
                Começar Gratuitamente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="mt-16 sm:mt-24 relative">
             <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
             <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
             <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            <Image
              src="https://picsum.photos/1200/650"
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
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Você já passou por isso?</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Anotando horários em cadernos e descobrindo que marcou duas clientes no mesmo horário? Ou pior: esqueceu de confirmar e a cliente não apareceu?
                    </p>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Foi exatamente assim que nasceu o AgendaEu.com: criado para ajudar profissionais como você a organizar a rotina e nunca mais perder tempo ou dinheiro com desencontros.
                    </p>
                </div>
            </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Tudo que você precisa em um só lugar</h2>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center p-6 rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border bg-card">
                            <div className={`inline-block p-3 bg-${feature.color}/10 rounded-lg`}>
                                {feature.icon}
                            </div>
                            <h3 className="mt-4 text-xl font-headline font-semibold">{feature.title}</h3>
                            <p className="mt-2 text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
                 <div className="mt-16 text-center">
                    <Button size="lg" asChild>
                        <Link href="/signup">Criar Conta Grátis</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Storytelling Section */}
        <section id="story" className="py-20 sm:py-24 bg-muted/50 dark:bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold font-headline tracking-tight">De um caderno bagunçado para a agenda que resolve</h2>
                         <p className="text-lg text-muted-foreground">
                           O AgendaEu.com nasceu dentro de casa. Vi minha irmã — manicure e mãe de duas meninas — tentando se virar com um caderno cheio de anotações. O problema? Horários duplicados, compromissos esquecidos e muito estresse.
                        </p>
                        <p className="text-lg text-muted-foreground">
                           Daí surgiu a ideia: transformar toda essa confusão em uma solução simples e prática. Hoje, ajudamos profissionais a terem mais tranquilidade e foco no que realmente importa: cuidar bem dos seus clientes.
                        </p>
                    </div>
                    <div className="relative h-96">
                       <Image 
                        src="https://picsum.photos/500/350?grayscale" 
                        alt="Pessoa escrevendo em um caderno" 
                        width={500} 
                        height={350} 
                        className="rounded-lg shadow-md absolute top-0 left-0"
                        data-ai-hint="person writing notebook"
                        />
                       <Image 
                        src="https://picsum.photos/500/350" 
                        alt="Mockup do aplicativo sendo usado" 
                        width={500} 
                        height={350} 
                        className="rounded-lg shadow-xl absolute bottom-0 right-0 border-4 border-background"
                        data-ai-hint="app schedule"
                        />
                    </div>
                </div>
            </div>
        </section>
        
        {/* Detailed Features Section */}
        <section id="detailed-features" className="py-20 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Sua agenda pronta em menos de 5 minutos</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Esqueça complicação. No AgendaEu.com você cria sua conta grátis e já sai usando: agendamento, gestão de clientes, lembretes e muito mais.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="border p-8 rounded-xl bg-card shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="inline-block p-3 bg-primary/10 rounded-lg">
                           <CreditCard className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-headline font-semibold mt-4">Pagamentos Garantidos</h3>
                        <p className="text-muted-foreground mt-2">Receba um sinal no agendamento e evite prejuízos. Menos furos, mais faturamento.</p>
                    </div>
                    <div className="border p-8 rounded-xl bg-card shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="inline-block p-3 bg-primary/10 rounded-lg">
                            <PenTool className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-headline font-semibold mt-4">Sua Marca em Destaque</h3>
                        <p className="text-muted-foreground mt-2">Personalize sua página com nome e logo em 1 minuto. Deixe com a sua cara.</p>
                    </div>
                     <div className="border p-8 rounded-xl bg-card shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="inline-block p-3 bg-primary/10 rounded-lg">
                            <CheckCircle className="h-8 w-8 text-primary" />
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
                  Junte-se a centenas de profissionais que já simplificaram suas agendas e estão focando no que realmente importa.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/signup">
                        Criar Conta Gratuitamente
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
            <Link href="#" className="hover:text-primary">Termos</Link>
            <Link href="#" className="hover:text-primary">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

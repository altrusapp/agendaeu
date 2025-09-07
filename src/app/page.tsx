
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Users, BarChart, MessageCircle, CreditCard, PenTool, CheckCircle } from "lucide-react"
import { Logo } from "@/components/logo"

const features = [
  {
    icon: <Calendar className="h-8 w-8 text-primary" />,
    title: "Agenda Inteligente",
    description: "Clientes agendam online 24/7. Você tem controle total dos seus horários, sem interrupções.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Gestão de Clientes",
    description: "Tenha um histórico completo dos seus clientes, serviços realizados e preferências.",
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: "Relatórios Simples",
    description: "Acompanhe seus agendamentos e faturamento de forma descomplicada, sem planilhas.",
  },
    {
    icon: <MessageCircle className="h-8 w-8 text-primary" />,
    title: "Lembretes Automáticos",
    description: "Reduza as faltas com lembretes automáticos por WhatsApp enviados aos seus clientes.",
  },
]

export default function Home() {
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
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline tracking-tight max-w-4xl mx-auto">
            Sua agenda profissional, simplificada.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            AgendaEu.com é a plataforma completa para profissionais e pequenos negócios. Gerencie agenda, clientes e pagamentos em um só lugar.
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
        
        {/* Benefits Section */}
        <section id="benefits" className="py-20 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center">
                            {feature.icon}
                            <h3 className="mt-4 text-xl font-headline font-semibold">{feature.title}</h3>
                            <p className="mt-2 text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
                 <div className="mt-16 text-center">
                    <Button variant="outline" asChild>
                        <Link href="/signup">Comece agora, é grátis</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Storytelling Section */}
        <section id="story" className="py-20 sm:py-24 bg-muted/50 dark:bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold font-headline tracking-tight">De um caderno bagunçado para uma agenda profissional.</h2>
                        <p className="text-lg text-muted-foreground">
                            O AgendaEu.com nasceu dentro de casa. Vi minha irmã — manicure e mãe de duas meninas — tentando se virar com um caderno cheio de anotações e clientes chamando no WhatsApp sem parar.
                        </p>
                        <p className="text-lg text-muted-foreground">
                           O resultado? Horários duplicados, compromissos esquecidos e muito estresse. Foi aí que surgiu a ideia de transformar essa confusão em uma solução simples e prática. Hoje, ajudamos profissionais a terem mais tranquilidade e foco no que realmente importa: cuidar bem dos seus clientes.
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
                    <h2 className="text-3xl font-bold font-headline tracking-tight">Ferramentas poderosas para o seu dia a dia</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Tudo pensado para ser simples, rápido e resolver problemas reais do seu negócio.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-muted/50 dark:bg-card p-8 rounded-xl">
                        <CreditCard className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-headline font-semibold mt-4">Pagamento Integrado</h3>
                        <p className="text-muted-foreground mt-2">Receba um sinal no agendamento e garanta o compromisso dos seus clientes. Menos furos, mais faturamento.</p>
                    </div>
                    <div className="bg-muted/50 dark:bg-card p-8 rounded-xl">
                        <PenTool className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-headline font-semibold mt-4">Sua Marca, Seu Estilo</h3>
                        <p className="text-muted-foreground mt-2">Personalize sua página de agendamento com seu nome e sua logo. Deixe com a sua cara em menos de 1 minuto.</p>
                    </div>
                     <div className="bg-muted/50 dark:bg-card p-8 rounded-xl">
                        <CheckCircle className="h-8 w-8 text-primary" />
                        <h3 className="text-xl font-headline font-semibold mt-4">Organização em Minutos</h3>
                        <p className="text-muted-foreground mt-2">Crie sua conta, adicione seus serviços e tenha sua agenda online funcionando. Sem complicação nem manual.</p>
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
                        Começar Gratuitamente
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

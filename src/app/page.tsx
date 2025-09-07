
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Calendar, Users, BarChart, Bell, Scissors, Palette, CreditCard } from "lucide-react"
import { Logo } from "@/components/logo"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline">AgendaEu.com</span>
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
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline tracking-tight">
            👉 “Chega de perder horários e anotar tudo no caderno.”
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Com o AgendaEu.com, sua agenda fica online, organizada e funcionando 24 horas por dia.
            Feito para manicures, barbeiros e pequenos salões que precisam praticidade sem complicação.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Começar Gratuitamente</Link>
            </Button>
          </div>
        </section>

        {/* Seção 1 – A Dor & A Solução */}
        <section id="solution" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold font-headline tracking-tight">De um caderno bagunçado para a agenda profissional que resolve</h2>
                <p className="mt-6 text-lg text-muted-foreground">
                    Você já se viu anotando horários em cadernos e depois descobrindo que marcou duas clientes no mesmo horário?
                    Ou pior: esqueceu de confirmar e a cliente não apareceu?
                </p>
                <p className="mt-4 text-lg text-muted-foreground">
                    Foi exatamente assim que nasceu o AgendaEu.com: criado para ajudar profissionais como você a organizar a rotina e nunca mais perder tempo ou dinheiro com desencontros.
                </p>
            </div>
        </section>


        {/* Seção 2 – Benefícios */}
        <section id="features" className="bg-muted/50 dark:bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-headline tracking-tight">Tudo que você precisa em um só lugar:</h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-start gap-4">
                    <Check className="h-6 w-6 text-success shrink-0 mt-1" />
                    <p className="text-lg text-muted-foreground"><strong className="text-foreground">Agenda Online 24/7</strong> – seus clientes marcam sozinhos, sem você parar o trabalho.</p>
                </div>
                <div className="flex items-start gap-4">
                    <Check className="h-6 w-6 text-success shrink-0 mt-1" />
                    <p className="text-lg text-muted-foreground"><strong className="text-foreground">Gestão de Clientes</strong> – saiba quem marcou, histórico de serviços e preferências.</p>
                </div>
                <div className="flex items-start gap-4">
                    <Check className="h-6 w-6 text-success shrink-0 mt-1" />
                    <p className="text-lg text-muted-foreground"><strong className="text-foreground">Lembretes sem Esforço</strong> – envie lembretes por WhatsApp e reduza faltas.</p>
                </div>
                <div className="flex items-start gap-4">
                    <Check className="h-6 w-6 text-success shrink-0 mt-1" />
                    <p className="text-lg text-muted-foreground"><strong className="text-foreground">Pagamentos Garantidos</strong> – receba sinal no agendamento e evite prejuízos.</p>
                </div>
                <div className="flex items-start gap-4">
                    <Check className="h-6 w-6 text-success shrink-0 mt-1" />
                    <p className="text-lg text-muted-foreground"><strong className="text-foreground">Sua Marca em Destaque</strong> – personalize sua página com nome e logo em 1 minuto.</p>
                </div>
                 <div className="flex items-start gap-4">
                    <Check className="h-6 w-6 text-success shrink-0 mt-1" />
                    <p className="text-lg text-muted-foreground"><strong className="text-foreground">Relatórios Descomplicados</strong> – acompanhe agendamentos e faturamento sem planilhas.</p>
                </div>
            </div>
             <div className="mt-12 text-center">
                <Button size="lg" variant="outline" asChild>
                    <Link href="/signup">Criar Conta Grátis</Link>
                </Button>
            </div>
          </div>
        </section>
        
        {/* Seção 3 – Prova & Origem */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
           <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold font-headline tracking-tight">O AgendaEu.com nasceu dentro de casa.</h2>
                 <p className="mt-6 text-lg text-muted-foreground">
                    Vi minha irmã — manicure e mãe de duas meninas — tentando se virar com um caderno cheio de anotações.
                </p>
                <p className="mt-4 text-lg text-muted-foreground">
                    O problema? Horários duplicados, compromissos esquecidos e muito estresse.
                </p>
                <p className="mt-4 text-lg text-muted-foreground">
                    Daí surgiu a ideia: transformar toda essa confusão em uma solução simples e prática.
                    Hoje, o AgendaEu é a agenda + gestão de clientes digital que ajuda profissionais solos a terem mais tranquilidade, foco e tempo para o que realmente importa: cuidar bem dos seus clientes.
                </p>
            </div>
        </section>

        {/* Seção 4 – Promessa Final */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="relative isolate overflow-hidden bg-primary/90 px-6 py-24 text-center shadow-2xl rounded-2xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold font-headline tracking-tight text-primary-foreground sm:text-4xl">
              Sua agenda pronta em menos de 5 minutos.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
              Esqueça complicação de sistemas cheios de botões.
              No AgendaEu.com você cria sua conta grátis e já sai usando: agendamento, gestão de clientes, lembretes e muito mais.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">Criar Conta Gratuitamente</Link>
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

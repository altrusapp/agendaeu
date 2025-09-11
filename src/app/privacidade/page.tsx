
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <div className="bg-background min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline">AgendaEu.com</span>
        </Link>
         <div className="flex items-center gap-4">
           <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Acessar Painel
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <article className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <h1>Política de Privacidade</h1>
          <p>Última atualização: 11 de setembro de 2025</p>
          
          <p>
            Esta página será atualizada em breve com os detalhes completos sobre como tratamos seus dados.
          </p>
          <p>
            Nosso compromisso é com a transparência e a segurança das suas informações, em total conformidade com a Lei Geral de Proteção de Dados (LGPD) do Brasil.
          </p>

           <p>Em caso de dúvidas, entre em contato conosco pelo e-mail: <a href="mailto:suporte.agendaeu@gmail.com">suporte.agendaeu@gmail.com</a>.</p>
        </article>
      </main>
       <footer className="bg-transparent mt-auto">
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
  );
}

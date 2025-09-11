
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function TermosDeServicoPage() {
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
          <h1>Termos de Serviço do AgendaEu.com</h1>
          <p className="lead">Última atualização: 11 de setembro de 2025</p>

          <p>Bem-vindo(a) ao AgendaEu.com!</p>
          <p>
            Estes Termos de Serviço ("Termos") regem o seu acesso e uso da nossa
            plataforma de agendamento online, incluindo nosso website,
            aplicativos e serviços relacionados (coletivamente, a "Plataforma").
            Ao criar uma conta ou utilizar nossos serviços, você concorda em
            cumprir e se vincular a estes Termos.
          </p>
          <p>Por favor, leia este documento com atenção.</p>

          <h2>1. Visão Geral do Serviço</h2>
          <p>
            O AgendaEu.com é uma plataforma de software como serviço (SaaS)
            projetada para auxiliar profissionais autônomos e pequenos negócios,
            como manicures, barbeiros e salões de beleza ("Usuários" ou "Você"), a
            gerenciar suas agendas de forma digital. Nossos serviços incluem, mas
            não se limitam a:
          </p>
          <ul>
            <li>Agenda Online 24/7;</li>
            <li>Gestão de Clientes;</li>
            <li>Lembretes Automáticos via WhatsApp;</li>
            <li>Relatórios Simplificados;</li>
            <li>Processamento de Pagamentos de sinal;</li>
            <li>Página Personalizável.</li>
          </ul>

          <h2>2. Status de Teste (Beta)</h2>
          <p>
            Você reconhece e concorda que a Plataforma AgendaEu.com está
            atualmente em sua fase de testes (também conhecida como "fase Beta").
            Ao utilizar o serviço neste estágio, você entende que:
          </p>
          <p>
            a) O serviço pode conter erros, bugs e instabilidades, e pode não
            operar de forma ininterrupta ou totalmente livre de falhas.
          </p>
          <p>
            b) As funcionalidades e recursos podem ser modificados, adicionados
            ou removidos sem aviso prévio, à medida que continuamos a desenvolver
            e aprimorar a Plataforma.
          </p>
          <p>
            c) A Plataforma é fornecida "no estado em que se encontra", sem
            quaisquer garantias de desempenho ou confiabilidade, expressas ou
            implícitas.
          </p>
          <p>
            d) Embora empreguemos esforços para proteger seus dados, o risco de
            perda de informações pode ser maior durante a fase de testes.
            Recomendamos que você mantenha backups próprios de suas informações
            essenciais.
          </p>
          <p>
            Seu uso e feedback durante esta fase são de grande valor para nós e
            nos ajudarão a construir um serviço melhor.
          </p>

          <h2>3. Elegibilidade e Criação de Conta</h2>
          <p>Para utilizar a Plataforma, você deve:</p>
          <p>
            a) Ter no mínimo 18 anos de idade e capacidade legal para celebrar um
            contrato vinculativo.
          </p>
          <p>
            b) Fornecer informações verdadeiras, precisas e completas durante o
            processo de cadastro.
          </p>
          <p>
            c) Manter a confidencialidade de sua senha e ser o único responsável
            por todas as atividades que ocorram em sua conta.
          </p>
          <p>
            Você concorda em nos notificar imediatamente sobre qualquer uso não
            autorizado de sua conta.
          </p>

          <h2>4. Planos e Pagamentos</h2>
          <p>
            a) Planos Gratuitos e Pagos: O AgendaEu.com pode oferecer planos de
            serviço gratuitos e pagos ("Assinaturas"). As funcionalidades
            disponíveis podem variar de acordo com o plano escolhido.
          </p>
          <p>
            b) Pagamentos de Assinatura: Para os planos pagos, a cobrança será
            realizada de forma recorrente (mensal ou anual). Os pagamentos serão
            processados por meio de um provedor de pagamento terceirizado.
          </p>
          <p>
            c) Pagamentos Garantidos (Sinal): A funcionalidade "Pagamentos
            Garantidos" permite que você exija um pagamento de sinal de seus
            clientes ("Clientes Finais") no momento do agendamento. Você entende
            que o AgendaEu.com atua como um facilitador para essa transação e não
            é parte na prestação de serviço entre você e seu Cliente Final.
            Disputas sobre o serviço prestado são de sua exclusiva
            responsabilidade.
          </p>
          <p>
            d) Reembolsos: Salvo disposição em contrário na legislação aplicável,
            todos os pagamentos de assinatura não são reembolsáveis.
          </p>

          <h2>5. Uso Aceitável da Plataforma</h2>
          <p>Ao utilizar o AgendaEu.com, você concorda em não:</p>
          <p>a) Utilizar a Plataforma para qualquer finalidade ilegal ou fraudulenta.</p>
          <p>b) Enviar spam ou mensagens não solicitadas em violação às leis aplicáveis.</p>
          <p>c) Fazer upload de conteúdo que infrinja os direitos de terceiros.</p>
          <p>d) Tentar fazer engenharia reversa ou comprometer a segurança de nossos sistemas.</p>

          <h2>6. Propriedade Intelectual</h2>
          <p>
            a) Nossa Propriedade: Todo o Conteúdo da Plataforma (software,
            design, logotipos, etc.) é de propriedade exclusiva do AgendaEu.com.
          </p>
          <p>
            b) Sua Propriedade: Você retém todos os direitos sobre o seu
            Conteúdo do Usuário (lista de clientes, informações de serviços,
            etc.). Você nos concede uma licença limitada para usar esses dados
            com o único propósito de operar a Plataforma para você.
          </p>

          <h2>7. Privacidade e Proteção de Dados</h2>
          <p>
            O tratamento de dados pessoais é regido pela nossa{' '}
            <Link href="/privacidade" className="underline">Política de Privacidade</Link>
            , em conformidade com a Lei Geral de Proteção de Dados Pessoais
            (LGPD). Você é o controlador dos dados dos seus Clientes Finais e
            responsável por obter as devidas autorizações para inseri-los na
            Plataforma.
          </p>

          <h2>8. Limitação de Responsabilidade</h2>
          <p>
            Dada a natureza de teste (Beta) da Plataforma, seu uso é por sua
            conta e risco. Na máxima extensão permitida pela lei, o AgendaEu.com
            não se responsabiliza por quaisquer perdas de lucros, receitas,
            dados ou danos indiretos decorrentes do uso ou da incapacidade de
            usar o serviço, especialmente os causados por bugs ou
            instabilidades.
          </p>
          <p>
            Nossa responsabilidade total limita-se ao maior dos seguintes
            valores: (i) o montante pago por você nos três (3) meses anteriores
            à reclamação ou (ii) R$ 100,00 (cem reais).
          </p>

          <h2>9. Rescisão</h2>
          <p>a) Por Você: Você pode cancelar sua conta a qualquer momento.</p>
          <p>
            b) Por Nós: Reservamo-nos o direito de suspender ou encerrar sua
            conta caso você viole estes Termos.
          </p>

          <h2>10. Alterações nos Termos</h2>
          <p>
            Podemos modificar estes Termos a qualquer momento, notificando você
            sobre alterações significativas por e-mail ou através de um aviso na
            Plataforma.
          </p>

          <h2>11. Disposições Gerais</h2>
          <p>a) Legislação Aplicável: Estes Termos são regidos pelas leis da República Federativa do Brasil.</p>
          <p>b) Foro: Fica eleito o foro da comarca de São Paulo, SP, para dirimir quaisquer controvérsias.</p>
          <p>
            c) Contato: Em caso de dúvidas, entre em contato conosco pelo e-mail: <a href="mailto:suporte.agendaeu@gmail.com">suporte.agendaeu@gmail.com</a>.
          </p>
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

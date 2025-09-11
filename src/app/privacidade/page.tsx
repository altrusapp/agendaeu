
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
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
          <h1>Política de Privacidade do AgendaEu.com</h1>
          <p>Última atualização: 11 de setembro de 2025</p>

          <h2>1. Introdução</h2>
          <p>
            A sua privacidade e a proteção dos seus dados são uma prioridade
            para o AgendaEu.com ("nós", "nosso"). Esta Política de Privacidade
            descreve como coletamos, usamos, armazenamos, compartilhamos e
            protegemos as informações pessoais dos usuários da nossa plataforma
            ("Plataforma").
          </p>
          <p>
            Ao utilizar os serviços do AgendaEu.com, você confia a nós suas
            informações e as de seus clientes. Entendemos a responsabilidade que
            isso representa e nos empenhamos para proteger esses dados.
          </p>
          <p>
            Esta política se aplica a todos os usuários profissionais ("Usuário"
            ou "Você") que se cadastram e utilizam nossa Plataforma para
            gerenciar seus negócios.
          </p>

          <h2>2. Papéis no Tratamento de Dados (Controlador e Operador)</h2>
          <p>
            É fundamental entender os diferentes papéis no tratamento de dados,
            conforme a Lei Geral de Proteção de Dados (LGPD):
          </p>
          <ul>
            <li>
              <strong>AgendaEu.com como Controlador:</strong> Nós somos o
              Controlador dos dados pessoais que Você (o Profissional) nos
              fornece durante o seu cadastro e uso da plataforma (ex: seu nome,
              e-mail, dados de pagamento da assinatura). Nós definimos a
              finalidade e os meios de tratamento desses dados.
            </li>
            <li>
              <strong>Você (Profissional) como Controlador:</strong> Você é o
              Controlador dos dados pessoais dos seus clientes ("Clientes
              Finais") que você insere e gerencia na Plataforma (ex: nome e
              telefone do cliente). Você é o responsável por esses dados e por
              garantir que tem a permissão legal para coletá-los e utilizá-los.
            </li>
            <li>
              <strong>AgendaEu.com como Operador:</strong> Nós atuamos como
              Operador em relação aos dados dos seus Clientes Finais. Isso
              significa que apenas processamos esses dados em seu nome e de
              acordo com as suas instruções (por exemplo, para agendar um
              horário ou enviar um lembrete).
            </li>
          </ul>

          <h2>3. Quais Dados Coletamos?</h2>
          <p>
            Coletamos diferentes tipos de informações para fornecer e melhorar
            nossos serviços:
          </p>
          <h3>a) Dados Fornecidos por Você (Profissional):</h3>
          <ul>
            <li>
              <strong>Informações de Cadastro:</strong> Nome completo, endereço
              de e-mail, número de telefone, senha.
            </li>
            <li>
              <strong>Informações do Negócio:</strong> Nome do seu negócio,
              serviços oferecidos, preços, logotipo.
            </li>
            <li>
              <strong>Informações de Pagamento:</strong> Dados necessários para o
              processamento da sua assinatura (geralmente processados
              diretamente por nosso parceiro de pagamentos).
            </li>
          </ul>
          <h3>b) Dados dos Seus Clientes Finais (Inseridos por Você):</h3>
          <ul>
            <li>
              <strong>Informações de Contato:</strong> Nome e número de telefone
              do Cliente Final.
            </li>
            <li>
              <strong>Histórico de Agendamento:</strong> Datas, horários e
              serviços agendados pelo Cliente Final.
            </li>
          </ul>
          <h3>c) Dados Coletados Automaticamente:</h3>
          <ul>
            <li>
              <strong>Informações de Uso:</strong> Endereço IP, tipo de navegador
              e dispositivo, páginas visitadas em nossa Plataforma, data e hora
              dos acessos.
            </li>
            <li>
              <strong>Cookies e Tecnologias Semelhantes:</strong> Utilizamos
              cookies para garantir o funcionamento da Plataforma, lembrar suas
              preferências e coletar dados analíticos.
            </li>
          </ul>

          <h2>4. Para Quais Finalidades Utilizamos os Dados?</h2>
          <p>
            Utilizamos os dados coletados para as seguintes finalidades:
          </p>
          <ul>
            <li>
              <strong>Para Prestar o Serviço:</strong> Criar e gerenciar sua
              conta, processar agendamentos, permitir a gestão de clientes e
              gerar relatórios.
            </li>
            <li>
              <strong>Para Comunicação:</strong> Enviar lembretes de agendamento
              para seus Clientes Finais (em seu nome), comunicar sobre
              atualizações importantes da Plataforma, suporte técnico e
              informações administrativas.
            </li>
            <li>
              <strong>Para Processamento de Pagamentos:</strong> Gerenciar suas
              assinaturas e facilitar o recebimento de sinais de agendamento.
            </li>
            <li>
              <strong>Para Melhoria da Plataforma:</strong> Analisar como os
              usuários interagem com o serviço para identificar problemas,
              desenvolver novos recursos e melhorar a experiência geral.
            </li>
            <li>
              <strong>Para Segurança e Cumprimento Legal:</strong> Proteger a
              segurança da nossa Plataforma e cumprir com obrigações legais,
              regulatórias ou ordens judiciais.
            </li>
          </ul>

          <h2>5. Com Quem Compartilhamos os Dados?</h2>
          <p>
            Nós não vendemos seus dados pessoais. O compartilhamento ocorre
            apenas quando necessário para a prestação do serviço, com parceiros
            que seguem rigorosos padrões de segurança e privacidade:
          </p>
          <ul>
            <li>
              <strong>Provedores de Serviços de Nuvem:</strong> Para hospedar
              nossa plataforma e armazenar os dados de forma segura (ex: Amazon
              Web Services, Google Cloud).
            </li>
            <li>
              <strong>Processadores de Pagamento:</strong> Para processar as
              transações de assinatura e os sinais de agendamento de forma
              segura.
            </li>
            <li>
              <strong>Ferramentas de Comunicação:</strong> Para o envio de
              e-mails transacionais e lembretes via WhatsApp.
            </li>
            <li>
              <strong>Ferramentas de Análise:</strong> Para entender o uso da
              nossa plataforma e melhorá-la (os dados são geralmente
              compartilhados de forma agregada ou anonimizada).
            </li>
            <li>
              <strong>Autoridades Legais:</strong> Em caso de requisição
              judicial ou obrigação legal.
            </li>
          </ul>

          <h2>6. Por Quanto Tempo Armazenamos os Dados?</h2>
          <p>
            Armazenamos seus dados pessoais apenas pelo tempo necessário para
            cumprir as finalidades para as quais foram coletados.
          </p>
          <ul>
            <li>
              Os dados da sua conta de Usuário são mantidos enquanto sua conta
              estiver ativa.
            </li>
            <li>
              Os dados dos seus Clientes Finais são mantidos enquanto você
              utilizar a Plataforma para gerenciá-los.
            </li>
            <li>
              Após o cancelamento da sua conta, os dados podem ser mantidos por
              um período adicional para fins legais, fiscais ou de auditoria,
              sendo excluídos ou anonimizados de forma segura após esse
              período.
            </li>
          </ul>

          <h2>7. Seus Direitos como Titular dos Dados (LGPD)</h2>
          <p>
            A LGPD garante a você, como titular dos seus dados pessoais, diversos
            direitos. Você pode solicitar a qualquer momento:
          </p>
          <ul>
            <li>Confirmação da existência de tratamento dos seus dados.</li>
            <li>Acesso aos seus dados.</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
            <li>
              Anonimização, bloqueio ou eliminação de dados desnecessários ou
              tratados em desconformidade com a lei.
            </li>
            <li>Portabilidade dos seus dados a outro fornecedor de serviço.</li>
            <li>
              Eliminação dos dados pessoais tratados com o seu consentimento.
            </li>
            <li>
              Informação sobre as entidades com as quais compartilhamos seus
              dados.
            </li>
            <li>Revogação do consentimento.</li>
          </ul>
          <p>
            Para exercer seus direitos, entre em contato conosco através do canal
            informado no final desta política.
          </p>

          <h2>8. Segurança dos Dados</h2>
          <p>
            Adotamos medidas técnicas e administrativas rigorosas para proteger
            os dados pessoais contra acesso não autorizado, destruição, perda,
            alteração ou qualquer forma de tratamento inadequado. Isso inclui
            criptografia, controle de acesso e monitoramento contínuo de nossos
            sistemas.
          </p>

          <h2>9. Alterações nesta Política de Privacidade</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente.
            Notificaremos você sobre quaisquer alterações significativas através
            de um aviso na Plataforma ou por e-mail. Recomendamos que você
            revise esta página regularmente.
          </p>

          <h2>10. Contato</h2>
          <p>
            Se você tiver qualquer dúvida sobre esta Política de Privacidade ou
            sobre como tratamos seus dados, entre em contato com nosso
            Encarregado de Proteção de Dados (DPO):
          </p>
          <p>
            E-mail:{' '}
            <a href="mailto:suporte.agendaeu@gmail.com">
              suporte.agendaeu@gmail.com
            </a>
            .
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

    
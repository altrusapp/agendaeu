
"use client"

import * as React from "react";
import { Download } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function InstallPwaButton() {
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      // Previne que o mini-infobar apareça no Chrome
      event.preventDefault();
      // Guarda o evento para que ele possa ser disparado depois
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = async () => {
    if (!installPrompt) {
        // Se o prompt não estiver disponível, não faz nada. 
        // Isso não deve acontecer se o botão está visível.
        return;
    }
    // Mostra o prompt de instalação
    await installPrompt.prompt();
    // Espera o usuário responder ao prompt
    const { outcome } = await installPrompt.userChoice;
    // Opcionalmente, pode-se enviar análises com o resultado
    if (outcome === 'accepted') {
      // Limpa o prompt para que ele não possa ser usado novamente
      setInstallPrompt(null);
      toast({
        variant: "success",
        title: "Aplicativo Instalado!",
        description: "O AgendaEu foi adicionado à sua tela de início.",
      });
    }
  };
  
  // Renderiza o botão apenas se o prompt de instalação estiver disponível.
  if (!installPrompt) {
    return null;
  }
  
  return (
    <DropdownMenuItem onClick={handleInstallClick}>
      <Download className="mr-2 h-4 w-4"/>
      <span>Instalar App</span>
    </DropdownMenuItem>
  );
}

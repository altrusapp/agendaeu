
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
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null); 
        toast({
          variant: "success",
          title: "Aplicativo Instalado!",
          description: "O AgendaEu foi adicionado à sua tela de início.",
        });
      }
    } else {
       const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
       if (isStandalone) {
          toast({
            title: "Aplicativo já instalado",
            description: "Você já está rodando o AgendaEu como um aplicativo.",
          });
       } else {
         toast({
          title: "Instalação não disponível",
          description: "Use a opção 'Adicionar à tela de início' ou 'Instalar App' no menu do seu navegador.",
        });
       }
    }
  };
  
  return (
    <DropdownMenuItem onClick={handleInstallClick}>
      <Download className="mr-2 h-4 w-4"/>
      <span>Instalar App</span>
    </DropdownMenuItem>
  );
}

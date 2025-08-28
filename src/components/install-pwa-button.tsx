
"use client"

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extend the Window interface to include our custom event type
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

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    await installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We can only use the prompt once, so clear it.
    setInstallPrompt(null);
  };

  // Do not render the button if the prompt is not available or already installed
  if (!installPrompt) {
    return null;
  }

  return (
    <Button onClick={handleInstallClick} size="sm">
      <Download className="mr-2 h-4 w-4"/>
      <span className="hidden sm:inline">Instalar App</span>
      <span className="sr-only sm:hidden">Instalar App</span>
    </Button>
  );
}

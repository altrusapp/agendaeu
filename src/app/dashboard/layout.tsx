
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore"
import {
  Bell,
  Calendar,
  Home,
  Users,
  LogOut,
  Settings,
  Menu,
  LifeBuoy,
  WandSparkles
} from "lucide-react"

import { auth, db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import { Skeleton } from "@/components/ui/skeleton"
import { BottomBar } from "@/components/ui/bottom-bar"
import { InstallPwaButton } from "@/components/install-pwa-button"
import { cn } from "@/lib/utils"

type BusinessContextType = {
  business: DocumentData | null;
  loading: boolean;
};

export const BusinessContext = React.createContext<BusinessContextType | null>(null);

export const useBusiness = () => {
  const context = React.useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};

const navItems = [
  { href: "/dashboard", icon: Home, label: "Início" },
  { href: "/dashboard/agenda", icon: Calendar, label: "Agenda" },
  { href: "/dashboard/servicos", icon: WandSparkles, label: "Serviços" },
  { href: "/dashboard/clientes", icon: Users, label: "Clientes" },
];


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = React.useState<User | null>(null);
  const [business, setBusiness] = React.useState<DocumentData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        // User is signed in, now find their business
        const q = query(collection(db, "businesses"), where("ownerId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // No business found for this user, maybe redirect to onboarding
          router.push("/onboarding");
        } else {
          // Assuming one business per user for now
          const businessDoc = querySnapshot.docs[0];
          setBusiness({ id: businessDoc.id, ...businessDoc.data(), ownerEmail: currentUser.email });
          setLoading(false);
        }
      } else {
        // User is signed out
        setUser(null)
        setBusiness(null)
        router.push("/login")
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-4">
             <Logo className="h-10 w-10 text-primary animate-pulse" />
             <p className="text-muted-foreground">Carregando seu painel...</p>
          </div>
      </div>
    )
  }

  const desktopNavItems = [
    ...navItems,
    { href: "/dashboard/configuracoes", icon: Settings, label: "Configurações" },
  ]

  return (
    <BusinessContext.Provider value={{ business, loading }}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-sidebar md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <Logo className="h-6 w-6 text-primary" />
                <span className="font-headline">{business?.businessName || "AgendaEu.com"}</span>
              </Link>
              <Button variant="outline" size="icon" className="ml-auto h-8 w-8" aria-label="Ver notificações">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {desktopNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                        pathname === item.href ? 'bg-sidebar-accent text-primary' : 'text-muted-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col h-screen bg-background overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 z-10">
             <div className="w-full flex-1">
                <h1 className="text-lg font-semibold md:text-xl">
                    {navItems.find(item => item.href === pathname)?.label || desktopNavItems.find(item => item.href === pathname)?.label}
                </h1>
            </div>
             <InstallPwaButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full" aria-label="Abrir menu do usuário">
                   <Avatar aria-hidden="true">
                      <AvatarImage src={business?.ownerAvatarUrl || user?.photoURL || "https://picsum.photos/100"} alt="" data-ai-hint="person portrait"/>
                      <AvatarFallback>{user?.email?.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                  <Link href="/dashboard/configuracoes">
                    <Settings className="mr-2 h-4 w-4"/>Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Suporte
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => auth.signOut()}><LogOut className="mr-2 h-4 w-4"/>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className={cn("flex-1 overflow-y-auto p-4 lg:p-6 pb-24", "no-scrollbar")}>
            {children}
          </main>
          <BottomBar navItems={navItems} pathname={pathname} />
        </div>
      </div>
    </BusinessContext.Provider>
  )
}

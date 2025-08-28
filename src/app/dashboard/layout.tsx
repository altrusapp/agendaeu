
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, User } from "firebase/auth"
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore"
import {
  Bell,
  Calendar,
  Home,
  LineChart,
  Package2,
  Scissors,
  Users,
  LogOut,
  Settings,
  Menu
} from "lucide-react"

import { auth, db } from "@/lib/firebase/client"
import { Badge } from "@/components/ui/badge"
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import { Skeleton } from "@/components/ui/skeleton"

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


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = React.useState<User | null>(null);
  const [business, setBusiness] = React.useState<DocumentData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

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

  return (
    <BusinessContext.Provider value={{ business, loading }}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <Logo className="h-6 w-6 text-primary" />
                <span className="font-headline">{business?.businessName || "AgeNails"}</span>
              </Link>
              <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/agenda"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Calendar className="h-4 w-4" />
                  Agenda
                </Link>
                <Link
                  href="/dashboard/servicos"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Scissors className="h-4 w-4" />
                  Serviços{" "}
                </Link>
                <Link
                  href="/dashboard/clientes"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Users className="h-4 w-4" />
                  Clientes
                </Link>
                <Link
                  href="/dashboard/configuracoes"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </Link>
              </nav>
            </div>
            <div className="mt-auto p-4">
              <Card>
                <CardHeader className="p-2 pt-0 md:p-4">
                  <CardTitle>Precisa de Ajuda?</CardTitle>
                  <CardDescription>
                    Fale com nosso suporte ou acesse nossa central de ajuda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                  <Button size="sm" className="w-full">
                    Suporte
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <SheetHeader>
                   <SheetTitle className="self-start">
                     <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-lg font-semibold mb-4"
                    >
                      <Logo className="h-6 w-6 text-primary" />
                       <span className="font-headline">{business?.businessName || "AgeNails"}</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="grid gap-2 text-lg font-medium">
                  <Link
                    href="/dashboard"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Home className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/agenda"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Calendar className="h-5 w-5" />
                    Agenda
                  </Link>
                  <Link
                    href="/dashboard/servicos"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Scissors className="h-5 w-5" />
                    Serviços
                  </Link>
                  <Link
                    href="/dashboard/clientes"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Users className="h-5 w-5" />
                    Clientes
                  </Link>
                   <Link
                    href="/dashboard/configuracoes"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="h-5 w-5" />
                    Configurações
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
               {/* Can add a search bar here if needed */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                   <Avatar>
                      <AvatarImage src={user?.photoURL || "https://picsum.photos/100"} alt="Avatar do usuário" />
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
                <DropdownMenuItem>Suporte</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => auth.signOut()}><LogOut className="mr-2 h-4 w-4"/>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-6 p-4 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </BusinessContext.Provider>
  )
}

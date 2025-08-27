"use client"

import * as React from "react"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { collection, addDoc, query, onSnapshot, DocumentData, orderBy, limit, startAfter, getDocs } from "firebase/firestore"

import { useBusiness } from "@/app/dashboard/layout"
import { db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  lastVisit: string;
  avatar?: string;
  createdAt: any;
};

const CLIENTS_PER_PAGE = 15;

export default function ClientesPage() {
  const { business } = useBusiness();
  const { toast } = useToast();

  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [lastVisible, setLastVisible] = React.useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Form states
  const [clientName, setClientName] = React.useState("");
  const [clientEmail, setClientEmail] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  
  const fetchInitialClients = async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const first = query(
        collection(db, `businesses/${business.id}/clients`), 
        orderBy("createdAt", "desc"), 
        limit(CLIENTS_PER_PAGE)
      );
      const documentSnapshots = await getDocs(first);
      const clientsData = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
      
      setClients(clientsData);
      setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
      setHasMore(clientsData.length === CLIENTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching clients:", error);
       toast({
        variant: "destructive",
        title: "Erro ao buscar clientes",
        description: "Não foi possível carregar a lista de clientes.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMoreClients = async () => {
    if (!business?.id || !lastVisible) return;
    setLoadingMore(true);
    try {
      const next = query(
        collection(db, `businesses/${business.id}/clients`),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(CLIENTS_PER_PAGE)
      );
      const documentSnapshots = await getDocs(next);
      const newClientsData = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];

      setClients(prevClients => [...prevClients, ...newClientsData]);
      setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
      setHasMore(newClientsData.length === CLIENTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching more clients:", error);
       toast({
        variant: "destructive",
        title: "Erro ao buscar mais clientes",
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setLoadingMore(false);
    }
  };


  React.useEffect(() => {
    if (business?.id) {
      // Use onSnapshot for the initial load to get real-time updates for the first page
      const clientsCollectionRef = collection(db, `businesses/${business.id}/clients`);
      const q = query(clientsCollectionRef, orderBy("createdAt", "desc"), limit(CLIENTS_PER_PAGE));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Client[];

        setClients(clientsData);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(clientsData.length === CLIENTS_PER_PAGE);
        setLoading(false);
      }, (error) => {
        console.error("Error with real-time client fetch:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [business]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!business?.id || !clientName || !clientEmail || !clientPhone) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      const clientsCollectionRef = collection(db, `businesses/${business.id}/clients`);
      await addDoc(clientsCollectionRef, {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        totalAppointments: 0,
        lastVisit: null,
        createdAt: new Date(),
      });

      toast({
        title: "Cliente Adicionado!",
        description: "O novo cliente foi salvo com sucesso.",
      });

      // Reset form and close dialog
      setClientName("");
      setClientEmail("");
      setClientPhone("");
      setIsDialogOpen(false);

    } catch (error) {
      console.error("Error adding client: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível adicionar o cliente. Tente novamente.",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Clientes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Novo Cliente
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do novo cliente.
              </DialogDescription>
            </DialogHeader>
            <form id="add-client-form" onSubmit={handleAddClient}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input id="name" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ex: Ana Silva" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" placeholder="ana@email.com" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Telefone
                  </Label>
                  <Input id="phone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(11) 99999-9999" className="col-span-3" />
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button type="submit" form="add-client-form">Salvar Cliente</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sua Carteira de Clientes</CardTitle>
          <CardDescription>
            Gerencie seus clientes e veja o histórico de agendamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Avatar</span>
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="hidden md:table-cell">
                  Total de Agendamentos
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Última Visita
                </TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-11 w-11 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><div className="flex flex-col gap-1"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-3/5" /></div></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : clients.length > 0 ? (
                clients.map(client => (
                <TableRow key={client.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={client.avatar} alt={client.name} data-ai-hint="person portrait"/>
                      <AvatarFallback>{client.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <div className="font-medium">{client.email}</div>
                    <div className="text-sm text-muted-foreground">{client.phone}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {client.totalAppointments}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString('pt-BR') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Histórico</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
              ) : (
                 <TableRow>
                   <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum cliente encontrado. Adicione seu primeiro cliente para começar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          {hasMore && (
            <Button onClick={fetchMoreClients} disabled={loadingMore} className="w-full sm:w-auto">
              {loadingMore ? 'Carregando...' : 'Carregar Mais Clientes'}
            </Button>
          )}
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{clients.length}</strong> clientes.
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

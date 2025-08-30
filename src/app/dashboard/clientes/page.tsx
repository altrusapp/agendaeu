
"use client"

import * as React from "react"
import { MoreHorizontal, PlusCircle, Search, RefreshCw } from "lucide-react"
import { collection, addDoc, query, onSnapshot, DocumentData, orderBy, limit, startAfter, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"

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
  DropdownMenuSeparator,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  lastVisit: {
    seconds: number;
    nanoseconds: number;
  } | null;
  avatar?: string;
  createdAt: any;
};

const CLIENTS_PER_PAGE = 15;

const ClientForm = ({ 
  onSubmit, 
  formId,
  clientName,
  setClientName,
  clientEmail,
  setClientEmail,
  clientPhone,
  setClientPhone
}: { 
  onSubmit: (e: React.FormEvent) => void; 
  formId: string;
  clientName: string;
  setClientName: (value: string) => void;
  clientEmail: string;
  setClientEmail: (value: string) => void;
  clientPhone: string;
  setClientPhone: (value: string) => void;
}) => (
    <form id={formId} onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Nome</Label>
          <Input id="name" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ex: Ana Silva" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input id="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" placeholder="ana@email.com" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">Telefone</Label>
          <Input id="phone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(11) 99999-9999" className="col-span-3" />
        </div>
      </div>
    </form>
  )

export default function ClientesPage() {
  const { business } = useBusiness();
  const { toast } = useToast();

  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [lastVisible, setLastVisible] = React.useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = React.useState(true);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  
  const [clientName, setClientName] = React.useState("");
  const [clientEmail, setClientEmail] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setSelectedClient(null);
  };
  
  const fetchClients = React.useCallback(async () => {
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
      toast({ variant: "destructive", title: "Erro ao carregar clientes", description: "Não foi possível buscar os dados."});
    } finally {
      setLoading(false);
    }
  }, [business, toast]);
  
  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const fetchMoreClients = async () => {
    if (!business?.id || !lastVisible || !hasMore) return;
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
       toast({
        variant: "destructive",
        title: "Erro ao buscar mais clientes",
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id || !clientName || !clientEmail || !clientPhone) {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Por favor, preencha todos os campos." });
      return;
    }

    try {
      await addDoc(collection(db, `businesses/${business.id}/clients`), {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        totalAppointments: 0,
        lastVisit: null,
        createdAt: new Date(),
      });
      toast({ title: "Cliente Adicionado!", description: "O novo cliente foi salvo com sucesso." });
      resetForm();
      setIsAddDialogOpen(false);
      fetchClients(); // Re-fetch to show the new client
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: "Não foi possível adicionar o cliente." });
    }
  };
  
  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id || !selectedClient || !clientName || !clientEmail || !clientPhone) {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Por favor, preencha todos os campos." });
      return;
    }

    try {
      const clientRef = doc(db, `businesses/${business.id}/clients`, selectedClient.id);
      await updateDoc(clientRef, {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
      });
      toast({ title: "Cliente Atualizado!", description: "Os dados do cliente foram salvos." });
      resetForm();
      setIsEditDialogOpen(false);
      fetchClients(); // Re-fetch to show updated data
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Atualizar", description: "Não foi possível salvar as alterações." });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!business?.id) return;
    try {
      await deleteDoc(doc(db, `businesses/${business.id}/clients`, clientId));
      toast({ title: "Cliente Excluído", description: "O cliente foi removido da sua lista." });
      fetchClients(); // Re-fetch to remove the client from UI
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Excluir", description: "Não foi possível remover o cliente." });
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setClientName(client.name);
    setClientEmail(client.email);
    setClientPhone(client.phone);
    setIsEditDialogOpen(true);
  };
  

  const formatDate = (timestamp: Client['lastVisit']) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return date.toLocaleDateString('pt-BR');
  }
  
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold font-headline">Clientes</h1>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar cliente..."
                  className="pl-8 sm:w-[300px]"
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             <Button size="sm" variant="outline" className="h-9 gap-1" onClick={fetchClients}>
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Atualizar</span>
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
              setIsAddDialogOpen(isOpen);
              if (!isOpen) resetForm();
            }}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1 shrink-0">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Novo Cliente</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>Preencha os detalhes do novo cliente.</DialogDescription>
                </DialogHeader>
                <ClientForm 
                    onSubmit={handleAddClient} 
                    formId="add-client-form"
                    clientName={clientName}
                    setClientName={setClientName}
                    clientEmail={clientEmail}
                    setClientEmail={setClientEmail}
                    clientPhone={clientPhone}
                    setClientPhone={setClientPhone}
                />
                <DialogFooter>
                <Button type="submit" form="add-client-form">Salvar Cliente</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sua Carteira de Clientes</CardTitle>
          <CardDescription>Gerencie seus clientes e veja o histórico de agendamentos.</CardDescription>
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
                <TableHead className="hidden md:table-cell">Total de Agendamentos</TableHead>
                <TableHead className="hidden md:table-cell">Última Visita</TableHead>
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
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><div className="flex flex-col gap-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-8" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredClients.length > 0 ? (
                filteredClients.map(client => (
                <TableRow key={client.id}>
                  <TableCell className="hidden sm:table-cell p-2 align-middle">
                    <Avatar aria-hidden="true" className="h-11 w-11">
                      <AvatarImage src={client.avatar} alt="" data-ai-hint="person portrait"/>
                      <AvatarFallback>{client.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <div className="font-medium">{client.email}</div>
                    <div className="text-sm text-muted-foreground">{client.phone}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{client.totalAppointments}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDate(client.lastVisit)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-label="Abrir menu de ações" aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(client)}>Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Excluir</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita. Isso irá excluir permanentemente o cliente da sua lista.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteClient(client.id)}>Sim, excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
              ) : (
                 <TableRow>
                   <TableCell colSpan={6} className="h-24 text-center">Nenhum cliente encontrado. Adicione seu primeiro cliente para começar ou ajuste sua busca.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          {hasMore && !searchTerm && (
            <Button onClick={fetchMoreClients} disabled={loadingMore} className="w-full sm:w-auto">
              {loadingMore ? 'Carregando...' : 'Carregar Mais Clientes'}
            </Button>
          )}
          <div className="text-xs text-muted-foreground">Mostrando <strong>{filteredClients.length}</strong> de <strong>{clients.length}</strong> clientes.</div>
        </CardFooter>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
        setIsEditDialogOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>Altere os detalhes do cliente.</DialogDescription>
          </DialogHeader>
          <ClientForm 
            onSubmit={handleEditClient} 
            formId="edit-client-form" 
            clientName={clientName}
            setClientName={setClientName}
            clientEmail={clientEmail}
            setClientEmail={setClientEmail}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            />
          <DialogFooter>
            <Button type="submit" form="edit-client-form">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

    
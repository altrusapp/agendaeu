
"use client"

import * as React from "react"
import { MoreHorizontal, PlusCircle, Search, RefreshCw, NotebookPen } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
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
  clientPhone,
  setClientPhone,
  clientNotes,
  setClientNotes,
}: { 
  onSubmit: (e: React.FormEvent) => void; 
  formId: string;
  clientName: string;
  setClientName: (value: string) => void;
  clientPhone: string;
  setClientPhone: (value: string) => void;
  clientNotes: string;
  setClientNotes: (value: string) => void;
}) => (
    <form id={formId} onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Nome</Label>
          <Input id="name" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ex: Ana Silva" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">WhatsApp</Label>
          <Input id="phone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(11) 99999-9999" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="notes" className="text-right pt-2">Anotações</Label>
          <Textarea 
            id="notes" 
            value={clientNotes} 
            onChange={(e) => setClientNotes(e.target.value)} 
            placeholder="Alergias, preferências, etc." 
            className="col-span-3"
            rows={4}
          />
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
  const [clientPhone, setClientPhone] = React.useState("");
  const [clientNotes, setClientNotes] = React.useState("");

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  const resetForm = () => {
    setClientName("");
    setClientPhone("");
    setClientNotes("");
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
    if (!business?.id || !clientName || !clientPhone) {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Nome e WhatsApp são obrigatórios." });
      return;
    }

    try {
      await addDoc(collection(db, `businesses/${business.id}/clients`), {
        name: clientName,
        email: "",
        phone: clientPhone,
        notes: clientNotes,
        totalAppointments: 0,
        lastVisit: null,
        createdAt: new Date(),
      });
      toast({ title: "Cliente Adicionado!", description: "O novo cliente foi salvo com sucesso.", variant: "success" });
      resetForm();
      setIsAddDialogOpen(false);
      fetchClients(); 
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: "Não foi possível adicionar o cliente." });
    }
  };
  
  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id || !selectedClient || !clientName || !clientPhone) {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Nome e WhatsApp são obrigatórios." });
      return;
    }

    try {
      const clientRef = doc(db, `businesses/${business.id}/clients`, selectedClient.id);
      await updateDoc(clientRef, {
        name: clientName,
        phone: clientPhone,
        notes: clientNotes,
      });
      toast({ title: "Cliente Atualizado!", description: "Os dados do cliente foram salvos.", variant: "success" });
      resetForm();
      setIsEditDialogOpen(false);
      fetchClients(); 
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Atualizar", description: "Não foi possível salvar as alterações." });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!business?.id) return;
    try {
      await deleteDoc(doc(db, `businesses/${business.id}/clients`, clientId));
      toast({ title: "Cliente Excluído", description: "O cliente foi removido da sua lista." });
      fetchClients(); 
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Excluir", description: "Não foi possível remover o cliente." });
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setClientName(client.name);
    setClientPhone(client.phone);
    setClientNotes(client.notes || "");
    setIsEditDialogOpen(true);
  };
  

  const formatDate = (timestamp: Client['lastVisit']) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return date.toLocaleDateString('pt-BR');
  }
  
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
                    clientPhone={clientPhone}
                    setClientPhone={setClientPhone}
                    clientNotes={clientNotes}
                    setClientNotes={setClientNotes}
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
           <div className="grid gap-4">
             {/* Header */}
             <div className="hidden md:grid grid-cols-12 items-center gap-4 px-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-4">Cliente</div>
                <div className="col-span-3">Agendamentos</div>
                <div className="col-span-3">Última Visita</div>
                <div className="col-span-2 text-right pr-8">Ações</div>
            </div>
            {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 rounded-lg">
                       <Skeleton className="h-12 w-12 rounded-full" />
                       <div className="space-y-2">
                           <Skeleton className="h-4 w-[250px]" />
                           <Skeleton className="h-4 w-[200px]" />
                       </div>
                   </div>
                 ))
              ) : filteredClients.length > 0 ? (
                <TooltipProvider>
                  {filteredClients.map((client, index) => (
                  <div key={client.id} className={cn(
                      "rounded-lg border md:border-0 md:bg-transparent md:grid md:grid-cols-12 md:items-center md:gap-4",
                       index % 2 !== 0 && "md:bg-muted/50"
                  )}>
                    {/* --- Mobile View --- */}
                    <div className="md:hidden">
                      <div className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <Avatar aria-hidden="true" className="h-10 w-10">
                              <AvatarImage src={client.avatar} alt="" data-ai-hint="person portrait"/>
                              <AvatarFallback>{client.name.substring(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                  <p className="font-medium">{client.name}</p>
                                  {client.notes && (
                                      <Tooltip>
                                          <TooltipTrigger>
                                              <NotebookPen className="h-4 w-4 text-muted-foreground" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                              <p className="max-w-xs whitespace-pre-wrap">{client.notes}</p>
                                          </TooltipContent>
                                      </Tooltip>
                                  )}
                              </div>
                              <p className="text-sm text-muted-foreground">{client.phone}</p>
                            </div>
                         </div>
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
                      </div>
                       <Separator className="md:hidden" />
                       <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                              <p className="text-muted-foreground">Agendamentos</p>
                              <p className="font-medium">{client.totalAppointments}</p>
                          </div>
                           <div>
                              <p className="text-muted-foreground">Última Visita</p>
                              <p className="font-medium">{formatDate(client.lastVisit)}</p>
                          </div>
                       </div>
                    </div>

                    {/* --- Desktop View --- */}
                    <div className="hidden p-4 md:col-span-4 md:flex items-center gap-3">
                      <Avatar aria-hidden="true" className="h-10 w-10">
                        <AvatarImage src={client.avatar} alt="" data-ai-hint="person portrait"/>
                        <AvatarFallback>{client.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                       <div className="flex items-center gap-2">
                          <div>
                             <p className="font-medium">{client.name}</p>
                             <p className="text-sm text-muted-foreground">{client.phone}</p>
                          </div>
                          {client.notes && (
                              <Tooltip>
                                  <TooltipTrigger>
                                      <NotebookPen className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p className="max-w-xs whitespace-pre-wrap">{client.notes}</p>
                                  </TooltipContent>
                              </Tooltip>
                          )}
                       </div>
                    </div>
                     <div className="hidden p-4 md:col-span-3 md:block">
                       <div className="font-medium">{client.totalAppointments}</div>
                     </div>
                     <div className="hidden p-4 md:col-span-3 md:block">
                       <div className="font-medium">{formatDate(client.lastVisit)}</div>
                     </div>
                    <div className="hidden p-4 md:col-span-2 md:flex justify-end">
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
                    </div>
                  </div>
                ))}
                </TooltipProvider>
              ) : (
                 <div className="text-center text-muted-foreground py-10 col-span-full">
                   <p>Nenhum cliente encontrado.</p>
                   <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>Adicione seu primeiro cliente</Button>
                </div>
              )}
           </div>
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
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            clientNotes={clientNotes}
            setClientNotes={setClientNotes}
            />
          <DialogFooter>
            <Button type="submit" form="edit-client-form">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

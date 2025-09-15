
"use client"

import * as React from "react"
import { MoreHorizontal, PlusCircle, RefreshCw } from "lucide-react"
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc, getDocs, orderBy } from "firebase/firestore"

import { useBusiness } from "@/app/dashboard/layout"
import { getFirebaseDb } from "@/lib/firebase/client"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
  active: boolean;
};

// Moved ServiceForm outside of the main component to prevent re-renders
const ServiceForm = ({ 
  onSubmit, 
  formId, 
  serviceName, 
  setServiceName, 
  durationHours,
  setDurationHours,
  durationMinutes,
  setDurationMinutes,
  price, 
  setPrice 
}: { 
  onSubmit: (e: React.FormEvent) => void, 
  formId: string,
  serviceName: string,
  setServiceName: (value: string) => void,
  durationHours: number | "",
  setDurationHours: (value: number | "") => void,
  durationMinutes: number | "",
  setDurationMinutes: (value: number | "") => void,
  price: number | "",
  setPrice: (value: number | "") => void
}) => (
    <form id={formId} onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Nome</Label>
          <Input id="name" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Ex: Corte Feminino" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="duration" className="text-right">Duração</Label>
          <div className="col-span-3 grid grid-cols-2 gap-2">
            <div className="space-y-1">
                <Label htmlFor="duration-hours" className="text-xs text-muted-foreground">Horas</Label>
                <Input id="duration-hours" type="number" value={durationHours} onChange={(e) => setDurationHours(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 1" min="0" />
            </div>
             <div className="space-y-1">
                <Label htmlFor="duration-minutes" className="text-xs text-muted-foreground">Minutos</Label>
                <Input id="duration-minutes" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 30" min="0" step="5"/>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">Preço (R$)</Label>
          <Input 
            id="price" 
            value={price} 
            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
            type="number" 
            placeholder="120,00" 
            className="col-span-3" 
            step="0.01"
            min="0"
          />
        </div>
      </div>
    </form>
  )

function formatDuration(hours: number, minutes: number): string {
  const h = Math.floor(hours);
  const m = Math.floor(minutes);

  if (h > 0 && m > 0) {
    return `${h}h ${m}min`;
  }
  if (h > 0) {
    return `${h}h`;
  }
  if (m > 0) {
    return `${m}min`;
  }
  return '0min';
}

function parseDuration(duration: string): { hours: number, minutes: number } {
  if (!duration) return { hours: 0, minutes: 0 };
  
  let hours = 0;
  let minutes = 0;

  const hourMatch = duration.match(/(\d+)\s*h/);
  if (hourMatch) {
    hours = parseInt(hourMatch[1], 10);
  }

  const minMatch = duration.match(/(\d+)\s*min/);
  if (minMatch) {
    minutes = parseInt(minMatch[1], 10);
  }

  return { hours, minutes };
}


export default function ServicosPage() {
  const { business } = useBusiness();
  const { toast } = useToast();

  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);

  // Form states
  const [serviceName, setServiceName] = React.useState("");
  const [durationHours, setDurationHours] = React.useState<number | "">("");
  const [durationMinutes, setDurationMinutes] = React.useState<number | "">("");
  const [price, setPrice] = React.useState<number | "">("");
  
  const resetForm = () => {
    setServiceName("");
    setDurationHours("");
    setDurationMinutes("");
    setPrice("");
    setSelectedService(null);
  };
  
  const fetchServices = React.useCallback(async () => {
      if (!business?.id) return;
      setLoading(true);
      const db = getFirebaseDb();
      try {
        const servicesCollectionRef = collection(db, `businesses/${business.id}/services`);
        const q = query(servicesCollectionRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const servicesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Service[];
        setServices(servicesData);
      } catch (error) {
        toast({ variant: "destructive", title: "Erro ao carregar serviços", description: "Não foi possível buscar os dados." });
      } finally {
        setLoading(false);
      }
  }, [business, toast]);

  React.useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getFirebaseDb();
    const hours = Number(durationHours) || 0;
    const minutes = Number(durationMinutes) || 0;
    const duration = formatDuration(hours, minutes);

    if (!business?.id || !serviceName || duration === '0min' || price === "") {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Por favor, preencha todos os campos corretamente." });
      return;
    }

    try {
      await addDoc(collection(db, `businesses/${business.id}/services`), {
        name: serviceName,
        duration,
        price: Number(price),
        active: true,
        createdAt: new Date(),
      });
      toast({ variant: "success", title: "Serviço Adicionado!", description: "O novo serviço foi salvo com sucesso." });
      resetForm();
      setIsAddDialogOpen(false);
      fetchServices(); // Re-fetch to show the new service
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: "Não foi possível adicionar o serviço." });
    }
  };
  
  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getFirebaseDb();
    const hours = Number(durationHours) || 0;
    const minutes = Number(durationMinutes) || 0;
    const duration = formatDuration(hours, minutes);

    if (!business?.id || !selectedService || !serviceName || duration === '0min' || price === "") {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Por favor, preencha todos os campos corretamente." });
      return;
    }

    try {
      const serviceRef = doc(db, `businesses/${business.id}/services`, selectedService.id);
      await updateDoc(serviceRef, {
        name: serviceName,
        duration,
        price: Number(price),
      });
      toast({ variant: "success", title: "Serviço Atualizado!", description: "As alterações foram salvas." });
      resetForm();
      setIsEditDialogOpen(false);
      fetchServices(); // Re-fetch to show updated data
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Atualizar", description: "Não foi possível salvar as alterações." });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!business?.id) return;
    const db = getFirebaseDb();
    try {
      await deleteDoc(doc(db, `businesses/${business.id}/services`, serviceId));
      toast({ variant: "success", title: "Serviço Excluído", description: "O serviço foi removido da sua lista." });
      fetchServices(); // Re-fetch to remove from UI
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Excluir", description: "Não foi possível remover o serviço." });
    }
  };
  
  const handleToggleActive = async (service: Service) => {
    if (!business?.id) return;
    const db = getFirebaseDb();
    try {
      const serviceRef = doc(db, `businesses/${business.id}/services`, service.id);
      await updateDoc(serviceRef, { active: !service.active });
      toast({
        variant: "success",
        title: `Serviço ${!service.active ? "Ativado" : "Desativado"}`,
        description: `${service.name} agora está ${!service.active ? "visível" : "oculto"} na página de agendamento.`,
      });
      fetchServices(); // Re-fetch to update the UI state
    } catch (error) {
       toast({ variant: "destructive", title: "Erro ao alterar status", description: "Não foi possível atualizar o serviço." });
    }
  };

  const openEditDialog = (service: Service) => {
    const { hours, minutes } = parseDuration(service.duration);
    setSelectedService(service);
    setServiceName(service.name);
    setDurationHours(hours || "");
    setDurationMinutes(minutes || "");
    setPrice(service.price);
    setIsEditDialogOpen(true);
  };
  

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold font-headline">Serviços</h1>
        <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-9 gap-1" onClick={fetchServices}>
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Atualizar</span>
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
              setIsAddDialogOpen(isOpen);
              if (!isOpen) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Novo Serviço</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Serviço</DialogTitle>
                  <DialogDescription>Preencha os detalhes do novo serviço que você oferece.</DialogDescription>
                </DialogHeader>
                <ServiceForm 
                    onSubmit={handleAddService} 
                    formId="add-service-form"
                    serviceName={serviceName}
                    setServiceName={setServiceName}
                    durationHours={durationHours}
                    setDurationHours={setDurationHours}
                    durationMinutes={durationMinutes}
                    setDurationMinutes={setDurationMinutes}
                    price={price}
                    setPrice={setPrice}
                />
                <DialogFooter>
                  <Button type="submit" form="add-service-form">Salvar Serviço</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Seus Serviços</CardTitle>
          <CardDescription>Gerencie os serviços oferecidos em seu estabelecimento.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-y-2">
            <div className="hidden md:grid grid-cols-12 items-center gap-4 px-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-5">Nome do Serviço</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Duração</div>
                <div className="col-span-2">Preço</div>
                <div className="col-span-1 text-right pr-8">Ações</div>
            </div>

            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="flex items-center space-x-4 p-4 rounded-lg">
                    <div className="space-y-2 flex-grow">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                     <Skeleton className="h-8 w-20" />
                </div>
              ))
            ) : services.length > 0 ? (
                services.map((service, index) => (
                  <div key={service.id} className={cn(
                      "rounded-lg p-4",
                      "md:grid md:grid-cols-12 md:items-center md:gap-4",
                      index % 2 !== 0 && "md:bg-muted/50"
                  )}>
                    <div className="md:hidden flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                          <p className="font-medium">{service.name}</p>
                          <div className="text-sm text-muted-foreground space-x-2">
                            <span>{service.duration}</span>
                            <span>•</span>
                            <span>R$ {typeof service.price === 'number' ? service.price.toFixed(2) : '0.00'}</span>
                          </div>
                          <Badge variant={service.active ? "success" : "outline"} className={cn("mt-2 w-fit")}>
                              {service.active ? "Ativo" : "Inativo"}
                          </Badge>
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
                              <DropdownMenuItem onClick={() => openEditDialog(service)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(service)}>
                              {service.active ? "Desativar" : "Ativar"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Excluir</DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                  <AlertDialogDescription>Esta ação não pode ser desfeita. Isso irá excluir permanentemente o serviço.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteService(service.id)} className={buttonVariants({ variant: "destructive" })}>Sim, excluir</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                              </AlertDialog>
                          </DropdownMenuContent>
                          </DropdownMenu>
                    </div>

                    <div className="hidden md:col-span-5 md:flex md:flex-col">
                        <p className="font-medium">{service.name}</p>
                    </div>
                    <div className="hidden md:col-span-2 md:block">
                      <Badge variant={service.active ? "success" : "outline"}>
                        {service.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="hidden md:col-span-2 md:block">{service.duration}</div>
                    <div className="hidden md:col-span-2 md:block">R$ {typeof service.price === 'number' ? service.price.toFixed(2) : '0.00'}</div>
                    <div className="hidden md:col-span-1 md:flex md:justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-label="Abrir menu de ações" aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(service)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(service)}>
                            {service.active ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Excluir</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>Esta ação não pode ser desfeita. Isso irá excluir permanentemente o serviço.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteService(service.id)} className={buttonVariants({ variant: "destructive" })}>Sim, excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground py-10 col-span-full">
                   <p>Nenhum serviço encontrado.</p>
                   <Button variant="link" onClick={() => setIsAddDialogOpen(true)}>Adicione seu primeiro serviço</Button>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
        setIsEditDialogOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
            <DialogDescription>Altere os detalhes do serviço.</DialogDescription>
          </DialogHeader>
          <ServiceForm 
            onSubmit={handleEditService} 
            formId="edit-service-form"
            serviceName={serviceName}
            setServiceName={setServiceName}
            durationHours={durationHours}
            setDurationHours={setDurationHours}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            price={price}
            setPrice={setPrice}
            />
          <DialogFooter>
            <Button type="submit" form="edit-service-form">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

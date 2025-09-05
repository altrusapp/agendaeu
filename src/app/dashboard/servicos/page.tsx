
"use client"

import * as React from "react"
import { MoreHorizontal, PlusCircle, RefreshCw } from "lucide-react"
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc, getDocs, orderBy } from "firebase/firestore"

import { useBusiness } from "@/app/dashboard/layout"
import { db } from "@/lib/firebase/client"
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
  duration, 
  setDuration, 
  price, 
  setPrice 
}: { 
  onSubmit: (e: React.FormEvent) => void, 
  formId: string,
  serviceName: string,
  setServiceName: (value: string) => void,
  duration: string,
  setDuration: (value: string) => void,
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
          <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 1h 30min" className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">Preço (R$)</Label>
          <Input 
            id="price" 
            value={price} 
            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
            type="number" 
            placeholder="120.00" 
            className="col-span-3" 
            step="0.01"
          />
        </div>
      </div>
    </form>
  )


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
  const [duration, setDuration] = React.useState("");
  const [price, setPrice] = React.useState<number | "">("");
  
  const resetForm = () => {
    setServiceName("");
    setDuration("");
    setPrice("");
    setSelectedService(null);
  };
  
  const fetchServices = React.useCallback(async () => {
      if (!business?.id) return;
      setLoading(true);
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

    if (!business?.id || !serviceName || !duration || price === "") {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Por favor, preencha todos os campos." });
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
    if (!business?.id || !selectedService || !serviceName || !duration || price === "") {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Por favor, preencha todos os campos." });
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
    setSelectedService(service);
    setServiceName(service.name);
    setDuration(service.duration);
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
                    duration={duration}
                    setDuration={setDuration}
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
            {/* Header */}
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
                    {/* --- Mobile View --- */}
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

                    {/* --- Desktop View --- */}
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
            duration={duration}
            setDuration={setDuration}
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

    
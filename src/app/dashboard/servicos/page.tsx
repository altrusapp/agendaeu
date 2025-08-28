
"use client"

import * as React from "react"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore"

import { useBusiness } from "@/app/dashboard/layout"
import { db } from "@/lib/firebase/client"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
  active: boolean;
};

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

  React.useEffect(() => {
    if (business?.id) {
      const servicesCollectionRef = collection(db, `businesses/${business.id}/services`);
      const q = query(servicesCollectionRef);

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const servicesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[];
        setServices(servicesData);
        setLoading(false);
      }, (error) => {
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [business]);

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
      toast({ title: "Serviço Adicionado!", description: "O novo serviço foi salvo com sucesso." });
      resetForm();
      setIsAddDialogOpen(false);
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
      toast({ title: "Serviço Atualizado!", description: "As alterações foram salvas." });
      resetForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Atualizar", description: "Não foi possível salvar as alterações." });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!business?.id) return;
    try {
      await deleteDoc(doc(db, `businesses/${business.id}/services`, serviceId));
      toast({ title: "Serviço Excluído", description: "O serviço foi removido da sua lista." });
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
        title: `Serviço ${!service.active ? "Ativado" : "Desativado"}`,
        description: `${service.name} agora está ${!service.active ? "visível" : "oculto"} na página de agendamento.`,
      });
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
  
  const ServiceForm = ({ onSubmit, formId }: { onSubmit: (e: React.FormEvent) => void, formId: string }) => (
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

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold font-headline">Serviços</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
            <ServiceForm onSubmit={handleAddService} formId="add-service-form" />
            <DialogFooter>
              <Button type="submit" form="add-service-form">Salvar Serviço</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Seus Serviços</CardTitle>
          <CardDescription>Gerencie os serviços oferecidos em seu estabelecimento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Duração</TableHead>
                <TableHead className="hidden md:table-cell">Preço</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : services.length > 0 ? (
                services.map(service => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <Badge variant={service.active ? "default" : "outline"} className={service.active ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200" : ""}>
                        {service.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{service.duration}</TableCell>
                    <TableCell className="hidden md:table-cell">R$ {typeof service.price === 'number' ? service.price.toFixed(2) : '0.00'}</TableCell>
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
                                <AlertDialogAction onClick={() => handleDeleteService(service.id)}>Sim, excluir</AlertDialogAction>
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
                   <TableCell colSpan={5} className="h-24 text-center">Nenhum serviço encontrado. Adicione seu primeiro serviço para começar.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
          <ServiceForm onSubmit={handleEditService} formId="edit-service-form" />
          <DialogFooter>
            <Button type="submit" form="edit-service-form">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

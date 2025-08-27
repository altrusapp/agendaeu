"use client"

import * as React from "react"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { collection, addDoc, query, where, onSnapshot, DocumentData } from "firebase/firestore"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type Service = {
  id: string;
  name: string;
  duration: string;
  price: string;
  active: boolean;
};

export default function ServicosPage() {
  const { business } = useBusiness();
  const { toast } = useToast();

  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Form states
  const [serviceName, setServiceName] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [price, setPrice] = React.useState("");

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
      });

      return () => unsubscribe();
    }
  }, [business]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!business?.id || !serviceName || !duration || !price) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos.",
      });
      return;
    }

    try {
      const servicesCollectionRef = collection(db, `businesses/${business.id}/services`);
      await addDoc(servicesCollectionRef, {
        name: serviceName,
        duration,
        price: parseFloat(price).toFixed(2),
        active: true,
        createdAt: new Date(),
      });

      toast({
        title: "Serviço Adicionado!",
        description: "O novo serviço foi salvo com sucesso.",
      });

      // Reset form and close dialog
      setServiceName("");
      setDuration("");
      setPrice("");
      setIsDialogOpen(false);

    } catch (error) {
      console.error("Error adding service: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível adicionar o serviço. Tente novamente.",
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Serviços</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Novo Serviço
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Serviço</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do novo serviço que você oferece.
              </DialogDescription>
            </DialogHeader>
            <form id="add-service-form" onSubmit={handleAddService}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input id="name" value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Ex: Corte Feminino" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duração
                  </Label>
                  <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex: 1h 30min" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Preço (R$)
                  </Label>
                  <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="120.00" className="col-span-3" />
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button type="submit" form="add-service-form">Salvar Serviço</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Seus Serviços</CardTitle>
          <CardDescription>
            Gerencie os serviços oferecidos em seu estabelecimento.
          </CardDescription>
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
                      <Badge variant={service.active ? "default" : "outline"} className={service.active ? "bg-green-500/80 text-white" : ""}>
                        {service.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{service.duration}</TableCell>
                    <TableCell className="hidden md:table-cell">R$ {service.price}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>
                            {service.active ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
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
                   <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum serviço encontrado. Adicione seu primeiro serviço para começar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

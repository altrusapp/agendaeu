"use client"

import * as React from "react"
import { collection, query, onSnapshot, where, Timestamp, addDoc, DocumentData, orderBy } from "firebase/firestore"
import { PlusCircle } from "lucide-react"

import { useBusiness } from "@/app/dashboard/layout"
import { db } from "@/lib/firebase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type Appointment = {
  id: string;
  clientName: string;
  serviceName: string;
  time: string;
  status: "Confirmado" | "Pendente" | "Aguardando Sinal" | "Cancelado";
  clientAvatar?: string;
  clientId?: string;
  serviceId: string;
  date: Timestamp;
};

type Client = { id: string; name: string; }
type Service = { id: string; name: string; }

export default function AgendaPage() {
  const { business } = useBusiness();
  const { toast } = useToast();

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // New Appointment Form State
  const [selectedClientId, setSelectedClientId] = React.useState('');
  const [selectedServiceId, setSelectedServiceId] = React.useState('');
  const [appointmentTime, setAppointmentTime] = React.useState('');

  // Fetch clients and services for the dropdowns
  React.useEffect(() => {
    if (business?.id) {
      const clientsUnsub = onSnapshot(query(collection(db, `businesses/${business.id}/clients`)), (snapshot) => {
        setClients(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
      });
      const servicesUnsub = onSnapshot(query(collection(db, `businesses/${business.id}/services`)), (snapshot) => {
        setServices(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
      });
      return () => {
        clientsUnsub();
        servicesUnsub();
      }
    }
  }, [business]);

  // Fetch appointments for the selected date
  React.useEffect(() => {
    if (!date || !business?.id) return;
    setLoading(true);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);
    
    const appointmentsRef = collection(db, `businesses/${business.id}/appointments`);
    const q = query(appointmentsRef, 
      where("date", ">=", startTimestamp),
      where("date", "<=", endTimestamp),
      orderBy("date")
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching appointments:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar agendamentos",
        description: "Verifique suas permissões ou tente novamente mais tarde.",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [date, business, toast]);
  
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id || !selectedClientId || !selectedServiceId || !appointmentTime || !date) {
       toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos.",
      });
      return;
    }
    
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const selectedService = services.find(s => s.id === selectedServiceId);

    try {
      await addDoc(collection(db, `businesses/${business.id}/appointments`), {
        clientId: selectedClientId,
        clientName: selectedClient?.name || 'Cliente não encontrado',
        serviceId: selectedServiceId,
        serviceName: selectedService?.name || 'Serviço não encontrado',
        date: Timestamp.fromDate(appointmentDate),
        time: appointmentTime,
        status: 'Confirmado', // Default status
        createdAt: new Date(),
      });
      
      toast({
        title: "Agendamento Criado!",
        description: "O novo agendamento foi salvo com sucesso.",
      });
      
      // Reset form and close dialog
      setSelectedClientId('');
      setSelectedServiceId('');
      setAppointmentTime('');
      setIsDialogOpen(false);

    } catch (error) {
       console.error("Error adding appointment: ", error);
       toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível criar o agendamento. Tente novamente.",
      });
    }
  }


  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Agenda</h1>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
             <Button>
              <PlusCircle className="h-4 w-4 mr-2"/>
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent>
             <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Selecione o cliente, o serviço e o horário. A data selecionada é {date?.toLocaleDateString('pt-BR')}.
              </DialogDescription>
            </DialogHeader>
            <form id="add-appointment-form" onSubmit={handleAddAppointment} className="space-y-4 py-4">
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                       <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="service">Serviço</Label>
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                     {services.map(service => (
                       <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Horário</Label>
                <Input id="time" type="time" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} />
              </div>
            </form>
             <DialogFooter>
              <Button type="submit" form="add-appointment-form">Salvar Agendamento</Button>
            </DialogFooter>
          </DialogContent>
         </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 xl:col-span-3">
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary",
                day_today: "bg-accent/50 text-accent-foreground",
              }}
              disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 xl:col-span-4">
          <CardHeader>
            <CardTitle>
              Agendamentos para{" "}
              {date ? date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) : "..."}
            </CardTitle>
            <CardDescription>
              {loading ? "Carregando..." : `${appointments.length} agendamento(s) para hoje.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {loading ? (
               Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-2">
                     <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="grid gap-1 flex-1">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
               ))
            ) : appointments.length > 0 ? (
              appointments.map((app) => (
                <div key={app.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                   <Avatar className="hidden h-11 w-11 sm:flex">
                     <AvatarImage src={app.clientAvatar} alt={app.clientName} data-ai-hint="person portrait" />
                    <AvatarFallback>{app.clientName?.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1 flex-1">
                    <p className="text-sm font-medium leading-none">{app.clientName}</p>
                    <p className="text-sm text-muted-foreground">{app.serviceName}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{app.time}</div>
                  <Badge 
                    variant={app.status === 'Confirmado' ? 'default' : app.status === 'Pendente' ? 'secondary' : 'destructive'} 
                    className={`${app.status === 'Confirmado' && 'bg-green-500/80 text-white'} ${app.status === 'Aguardando Sinal' && 'bg-amber-500/80 text-white'}`}
                  >
                    {app.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p>Nenhum agendamento para a data selecionada.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

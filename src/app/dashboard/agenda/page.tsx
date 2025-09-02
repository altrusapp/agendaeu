
"use client"

import * as React from "react"
import { collection, query, onSnapshot, where, Timestamp, addDoc, DocumentData, orderBy, doc, updateDoc, deleteDoc, getDocs } from "firebase/firestore"
import { MoreHorizontal, PlusCircle, MessageCircle, ArrowLeft } from "lucide-react"
import { ptBR } from "date-fns/locale"
import { format, startOfDay, endOfDay, parse } from 'date-fns'


import { useBusiness } from "@/app/dashboard/layout"
import { db } from "@/lib/firebase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import { cn } from "@/lib/utils"

type Appointment = {
  id: string;
  clientName: string;
  clientPhone?: string;
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
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);

  // Form State for Add/Edit
  const [selectedClientId, setSelectedClientId] = React.useState('');
  const [selectedServiceId, setSelectedServiceId] = React.useState('');
  const [appointmentTime, setAppointmentTime] = React.useState('');

  // Fetch clients and services for the dropdowns
  React.useEffect(() => {
    if (!business?.id) return;

    // Use onSnapshot for clients and services, ensuring proper cleanup
    const clientsQuery = query(collection(db, `businesses/${business.id}/clients`));
    const clientsUnsub = onSnapshot(clientsQuery, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
    
    const servicesQuery = query(collection(db, `businesses/${business.id}/services`));
    const servicesUnsub = onSnapshot(servicesQuery, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });

    // Cleanup function to unsubscribe from listeners when the component unmounts
    return () => {
      clientsUnsub();
      servicesUnsub();
    }
  }, [business]);

  // Fetch appointments for the selected day
  React.useEffect(() => {
    if (!date || !business?.id) {
        setAppointments([]);
        setLoading(false);
        return;
    };
    setLoading(true);

    const start = startOfDay(date);
    const end = endOfDay(date);
    
    const startTimestamp = Timestamp.fromDate(start);
    const endTimestamp = Timestamp.fromDate(end);
    
    const appointmentsRef = collection(db, `businesses/${business.id}/appointments`);
    const q = query(appointmentsRef, 
      where("date", ">=", startTimestamp),
      where("date", "<=", endTimestamp),
      orderBy("date")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsData);
      setLoading(false);
    }, (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao buscar agendamentos",
        description: "Verifique suas permissões ou tente novamente mais tarde.",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [date, business, toast]);
  
  const resetForm = () => {
    setSelectedClientId('');
    setSelectedServiceId('');
    setAppointmentTime('');
    setSelectedAppointment(null);
  };
  
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id || !selectedClientId || !selectedServiceId || !appointmentTime || !date) {
       toast({ variant: "destructive", title: "Erro de Validação", description: "Por favor, preencha todos os campos." });
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
        status: 'Confirmado',
        createdAt: new Date(),
      });
      
      toast({ variant: "success", title: "Agendamento Criado!", description: "O novo agendamento foi salvo com sucesso." });
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
       toast({ variant: "destructive", title: "Erro ao Salvar", description: "Não foi possível criar o agendamento. Tente novamente." });
    }
  }
  
  const handleEditAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.id || !selectedAppointment || !selectedClientId || !selectedServiceId || !appointmentTime || !date) {
      toast({ variant: "destructive", title: "Erro de Validação", description: "Por favor, preencha todos os campos." });
      return;
    }

    const [hours, minutes] = appointmentTime.split(':').map(Number);
    // Use the date from the selected appointment, not the calendar's date
    const appointmentDate = selectedAppointment.date.toDate();
    appointmentDate.setHours(hours, minutes, 0, 0);


    const selectedClient = clients.find(c => c.id === selectedClientId);
    const selectedService = services.find(s => s.id === selectedServiceId);
    
    const appointmentRef = doc(db, `businesses/${business.id}/appointments`, selectedAppointment.id);

    try {
      await updateDoc(appointmentRef, {
        clientId: selectedClientId,
        clientName: selectedClient?.name || 'Cliente não encontrado',
        serviceId: selectedServiceId,
        serviceName: selectedService?.name || 'Serviço não encontrado',
        date: Timestamp.fromDate(appointmentDate),
        time: appointmentTime,
      });

      toast({ variant: "success", title: "Agendamento Atualizado!", description: "As alterações foram salvas com sucesso." });
      resetForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Atualizar", description: "Não foi possível salvar as alterações." });
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!business?.id) return;
    const appointmentRef = doc(db, `businesses/${business.id}/appointments`, appointmentId);
    try {
      await deleteDoc(appointmentRef);
      toast({ variant: "success", title: "Agendamento Cancelado", description: "O agendamento foi removido da sua agenda." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Cancelar", description: "Não foi possível remover o agendamento." });
    }
  };

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedClientId(appointment.clientId || '');
    setSelectedServiceId(appointment.serviceId);
    setAppointmentTime(appointment.time);
    setIsEditDialogOpen(true);
  };
  
  const generateWhatsAppLink = (appointment: Appointment) => {
    if (!appointment.clientPhone) return "";
    const cleanPhone = appointment.clientPhone.replace(/\D/g, '');
    const phoneWithCountryCode = cleanPhone.length > 11 ? cleanPhone : `55${cleanPhone}`;
    const dateStr = format(appointment.date.toDate(), "dd/MM/yyyy");
    const message = `Olá, ${appointment.clientName}! Este é um lembrete do seu agendamento para ${appointment.serviceName} no dia ${dateStr} às ${appointment.time}. Estou te esperando, tudo bem? `;
    return `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
  }

  const AppointmentForm = ({ onSubmit, formId }: { onSubmit: (e: React.FormEvent) => void, formId: string }) => (
     <form id={formId} onSubmit={onSubmit} className="space-y-4 py-4">
      <div>
        <Label htmlFor="client">Cliente</Label>
        <Select value={selectedClientId} onValueChange={(value) => {
          setSelectedClientId(value);
        }}>
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
        <Select value={selectedServiceId} onValueChange={(value) => {
          setSelectedServiceId(value);
        }}>
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
  )
  
  const cardTitle = () => {
    if (date) {
        return `Agendamentos de ${format(date, "eeee, dd 'de' MMMM", { locale: ptBR })}`;
    }
    return "Selecione uma data";
  }

  const cardDescription = () => {
    if (loading) return "Carregando...";
    
    if (appointments.length === 0) {
        return "Nenhum agendamento para este dia.";
    }

    return `${appointments.length} agendamento(s) para este dia.`;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold font-headline">Agenda</h1>
         <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
            setIsAddDialogOpen(isOpen);
            if (!isOpen) resetForm();
         }}>
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
                Selecione o cliente, o serviço e o horário. A data selecionada é {date?.toLocaleDateString('pt-BR') || "Nenhuma"}.
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm onSubmit={handleAddAppointment} formId="add-appointment-form" />
             <DialogFooter>
              <Button type="submit" form="add-appointment-form">Salvar Agendamento</Button>
            </DialogFooter>
          </DialogContent>
         </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full p-3"
              classNames={{
                head_row: "flex justify-between",
                row: "flex w-full mt-2 justify-between",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected]:not(.day-outside))]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary",
                day_today: "bg-accent/50 text-accent-foreground",
              }}
              disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
              locale={ptBR}
            />
          </CardContent>
        </Card>
        <Card className="md:col-span-1 lg:col-span-4">
           <CardHeader>
            <CardTitle className="text-xl capitalize">
                {cardTitle()}
            </CardTitle>
            <CardDescription>
                {cardDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {loading ? (
               Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-2 rounded-lg bg-muted/50">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="grid gap-1 flex-1">
                      <Skeleton className="h-4 w-3/5" />
                      <Skeleton className="h-3 w-2/5" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
               ))
            ) : appointments.length > 0 ? (
                appointments.map((app) => (
                    <div key={app.id} className={cn("flex items-center gap-4 p-2 rounded-lg")}>
                        <Avatar aria-hidden="true" className="h-10 w-10">
                        <AvatarImage src={app.clientAvatar} alt="" data-ai-hint="person portrait" />
                        <AvatarFallback>{app.clientName?.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 flex-1">
                        <p className="text-sm font-medium leading-none">{app.clientName}</p>
                        <p className="text-sm text-muted-foreground">{app.serviceName}</p>
                        </div>
                        <div className="text-sm font-medium tabular-nums">{app.time}</div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-label="Abrir menu de ações" aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(app)}>Editar</DropdownMenuItem>
                                {app.clientPhone && (
                                    <DropdownMenuItem asChild className="focus:bg-green-100 dark:focus:bg-green-800/50">
                                        <a href={generateWhatsAppLink(app)} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="mr-2 h-4 w-4 text-green-600"/>
                                        Lembrete WhatsApp
                                        </a>
                                    </DropdownMenuItem>
                                )}
                            <DropdownMenuSeparator />
                                <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Excluir</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso irá cancelar permanentemente o agendamento.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteAppointment(app.id)}>
                                        Sim, excluir
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p>{date ? "Nenhum agendamento para este dia." : "Selecione uma data para começar."}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

       {/* Edit Dialog */}
       <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => {
         setIsEditDialogOpen(isOpen);
         if (!isOpen) resetForm();
       }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogDescription>
              Altere os detalhes do agendamento de {selectedAppointment?.clientName}.
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm onSubmit={handleEditAppointment} formId="edit-appointment-form" />
          <DialogFooter>
            <Button type="submit" form="edit-appointment-form">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

    
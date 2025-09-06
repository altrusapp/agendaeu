
"use client"

import * as React from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Calendar as CalendarIcon, CheckCircle, Clock, PartyPopper, User, Phone, Tag, Calendar as CalendarIconInfo, DollarSign, ChevronRight } from "lucide-react"
import { doc, getDoc, collection, query, getDocs, DocumentData, addDoc, Timestamp, where, updateDoc, increment, limit } from "firebase/firestore"
import { getDay, isToday, parse as parseDateFns } from "date-fns"
import { ptBR } from "date-fns/locale"

import { db } from "@/lib/firebase/client"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type Service = { id: string, name: string, duration: string, price: string };
type BusinessInfo = { 
  id: string;
  name: string;
  logoUrl: string;
  businessHours?: any;
  description?: string;
};

const dayMapping = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const AppointmentSummary = ({ service, date, time }: { service: Service | undefined, date: Date | undefined, time: string | null }) => (
  <Card className="bg-muted/50 sticky top-20">
    <CardHeader>
      <CardTitle className="text-xl">Resumo</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-3">
        <Tag className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Serviço</p>
          <p className="font-semibold">{service?.name || "Selecione um serviço"}</p>
        </div>
      </div>
      <Separator />
      <div className="flex items-center gap-3">
        <CalendarIconInfo className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Data e Hora</p>
          <p className="font-semibold">
            {date ? date.toLocaleDateString('pt-BR') : "Escolha uma data"}
            {time ? ` às ${time}` : ""}
          </p>
        </div>
      </div>
      <Separator />
      <div className="flex items-center gap-3">
        <DollarSign className="h-5 w-5 text-accent-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Preço</p>
          <p className="font-semibold">{service ? `R$ ${service.price}` : "R$ 0,00"}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center gap-2 md:gap-4 my-6">
    <div className={cn("flex items-center gap-2", currentStep >= 1 ? "text-primary font-semibold" : "text-muted-foreground")}>
      <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-sm", currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted")}>1</div>
      <span>Serviço</span>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground" />
     <div className={cn("flex items-center gap-2", currentStep >= 2 ? "text-primary font-semibold" : "text-muted-foreground")}>
      <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-sm", currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted")}>2</div>
      <span>Horário</span>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground" />
    <div className={cn("flex items-center gap-2", currentStep >= 3 ? "text-primary font-semibold" : "text-muted-foreground")}>
      <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-sm", currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted")}>3</div>
      <span>Detalhes</span>
    </div>
  </div>
);


const parseDuration = (duration: string): number => {
    if (!duration) return 0;

    let totalMinutes = 0;
    const hourMatches = duration.match(/(\d+)\s*h/);
    const minMatches = duration.match(/(\d+)\s*min/);

    if (hourMatches) {
        totalMinutes += parseInt(hourMatches[1], 10) * 60;
    }
    if (minMatches) {
        totalMinutes += parseInt(minMatches[1], 10);
    }
    
    // Fallback for simple number or "10min" format without space
    if (totalMinutes === 0) {
        const simpleMinutes = duration.match(/(\d+)/);
        if(simpleMinutes) {
            totalMinutes = parseInt(simpleMinutes[1], 10);
        }
    }

    return totalMinutes > 0 ? totalMinutes : 60; // Default to 60 min if parsing fails
};


export default function PublicSchedulePage() {
  const params = useParams();
  const { toast } = useToast();
  const [businessInfo, setBusinessInfo] = React.useState<BusinessInfo | null>(null);
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [bookedSlots, setBookedSlots] = React.useState<{start: Date, end: Date}[]>([]);
  const [loadingTimes, setLoadingTimes] = React.useState(false);
  const [availableTimes, setAvailableTimes] = React.useState<string[]>([]);

  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [selectedService, setSelectedService] = React.useState<string | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [clientName, setClientName] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  
  const [isSuccess, setIsSuccess] = React.useState(false);
  const businessSlug = params.businessId as string;
  
  const currentStep = React.useMemo(() => {
    if (!selectedService) return 1;
    if (!selectedTime) return 2;
    return 3;
  }, [selectedService, selectedTime]);

  React.useEffect(() => {
    if (!businessSlug) return;

    const fetchBusinessData = async () => {
      setLoading(true);
      try {
        const businessQuery = query(collection(db, "businesses"), where("slug", "==", businessSlug));
        const businessSnapshot = await getDocs(businessQuery);

        if (!businessSnapshot.empty) {
          const businessDoc = businessSnapshot.docs[0];
          const data = businessDoc.data() as DocumentData;
          const businessId = businessDoc.id;
          
          setBusinessInfo({
            id: businessId,
            name: data.businessName || "Negócio sem nome",
            logoUrl: data.logoUrl || "https://picsum.photos/100",
            businessHours: data.businessHours,
            description: data.description || "Siga os passos para agendar seu horário."
          });

          const servicesQuery = query(collection(db, `businesses/${businessId}/services`));
          const servicesSnapshot = await getDocs(servicesQuery);
          const servicesData = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Service[];
          setServices(servicesData);
        }

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações do negócio. Tente novamente.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [businessSlug, toast]);
  
  React.useEffect(() => {
    if (!date || !businessInfo?.id) {
      setBookedSlots([]);
      return;
    }
  
    const fetchAppointments = async () => {
      setLoadingTimes(true);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
  
      const startTimestamp = Timestamp.fromDate(startOfDay);
      const endTimestamp = Timestamp.fromDate(endOfDay);
  
      try {
        const appointmentsRef = collection(db, `businesses/${businessInfo.id}/appointments`);
        const q = query(
          appointmentsRef,
          where("date", ">=", startTimestamp),
          where("date", "<=", endTimestamp)
        );
  
        const querySnapshot = await getDocs(q);
        const appointments = querySnapshot.docs.map(doc => doc.data());
  
        const allServicesQuery = query(collection(db, `businesses/${businessInfo.id}/services`));
        const servicesSnapshot = await getDocs(allServicesQuery);
        const servicesMap = new Map(servicesSnapshot.docs.map(doc => [doc.id, doc.data() as Service]));
  
        const booked = appointments.map(app => {
          const serviceInfo = servicesMap.get(app.serviceId);
          const duration = serviceInfo ? parseDuration(serviceInfo.duration) : 60;
          const startDate = app.date.toDate();
          const endDate = new Date(startDate.getTime() + duration * 60000);
          return { start: startDate, end: endDate };
        });
  
        setBookedSlots(booked);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar horários",
          description: "Não foi possível verificar os horários. Tente novamente.",
        });
      } finally {
        setLoadingTimes(false);
      }
    };
  
    fetchAppointments();
  }, [date, businessInfo?.id, toast]);


  React.useEffect(() => {
    if (!date || !businessInfo?.businessHours || !selectedService) {
      setAvailableTimes([]);
      return;
    }

    setLoadingTimes(true);
    
    const selectedServiceInfo = services.find(s => s.id === selectedService);
    if (!selectedServiceInfo) {
      setLoadingTimes(false);
      return;
    }

    const serviceDuration = parseDuration(selectedServiceInfo.duration);
    const dayOfWeek = dayMapping[getDay(date)];
    const businessDay = businessInfo.businessHours[dayOfWeek];
    const generatedTimes: string[] = [];

    if (businessDay && businessDay.active && businessDay.slots) {
        const now = new Date();

        businessDay.slots.forEach((slot: { start: string, end: string }) => {
            let slotStart = parseDateFns(slot.start, "HH:mm", date);
            const slotEnd = parseDateFns(slot.end, "HH:mm", date);

            while (slotStart.getTime() + serviceDuration * 60000 <= slotEnd.getTime()) {
                const potentialSlotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
                
                const isFutureTime = !isToday(date) || slotStart > now;
                
                const isAvailable = !bookedSlots.some(bookedSlot => 
                    (slotStart < bookedSlot.end && potentialSlotEnd > bookedSlot.start)
                );

                if (isFutureTime && isAvailable) {
                    generatedTimes.push(
                        slotStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    );
                }
                
                // Move to the next slot based on a fixed interval (e.g., 15 minutes) or service duration
                // Using a smaller, fixed interval like 15 minutes allows for more flexible start times
                slotStart.setMinutes(slotStart.getMinutes() + 15);
            }
        });
    }
    
    // Remove duplicates
    setAvailableTimes([...new Set(generatedTimes)]);
    setLoadingTimes(false);

  }, [date, selectedService, businessInfo, bookedSlots, services]);



  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedTime(null);
  }

  const findOrCreateClient = async () => {
    if (!businessInfo?.id || !clientName || !clientPhone) return null;
  
    const clientsRef = collection(db, `businesses/${businessInfo.id}/clients`);
    const q = query(clientsRef, where("phone", "==", clientPhone), limit(1));
    const clientSnapshot = await getDocs(q);
  
    if (!clientSnapshot.empty) {
        const clientId = clientSnapshot.docs[0].id;
        return clientId;
    } else {
        const newClientDoc = await addDoc(clientsRef, {
            name: clientName,
            phone: clientPhone,
            email: "", 
            createdAt: Timestamp.now(),
            lastVisit: Timestamp.now(),
            totalAppointments: 1,
        });
        return newClientDoc.id;
    }
  };

  const handleConfirmAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const selectedServiceInfo = services.find(s => s.id === selectedService);

    if (!businessInfo?.id || !selectedServiceInfo || !date || !selectedTime || !clientName || !clientPhone) {
       toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos.",
      });
      setIsSubmitting(false);
      return;
    }
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    // Final check to ensure the appointment is in the future
    if (appointmentDate < new Date()) {
        toast({
            variant: "destructive",
            title: "Horário Indisponível",
            description: "Esse horário não está mais disponível. Por favor, escolha outro.",
        });
        setSelectedTime(null);
        setAvailableTimes(prev => prev.filter(t => t !== selectedTime));
        setIsSubmitting(false);
        return;
    }

    const appointmentTimestamp = Timestamp.fromDate(appointmentDate);
    
    try {
        const serviceDuration = parseDuration(selectedServiceInfo.duration);
        const appointmentEnd = new Date(appointmentDate.getTime() + serviceDuration * 60000);
        const appointmentEndTimestamp = Timestamp.fromDate(appointmentEnd);
        
        // Final availability check
        const appointmentsRef = collection(db, `businesses/${businessInfo.id}/appointments`);
        const q = query(appointmentsRef, where("date", "<=", appointmentEndTimestamp));
        const querySnapshot = await getDocs(q);
        
        const allServicesQuery = query(collection(db, `businesses/${businessInfo.id}/services`));
        const servicesSnapshot = await getDocs(allServicesQuery);
        const servicesMap = new Map(servicesSnapshot.docs.map(doc => [doc.id, doc.data() as Service]));

        const isConflict = querySnapshot.docs.some(doc => {
            const existingApp = doc.data();
            const existingService = servicesMap.get(existingApp.serviceId);
            const existingDuration = existingService ? parseDuration(existingService.duration) : 60;
            const existingStart = existingApp.date.toDate();
            const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);

            return (appointmentDate < existingEnd && appointmentEnd > existingStart);
        });

        if (isConflict) {
             toast({
                variant: "destructive",
                title: "Horário Indisponível",
                description: `O horário das ${selectedTime} foi agendado por outra pessoa. Por favor, escolha um novo horário.`,
            });
            setSelectedTime(null);
            setBookedSlots(prev => [...prev, { start: appointmentDate, end: appointmentEnd }]);
            setIsSubmitting(false);
            return;
        }

        const clientId = await findOrCreateClient();
        if (!clientId) {
          throw new Error("Não foi possível encontrar ou criar o cliente.");
        }

        await addDoc(collection(db, `businesses/${businessInfo.id}/appointments`), {
            clientId: clientId, 
            clientName,
            clientPhone,
            serviceId: selectedServiceInfo.id,
            serviceName: selectedServiceInfo.name,
            price: Number(selectedServiceInfo.price) || 0,
            date: appointmentTimestamp,
            time: selectedTime,
            status: 'Confirmado',
            createdAt: Timestamp.now(),
        });
        
        setIsSuccess(true);

    } catch (error) {
       console.error("Error confirming appointment:", error);
       toast({
        variant: "destructive",
        title: "Erro ao Agendar",
        description: "Não foi possível confirmar o agendamento. Verifique suas permissões ou tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRestart = () => {
    setSelectedService(null);
    setSelectedTime(null);
    setDate(undefined);
    setClientName("");
    setClientPhone("");
    setIsSuccess(false);
  };
  
  const selectedServiceInfo = services.find(s => s.id === selectedService);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/40">
        <header className="w-full">
          <Skeleton className="h-48 md:h-64 w-full" />
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6 space-y-4">
               <Skeleton className="h-8 w-1/2" />
               <Skeleton className="h-px w-full" />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
               </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!businessInfo) {
    return (
       <div className="flex flex-col min-h-screen bg-muted/40 items-center justify-center text-center p-4">
         <Logo className="h-12 w-12 text-destructive mb-4" />
         <h1 className="text-2xl font-bold">Negócio não encontrado</h1>
         <p className="text-muted-foreground">O link que você acessou pode estar quebrado ou o negócio pode ter sido removido.</p>
         <Button asChild className="mt-6">
           <a href="/">Voltar para a página inicial</a>
         </Button>
       </div>
    )
  }

  if (isSuccess) {
      return (
         <div className="flex flex-col min-h-screen bg-muted/40">
           <header className="w-full">
            <div className="relative animated-gradient-cover h-48 md:h-64 w-full">
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center">
                   <Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-lg">
                      <AvatarImage src={businessInfo.logoUrl} alt={`Logo de ${businessInfo.name}`} data-ai-hint="logo abstract"/>
                      <AvatarFallback>{businessInfo.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 font-headline">{businessInfo.name}</h1>
                </div>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex items-center justify-center">
            <Card className="max-w-lg w-full text-center">
                <CardHeader>
                  <div className="mx-auto bg-success/10 p-3 rounded-full w-fit">
                    <CheckCircle className="h-10 w-10 text-success" />
                  </div>
                  <CardTitle className="text-2xl mt-4">
                    🎉 Pronto, {clientName.split(" ")[0]}! Seu horário está confirmado.
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="text-left bg-muted/50 p-4 rounded-lg space-y-3">
                       <div className="flex items-center gap-3">
                         <CalendarIconInfo className="h-5 w-5 text-muted-foreground" />
                         <p><strong>Data:</strong> {date?.toLocaleDateString('pt-BR')}</p>
                       </div>
                       <div className="flex items-center gap-3">
                         <Clock className="h-5 w-5 text-muted-foreground" />
                         <p><strong>Horário:</strong> {selectedTime}</p>
                       </div>
                       <div className="flex items-center gap-3">
                         <Tag className="h-5 w-5 text-muted-foreground" />
                         <p><strong>Serviço:</strong> {selectedServiceInfo?.name}</p>
                       </div>
                       <div className="flex items-center gap-3">
                         <User className="h-5 w-5 text-muted-foreground" />
                         <p><strong>Profissional:</strong> {businessInfo.name}</p>
                       </div>
                   </div>
                   <div className="text-sm text-muted-foreground">
                    <p>👉 Esse horário é exclusivo para você. Se precisar remarcar, fale com {businessInfo.name}.</p>
                   </div>
                   <Button onClick={handleRestart} className="w-full">Fazer Novo Agendamento</Button>
                </CardContent>
                 <CardFooter className="flex flex-col gap-2 items-center justify-center text-center text-xs text-muted-foreground pt-6 border-t">
                    <p>✨ Obrigada por confiar no AgendaEu.com</p>
                    <p>Seu tempo é precioso. Nós ajudamos você a organizá-lo do seu jeito.</p>
                </CardFooter>
            </Card>
          </main>
         </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="w-full">
        <div className="relative animated-gradient-cover h-48 md:h-64 w-full">
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center">
              <Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-lg">
                <AvatarImage src={businessInfo.logoUrl} alt={`Logo de ${businessInfo.name}`} data-ai-hint="logo abstract"/>
                <AvatarFallback>{businessInfo.name.substring(0,2)}</AvatarFallback>
              </Avatar>
              <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 font-headline">{businessInfo.name}</h1>
              <p className="text-white/90">{businessInfo.description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
                <StepIndicator currentStep={currentStep} />
                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="md:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold font-headline mb-4">1. Selecione o Serviço</h3>
                            <Select onValueChange={handleSelectService} value={selectedService || undefined}>
                              <SelectTrigger className="w-full" aria-label="Selecionar serviço">
                                <SelectValue placeholder="Escolha um serviço..." />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map(service => (
                                    <SelectItem key={service.id} value={service.id}>
                                        <div className="flex justify-between w-full">
                                            <span className="pr-4">{service.name}</span>
                                            <span className="text-muted-foreground">{service.duration} - R${service.price}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                                {services.length === 0 && <p className="p-4 text-sm text-muted-foreground">Nenhum serviço disponível.</p>}
                              </SelectContent>
                            </Select>
                        </div>
                        
                        <div className={cn("space-y-8", !selectedService && "opacity-50 pointer-events-none")}>
                            <div>
                                <h3 className="text-xl font-semibold font-headline mb-4">2. Escolha a Data e Horário</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex justify-center">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            className="p-3 rounded-md border w-full"
                                            classNames={{
                                                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                                month: "space-y-4",
                                                caption: "flex justify-center pt-1 relative items-center",
                                                caption_label: "text-sm font-medium",
                                                nav: "space-x-1 flex items-center",
                                                nav_button: cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
                                                nav_button_previous: "absolute left-1",
                                                nav_button_next: "absolute right-1",
                                                table: "w-full border-collapse space-y-1",
                                                head_row: "flex justify-between",
                                                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                                row: "flex w-full mt-2 justify-between",
                                                cell: "text-center text-sm p-0 relative [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected]:not(.day-outside))]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
                                                day_range_end: "day-range-end",
                                                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary",
                                                day_today: "bg-accent/50 text-accent-foreground",
                                                day_outside: "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                                                day_disabled: "text-muted-foreground opacity-50",
                                                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                                day_hidden: "invisible",
                                            }}
                                            disabled={(d) => {
                                                const yesterday = new Date();
                                                yesterday.setDate(yesterday.getDate() - 1);
                                                yesterday.setHours(0, 0, 0, 0);

                                                if (d < yesterday) return true;
                                                if (isToday(d) && availableTimes.length === 0 && !loadingTimes) return true;

                                                return false;
                                            }}
                                            locale={ptBR}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-center mb-2">Horários disponíveis</h4>
                                        {date && (
                                            <p className="text-center text-muted-foreground mb-4 text-sm capitalize">
                                            Para {date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                                            </p>
                                        )}
                                        {loadingTimes ? (
                                            <div className="grid grid-cols-3 gap-2">
                                                {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2">
                                                {availableTimes.length > 0 ? availableTimes.map(time => (
                                                <Button 
                                                    key={time} 
                                                    variant={selectedTime === time ? "default" : "outline"} 
                                                    onClick={() => setSelectedTime(time)}
                                                    aria-label={`Agendar às ${time}`}
                                                >
                                                    {time}
                                                </Button>
                                                )) : (
                                                    <p className="col-span-3 text-center text-muted-foreground">
                                                        {date && isToday(date) && "Não há mais horários disponíveis hoje."}
                                                        {date && !isToday(date) && "Nenhum horário disponível para este dia."}
                                                        {!date && "Selecione um serviço e uma data para ver os horários."}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cn("space-y-8", !selectedTime && "opacity-50 pointer-events-none")}>
                           <div>
                            <h3 className="text-xl font-semibold font-headline mb-4">3. Seus Detalhes</h3>
                            <form onSubmit={handleConfirmAppointment} className="space-y-4">
                               <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <Input type="text" placeholder="Seu nome completo" required value={clientName} onChange={(e) => setClientName(e.target.value)} className="pl-10" />
                                </div>
                                <div className="relative">
                                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                  <Input type="tel" placeholder="Seu WhatsApp (para lembretes)" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="pl-10" />
                                </div>
                                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                  {isSubmitting ? "Confirmando..." : <><CheckCircle className="mr-2" />Confirmar Agendamento</>}
                                </Button>
                            </form>
                           </div>
                        </div>
                   </div>
                   <div className="md:col-span-1">
                        <AppointmentSummary service={selectedServiceInfo} date={date} time={selectedTime} />
                   </div>
                </div>

            </CardContent>
          </Card>
      </main>
      
       <footer className="bg-transparent mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-5" />
            <span>Orgulhosamente fornecido por AgendaEu.com</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

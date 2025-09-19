
"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Calendar as CalendarIcon, CheckCircle, Clock, PartyPopper, User, Phone, Tag, Calendar as CalendarIconInfo, DollarSign, ChevronRight, Share2 } from "lucide-react"
import { doc, getDoc, collection, query, getDocs, DocumentData, addDoc, Timestamp, where, updateDoc, increment, limit } from "firebase/firestore"
import { getDay, isToday, parse as parseDateFns, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

import { getFirebaseDb } from "@/lib/firebase/client"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn, formatPhone } from "@/lib/utils"

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
        <Tag className="h-5 w-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Serviço</p>
          <p className="font-semibold">{service?.name || "Selecione um serviço"}</p>
        </div>
      </div>
      <Separator />
      <div className="flex items-center gap-3">
        <CalendarIconInfo className="h-5 w-5 text-chart-2" />
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
        <DollarSign className="h-5 w-5 text-success" />
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
  const hourMatch = duration.match(/(\d+)\s*h/);
  const minMatch = duration.match(/(\d+)\s*min/);

  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1], 10);
  }

  // Fallback for simple number if no units are found
  if (totalMinutes === 0 && /^\d+$/.test(duration)) {
    totalMinutes = parseInt(duration, 10);
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
  const [bookedSlots, setBookedSlots] = React.useState<Map<string, {start: Date, end: Date}[]>>(new Map());
  const [loadingTimes, setLoadingTimes] = React.useState(true);
  const [availableTimes, setAvailableTimes] = React.useState<string[]>([]);
  
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [selectedService, setSelectedService] = React.useState<string | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [clientName, setClientName] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  
  const [isSuccess, setIsSuccess] = React.useState(false);
  const businessSlug = params.businessId as string;
  
  const currentStep = React.useMemo(() => {
    if (!selectedService) return 1;
    if (!date || !selectedTime) return 2;
    return 3;
  }, [selectedService, date, selectedTime]);


  const fetchAppointmentsForDate = React.useCallback(async (fetchDate: Date, businessId: string, servicesList: Service[]) => {
    const dateKey = fetchDate.toISOString().split('T')[0];
    if (bookedSlots.has(dateKey) || servicesList.length === 0) {
        setLoadingTimes(false);
        return;
    }

    setLoadingTimes(true);
    try {
        const db = getFirebaseDb();
        const start = startOfDay(fetchDate);
        const end = endOfDay(fetchDate);
        const startTimestamp = Timestamp.fromDate(start);
        const endTimestamp = Timestamp.fromDate(end);

        const appointmentsRef = collection(db, `businesses/${businessId}/appointments`);
        const q = query(
            appointmentsRef,
            where("date", ">=", startTimestamp),
            where("date", "<=", endTimestamp)
        );

        const querySnapshot = await getDocs(q);
        const appointments = querySnapshot.docs.map(doc => doc.data());

        const servicesMap = new Map(servicesList.map(service => [service.id, service]));

        const booked = appointments.map(app => {
            const serviceInfo = servicesMap.get(app.serviceId);
            const duration = serviceInfo ? parseDuration(serviceInfo.duration) : 60;
            const startDate = app.date.toDate();
            const endDate = new Date(startDate.getTime() + duration * 60000);
            return { start: startDate, end: endDate };
        });

        setBookedSlots(prev => new Map(prev).set(dateKey, booked));
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao carregar horários",
            description: "Não foi possível verificar os horários. Tente novamente.",
        });
    } finally {
        setLoadingTimes(false);
    }
  }, [toast, bookedSlots]);


  React.useEffect(() => {
    if (!businessSlug) return;
    
    const fetchBusinessData = async () => {
      setLoading(true);
      
      try {
        const db = getFirebaseDb();
        const businessQuery = query(collection(db, "businesses"), where("slug", "==", businessSlug));
        const businessSnapshot = await getDocs(businessQuery);

        if (!businessSnapshot.empty) {
          const businessDoc = businessSnapshot.docs[0];
          const data = businessDoc.data() as DocumentData;
          const businessId = businessDoc.id;
          
          const info = {
            id: businessId,
            name: data.businessName || "Negócio sem nome",
            logoUrl: data.logoUrl || "https://picsum.photos/100",
            businessHours: data.businessHours,
            description: data.description || "Siga os passos para agendar seu horário."
          };
          setBusinessInfo(info);

          const servicesQuery = query(collection(db, `businesses/${businessId}/services`));
          const servicesSnapshot = await getDocs(servicesQuery);
          const servicesData = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Service[];
          setServices(servicesData);
          
          if(servicesData.length > 0) {
            // Pre-fetch today's appointments once services are loaded
            await fetchAppointmentsForDate(new Date(), businessId, servicesData);
          }

        } else {
           setBusinessInfo(null);
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
  }, [businessSlug, toast, fetchAppointmentsForDate]);
  
  React.useEffect(() => {
    if (!date || !businessInfo?.id || services.length === 0) {
        setAvailableTimes([]);
        return;
    };
    fetchAppointmentsForDate(date, businessInfo.id, services);
  }, [date, businessInfo?.id, services, fetchAppointmentsForDate]);


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
    
    const dateKey = date.toISOString().split('T')[0];
    const currentDayBookedSlots = bookedSlots.get(dateKey) || [];


    if (businessDay && businessDay.active && businessDay.slots) {
        const now = new Date();

        businessDay.slots.forEach((slot: { start: string, end: string }) => {
            let slotStart = parseDateFns(slot.start, "HH:mm", date);
            const slotEnd = parseDateFns(slot.end, "HH:mm", date);

            while (slotStart.getTime() + serviceDuration * 60000 <= slotEnd.getTime()) {
                const potentialSlotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
                
                const isFutureTime = !isToday(date) || slotStart > now;
                
                const isAvailable = !currentDayBookedSlots.some(bookedSlot => 
                    (slotStart < bookedSlot.end && potentialSlotEnd > bookedSlot.start)
                );

                if (isFutureTime && isAvailable) {
                    generatedTimes.push(
                        slotStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    );
                }
                
                slotStart.setMinutes(slotStart.getMinutes() + 15);
            }
        });
    }
    
    setAvailableTimes([...new Set(generatedTimes)]);
    setLoadingTimes(false);

  }, [date, selectedService, businessInfo, bookedSlots, services]);



  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedTime(null);
  }
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setSelectedTime(null);
    }
  }


  const findOrCreateClient = async () => {
    if (!businessInfo?.id || !clientName || !clientPhone) return null;
    const db = getFirebaseDb();
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
            lastVisit: null,
            totalAppointments: 0,
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

    if (!termsAccepted) {
      toast({
        variant: "destructive",
        title: "Termos e Condições",
        description: "Você deve aceitar os termos e a política de privacidade para continuar.",
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
        const db = getFirebaseDb();
        const serviceDuration = parseDuration(selectedServiceInfo.duration);
        const appointmentEnd = new Date(appointmentDate.getTime() + serviceDuration * 60000);
        
        // Final availability check
        const dateKey = date.toISOString().split('T')[0];
        const currentDayBookedSlots = bookedSlots.get(dateKey) || [];

        const isConflict = currentDayBookedSlots.some(bookedSlot => {
            return (appointmentDate < bookedSlot.end && appointmentEnd > bookedSlot.start);
        });

        if (isConflict) {
             toast({
                variant: "destructive",
                title: "Horário Indisponível",
                description: `O horário das ${selectedTime} foi agendado por outra pessoa. Por favor, escolha um novo horário.`,
            });
            setSelectedTime(null);
            // Re-run availability check
             setBookedSlots(prev => {
                const newMap = new Map(prev);
                newMap.set(dateKey, [...currentDayBookedSlots, { start: appointmentDate, end: appointmentEnd }]);
                return newMap;
            });
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
       toast({
        variant: "destructive",
        title: "Erro ao Agendar",
        description: "Não foi possível confirmar o agendamento. Por favor, tente novamente.",
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
    setTermsAccepted(false);
    setIsSuccess(false);
  };
  
  const generateWhatsAppShareLink = () => {
    if (!businessInfo) return "";
    const message = `Olha só, marquei meu horário no ${businessInfo.name}! Super fácil e rápido. 😊 Para agendar também, acesse: ${window.location.href}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
  
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
                         <CalendarIconInfo className="h-5 w-5 text-chart-2" />
                         <p><strong>Data:</strong> {date?.toLocaleDateString('pt-BR')}</p>
                       </div>
                       <div className="flex items-center gap-3">
                         <Clock className="h-5 w-5 text-chart-2" />
                         <p><strong>Horário:</strong> {selectedTime}</p>
                       </div>
                       <div className="flex items-center gap-3">
                         <Tag className="h-5 w-5 text-primary" />
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
                    <Button asChild variant="outline" className="w-full">
                       <a href={generateWhatsAppShareLink()} target="_blank" rel="noopener noreferrer">
                         <Share2 className="mr-2 h-4 w-4" />
                         Compartilhe com uma amiga
                       </a>
                   </Button>
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
                                            onSelect={handleDateSelect}
                                            className="p-3 rounded-md border w-full"
                                            disabled={(d) => {
                                                const yesterday = new Date();
                                                yesterday.setDate(yesterday.getDate() - 1);
                                                yesterday.setHours(23, 59, 59, 999);
                                                
                                                if (d < startOfDay(new Date())) return true;

                                                const dayOfWeek = dayMapping[getDay(d)];
                                                const businessDay = businessInfo?.businessHours?.[dayOfWeek];
                                                if (!businessDay || !businessDay.active) return true;
                                                
                                                if(isToday(d) && !loadingTimes) {
                                                   const todayKey = d.toISOString().split('T')[0];
                                                   const todaySlots = bookedSlots.get(todayKey);
                                                   if (!todaySlots) return true; // Disables if today's slots haven't been fetched yet
                                                }

                                                return false;
                                            }}
                                            locale={ptBR}
                                            formatters={{
                                                formatWeekdayName: (day, options) => {
                                                    const weekday = options?.locale?.localize?.day(day.getDay(), { width: 'short' }) || '';
                                                    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-center mb-2 capitalize">
                                            {date ? date.toLocaleDateString('pt-BR', { weekday: 'long' }) : "Horários disponíveis"}
                                        </h4>
                                        {date && (
                                            <p className="text-center text-muted-foreground mb-4 text-sm">
                                            Para {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                            </p>
                                        )}
                                        {loadingTimes && date ? (
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
                                                        {!date && "Selecione uma data para ver os horários."}
                                                        {date && isToday(date) && "Não há mais horários disponíveis hoje."}
                                                        {date && !isToday(date) && "Nenhum horário disponível para este dia."}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cn("space-y-8", (!selectedTime || !date) && "opacity-50 pointer-events-none")}>
                           <div>
                            <h3 className="text-xl font-semibold font-headline mb-4">3. Seus Detalhes</h3>
                            <form onSubmit={handleConfirmAppointment} className="space-y-4">
                               <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                  <Input type="text" placeholder="Seu nome completo" required value={clientName} onChange={(e) => setClientName(e.target.value)} className="pl-10" />
                                </div>
                                <div className="relative">
                                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                  <Input 
                                    type="tel" 
                                    placeholder="Seu WhatsApp (para lembretes)" 
                                    required 
                                    value={clientPhone} 
                                    onChange={(e) => setClientPhone(formatPhone(e.target.value))} 
                                    className="pl-10" 
                                    maxLength={15}
                                  />
                                </div>
                                 <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} />
                                    <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                                      Eu li e concordo com os{" "}
                                      <Link href="/termos" target="_blank" className="underline hover:text-primary">
                                        Termos de Serviço
                                      </Link>{" "}
                                      e a{" "}
                                      <Link href="/privacidade" target="_blank" className="underline hover:text-primary">
                                        Política de Privacidade
                                      </Link>
                                      .
                                    </Label>
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

    
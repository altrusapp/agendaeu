
"use client"

import * as React from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Calendar as CalendarIcon, CheckCircle, Clock, PartyPopper } from "lucide-react"
import { doc, getDoc, collection, query, getDocs, DocumentData, addDoc, Timestamp, where } from "firebase/firestore"

import { db } from "@/lib/firebase/client"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"

type Service = { id: string, name: string, duration: string, price: string };
type BusinessInfo = { id: string, name: string, logoUrl: string, coverImageUrl: string };

const availableTimes = [ "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00" ];

export default function PublicSchedulePage() {
  const params = useParams();
  const { toast } = useToast();
  const [businessInfo, setBusinessInfo] = React.useState<BusinessInfo | null>(null);
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [bookedTimes, setBookedTimes] = React.useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = React.useState(false);

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = React.useState<string | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [clientName, setClientName] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  const [step, setStep] = React.useState(1); // 1: Service, 2: Date/Time, 3: Confirmation, 4: Success
  const businessSlug = params.businessId as string;

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
            coverImageUrl: data.coverImageUrl || "https://picsum.photos/1200/400"
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
    if (!date || !businessInfo?.id) return;
  
    const fetchBookedTimes = async () => {
      setLoadingTimes(true);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const startTimestamp = Timestamp.fromDate(startOfDay);
      const endTimestamp = Timestamp.fromDate(endOfDay);
      
      try {
        const appointmentsRef = collection(db, `businesses/${businessInfo.id}/appointments`);
        const q = query(appointmentsRef, 
          where("date", ">=", startTimestamp),
          where("date", "<=", endTimestamp)
        );

        const querySnapshot = await getDocs(q);
        const booked = querySnapshot.docs.map(doc => doc.data().time as string);
        setBookedTimes(booked);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar horários",
          description: "Não foi possível verificar os horários disponíveis. Tente novamente.",
        });
      } finally {
        setLoadingTimes(false);
      }
    };
  
    fetchBookedTimes();
  }, [date, businessInfo?.id, toast]);


  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep(2);
  }

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  }

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
    
    // Final check to prevent race condition
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const finalCheckQuery = query(collection(db, `businesses/${businessInfo.id}/appointments`),
        where("date", ">=", Timestamp.fromDate(startOfDay)),
        where("date", "<=", Timestamp.fromDate(endOfDay)),
        where("time", "==", selectedTime)
    );

    const existingAppointmentSnapshot = await getDocs(finalCheckQuery);
    if (!existingAppointmentSnapshot.empty) {
        toast({
            variant: "destructive",
            title: "Horário Indisponível",
            description: `O horário das ${selectedTime} foi agendado por outra pessoa. Por favor, escolha um novo horário.`,
        });
        setStep(2); // Go back to time selection
        setBookedTimes(prev => [...prev, selectedTime]); // Update UI immediately
        setIsSubmitting(false);
        return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);

    try {
      await addDoc(collection(db, `businesses/${businessInfo.id}/appointments`), {
        clientName,
        clientPhone,
        serviceId: selectedServiceInfo.id,
        serviceName: selectedServiceInfo.name,
        date: Timestamp.fromDate(appointmentDate),
        time: selectedTime,
        status: 'Confirmado',
        createdAt: new Date(),
      });
      
      setStep(4); // Move to success step

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Erro ao Agendar",
        description: "Não foi possível confirmar o agendamento. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRestart = () => {
    setSelectedService(null);
    setSelectedTime(null);
    setDate(new Date());
    setClientName("");
    setClientPhone("");
    setStep(1);
  };
  
  const selectedServiceInfo = services.find(s => s.id === selectedService);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/40">
        <header className="w-full">
          <Skeleton className="h-48 md:h-64 w-full" />
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          <Card className="max-w-4xl mx-auto shadow-lg">
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

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="w-full">
        <div className="relative h-48 md:h-64 w-full">
           <Image
              src={businessInfo.coverImageUrl}
              alt={`Capa de ${businessInfo.name}`}
              fill
              className="object-cover"
              data-ai-hint="salon interior"
            />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-lg">
                <AvatarImage src={businessInfo.logoUrl} alt={`Logo de ${businessInfo.name}`} data-ai-hint="logo abstract"/>
                <AvatarFallback>{businessInfo.name.substring(0,2)}</AvatarFallback>
              </Avatar>
              <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 font-headline">{businessInfo.name}</h1>
              <p className="text-white/90">Seja bem-vindo(a)! Escolha seu serviço para começar.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-6">
            {/* Step 1: Select Service */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-semibold font-headline">1. Escolha o Serviço</h2>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSelectService(service.id)}>
                      <CardHeader>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription>{service.duration}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary" className="text-base">R$ {service.price}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                   {services.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center">Nenhum serviço disponível no momento.</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Step 2: Select Date and Time */}
            {step === 2 && (
               <div>
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>Voltar</Button>
                  <h2 className="text-2xl font-semibold font-headline">2. Escolha a Data e Horário</h2>
                </div>
                <Separator className="my-4" />
                 <p className="mb-4">Você selecionou: <span className="font-bold text-primary">{selectedServiceInfo?.name}</span></p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-center"><CalendarIcon className="inline-block mr-2" />Selecione o dia</h3>
                     <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border mx-auto"
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                      />
                  </div>
                   <div>
                     <h3 className="text-lg font-medium mb-2 text-center"><Clock className="inline-block mr-2" />Horários disponíveis</h3>
                      {date && (
                        <p className="text-center text-muted-foreground mb-4 text-sm capitalize">
                          Para {date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                        </p>
                      )}
                     {loadingTimes ? (
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                     ) : (
                        <div className="grid grid-cols-3 gap-2">
                        {availableTimes.map(time => (
                          <Button 
                            key={time} 
                            variant="outline" 
                            onClick={() => handleSelectTime(time)}
                            disabled={bookedTimes.includes(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                     )}
                   </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => setStep(2)}>Voltar</Button>
                    <h2 className="text-2xl font-semibold font-headline">3. Confirme seu Agendamento</h2>
                </div>
                <Separator className="my-4" />
                <form onSubmit={handleConfirmAppointment}>
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle>Resumo do Agendamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Serviço:</span>
                          <span className="font-bold">{selectedServiceInfo?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Data:</span>
                          <span className="font-bold">{date?.toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Horário:</span>
                          <span className="font-bold">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Preço:</span>
                          <span className="font-bold">R$ {selectedServiceInfo?.price}</span>
                        </div>
                        <Separator/>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Seus Dados</h3>
                          <Input type="text" placeholder="Seu nome completo" required value={clientName} onChange={(e) => setClientName(e.target.value)} />
                          <Input type="tel" placeholder="Seu WhatsApp (para lembretes)" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? "Confirmando..." : <><CheckCircle className="mr-2" />Confirmar Agendamento</>}
                        </Button>
                    </CardContent>
                  </Card>
                </form>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center py-10">
                <PartyPopper className="h-16 w-16 mx-auto text-primary" />
                <h2 className="text-3xl font-bold font-headline mt-4">Tudo Certo!</h2>
                <p className="text-muted-foreground mt-2 text-lg">Seu agendamento foi confirmado com sucesso.</p>
                <Card className="max-w-md mx-auto mt-6 text-left bg-muted/50">
                   <CardHeader>
                    <CardTitle>Resumo do Agendamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Serviço:</span>
                        <span className="font-bold">{selectedServiceInfo?.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Data:</span>
                        <span className="font-bold">{date?.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Horário:</span>
                        <span className="font-bold">{selectedTime}</span>
                      </div>
                  </CardContent>
                </Card>
                <Button className="mt-8" onClick={handleRestart}>Fazer Novo Agendamento</Button>
              </div>
            )}

          </CardContent>
        </Card>
      </main>
      
       <footer className="bg-transparent mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-5" />
            <span>Orgulhosamente fornecido por AgeNails</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

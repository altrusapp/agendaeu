
"use client"

import * as React from "react"
import Image from "next/image"
import { Calendar as CalendarIcon, CheckCircle, Clock } from "lucide-react"
import { doc, getDoc, collection, query, getDocs, DocumentData } from "firebase/firestore"

import { db } from "@/lib/firebase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { Skeleton } from "@/components/ui/skeleton"

type Service = { id: string, name: string, duration: string, price: string };
type BusinessInfo = { name: string, logoUrl: string, coverImageUrl: string };

const availableTimes = [ "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00" ];

export default function PublicSchedulePage({ params }: { params: { businessId: string } }) {
  const [businessInfo, setBusinessInfo] = React.useState<BusinessInfo | null>(null);
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = React.useState<string | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [step, setStep] = React.useState(1); // 1: Service, 2: Date/Time, 3: Confirmation

  React.useEffect(() => {
    if (!params.businessId) return;

    const fetchBusinessData = async () => {
      setLoading(true);
      try {
        // Fetch business details
        const businessDocRef = doc(db, "businesses", params.businessId);
        const businessDocSnap = await getDoc(businessDocRef);

        if (businessDocSnap.exists()) {
          const data = businessDocSnap.data() as DocumentData;
          setBusinessInfo({
            name: data.businessName || "Negócio sem nome",
            logoUrl: data.logoUrl || "https://picsum.photos/100",
            coverImageUrl: data.coverImageUrl || "https://picsum.photos/1200/400"
          });
        } else {
          console.error("No such business!");
          // Handle case where business is not found
        }

        // Fetch services
        const servicesQuery = query(collection(db, `businesses/${params.businessId}/services`));
        const servicesSnapshot = await getDocs(servicesQuery);
        const servicesData = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Service[];
        setServices(servicesData);

      } catch (error) {
        console.error("Error fetching business data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [params.businessId]);


  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    setStep(2);
  }

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  }
  
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
       <div className="flex flex-col min-h-screen bg-muted/40 items-center justify-center">
         <p>Este negócio não foi encontrado.</p>
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
                     <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map(time => (
                        <Button key={time} variant="outline" onClick={() => handleSelectTime(time)}>
                          {time}
                        </Button>
                      ))}
                     </div>
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
                      {/* Form for client details */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Seus Dados</h3>
                        <input type="text" placeholder="Seu nome completo" className="w-full p-2 border rounded-md" />
                        <input type="tel" placeholder="Seu WhatsApp (para lembretes)" className="w-full p-2 border rounded-md" />
                      </div>
                      <Button className="w-full" size="lg">
                        <CheckCircle className="mr-2" />
                        Confirmar Agendamento
                      </Button>
                  </CardContent>
                </Card>
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

    
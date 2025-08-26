"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronLeft, ChevronRight, CreditCard, Palette, Scissors } from "lucide-react"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Logo } from "@/components/logo"

const tenantInfo = {
    name: "Espaço Beleza Unica",
    logo: "https://picsum.photos/200?t1",
    slug: "espaco-beleza-unica"
}

const services = [
  { id: 1, name: "Corte Feminino", duration: "1h", price: "R$ 120,00", icon: Scissors },
  { id: 2, name: "Manicure & Pedicure", duration: "1h 30min", price: "R$ 90,00", icon: Palette },
  { id: 3, name: "Coloração", duration: "2h 30min", price: "A partir de R$ 250,00", icon: Palette },
];

const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]

export default function PublicBookingPage({ params }: { params: { slug: string } }) {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    
    const steps = [
        { id: 1, name: 'Serviço' },
        { id: 2, name: 'Data e Hora' },
        { id: 3, name: 'Seus Dados' },
        { id: 4, name: 'Confirmação' },
    ]

    const CurrentIcon = selectedService ? services.find(s => s.id === selectedService)?.icon || Check : Check;

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Escolha um serviço</h2>
                        <div className="grid gap-4">
                            {services.map(service => (
                                <Card key={service.id} className={cn("cursor-pointer hover:border-primary", selectedService === service.id && "border-primary ring-2 ring-primary")} onClick={() => setSelectedService(service.id)}>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <service.icon className="h-5 w-5 text-primary"/>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{service.name}</p>
                                            <p className="text-sm text-muted-foreground">{service.duration}</p>
                                        </div>
                                        <p className="font-semibold">{service.price}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                             <h2 className="text-xl font-semibold mb-4">Escolha uma data</h2>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border"
                                classNames={{ day_selected: "bg-primary text-primary-foreground hover:bg-primary/90", day_today: "bg-accent/50"}}
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Escolha um horário</h2>
                            <RadioGroup value={selectedTime || ""} onValueChange={setSelectedTime} className="grid grid-cols-3 gap-2">
                                {availableTimes.map(time => (
                                    <div key={time}>
                                        <RadioGroupItem value={time} id={time} className="peer sr-only" />
                                        <Label htmlFor={time} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                            {time}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                )
            case 3:
                return (
                     <div>
                        <h2 className="text-xl font-semibold mb-4">Preencha seus dados</h2>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nome completo</Label>
                                <Input id="name" placeholder="Seu nome" />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="seu@email.com" />
                            </div>
                            <div>
                                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                                <Input id="phone" placeholder="(11) 99999-9999" />
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="h-5 w-5"/> Pagamento do Sinal</CardTitle>
                                    <CardDescription>Para garantir seu horário, cobramos um sinal de R$ 20,00 que será abatido do valor total.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full">Pagar R$ 20,00 com Pix ou Cartão</Button>
                                    <p className="text-xs text-center mt-2 text-muted-foreground">Você será redirecionado para um ambiente seguro.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="text-center py-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                           <Check className="h-10 w-10 text-green-600"/>
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Agendamento Confirmado!</h2>
                        <p className="text-muted-foreground mb-6">Seu horário no {tenantInfo.name} está marcado.</p>
                        <Card className="text-left w-full max-w-sm mx-auto">
                            <CardContent className="p-6 space-y-4">
                               <p><strong>Serviço:</strong> {services.find(s => s.id === selectedService)?.name}</p>
                               <p><strong>Data:</strong> {selectedDate?.toLocaleDateString('pt-BR')}</p>
                               <p><strong>Hora:</strong> {selectedTime}</p>
                               <p className="text-sm text-muted-foreground">Enviamos os detalhes e um lembrete para seu WhatsApp e email. Mal podemos esperar para te ver!</p>
                            </CardContent>
                        </Card>
                    </div>
                )
            default:
                return null
        }
    }


  return (
    <div className="min-h-screen bg-background flex flex-col">
       <header className="py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2 text-foreground">
                <Logo className="h-6 w-6"/>
                <span className="font-semibold">Powered by AgeNails</span>
            </Link>
        </div>
       </header>
        <main className="flex-grow flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                 <div className="text-center mb-8">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
                        <AvatarImage src={tenantInfo.logo} data-ai-hint="logo salon" />
                        <AvatarFallback>{tenantInfo.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-3xl font-bold font-headline">{tenantInfo.name}</h1>
                    <p className="text-muted-foreground">Página de Agendamentos</p>
                </div>

                <Card className="overflow-hidden">
                    <div className="border-b p-4">
                        <nav aria-label="Progress">
                          <ol role="list" className="flex items-center">
                            {steps.map((s, stepIdx) => (
                              <li key={s.name} className={cn('relative', stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '')}>
                                {step > s.id ? (
                                  <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                      <div className="h-0.5 w-full bg-primary" />
                                    </div>
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                      <Check className="h-5 w-5 text-white" aria-hidden="true" />
                                    </div>
                                  </>
                                ) : step === s.id ? (
                                  <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                      <div className="h-0.5 w-full bg-gray-200" />
                                    </div>
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white">
                                        <CurrentIcon className="w-5 h-5 text-primary" />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                      <div className="h-0.5 w-full bg-gray-200" />
                                    </div>
                                    <div
                                      className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white"
                                    />
                                  </>
                                )}
                              </li>
                            ))}
                          </ol>
                        </nav>
                    </div>

                    <div className="p-6 md:p-8">
                        {renderStep()}
                    </div>
                    
                    {step < 4 && (
                        <div className="bg-muted/50 p-4 flex justify-between items-center">
                            <Button variant="outline" onClick={() => setStep(s => Math.max(1, s-1))} disabled={step === 1}>
                                <ChevronLeft className="h-4 w-4 mr-2"/>
                                Voltar
                            </Button>
                            <Button onClick={() => setStep(s => Math.min(4, s+1))} disabled={(step === 1 && !selectedService) || (step === 2 && !selectedTime)}>
                                {step === 3 ? "Finalizar Agendamento" : "Avançar"}
                                <ChevronRight className="h-4 w-4 ml-2"/>
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </main>
    </div>
  )
}

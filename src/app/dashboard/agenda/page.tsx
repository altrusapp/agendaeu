"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle } from "lucide-react"

const appointments = {
  "2024-07-29": [
    { time: "09:00", client: "Ana Silva", service: "Manicure", status: "Confirmado", avatar: "https://picsum.photos/100?a" },
    { time: "10:30", client: "Bruno Costa", service: "Corte Masculino", status: "Confirmado", avatar: "https://picsum.photos/100?b" },
    { time: "14:00", client: "Carla Dias", service: "Coloração", status: "Pendente", avatar: "https://picsum.photos/100?c" },
  ],
  "2024-07-30": [
    { time: "11:00", client: "Daniel Alves", service: "Barba Terapia", status: "Confirmado", avatar: "https://picsum.photos/100?d" },
  ],
  "2024-08-01": [
     { time: "09:00", client: "Eduarda Lima", service: "Manicure e Pedicure", status: "Confirmado", avatar: "https://picsum.photos/100?e" },
     { time: "10:00", client: "Fábio Junior", service: "Corte Masculino", status: "Confirmado", avatar: "https://picsum.photos/100?f" },
     { time: "11:00", client: "Gabriela Faria", service: "Escova Progressiva", status: "Aguardando Sinal", avatar: "https://picsum.photos/100?g" },
     { time: "14:00", client: "Heitor Gomes", service: "Limpeza de Pele", status: "Confirmado", avatar: "https://picsum.photos/100?h" },
  ]
};

type Appointment = {
  time: string;
  client: string;
  service: string;
  status: "Confirmado" | "Pendente" | "Aguardando Sinal";
  avatar: string;
};


export default function AgendaPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedAppointments, setSelectedAppointments] = React.useState<Appointment[]>([]);
  
  React.useEffect(() => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      // @ts-ignore
      setSelectedAppointments(appointments[dateString] || []);
    }
  }, [date]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Agenda</h1>
         <Button>
          <PlusCircle className="h-4 w-4 mr-2"/>
          Novo Agendamento
        </Button>
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
              {selectedAppointments.length > 0 ? `Você tem ${selectedAppointments.length} agendamento(s) hoje.` : "Nenhum agendamento para hoje."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {selectedAppointments.length > 0 ? (
              selectedAppointments.map((app, index) => (
                <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                   <Avatar className="hidden h-11 w-11 sm:flex">
                     <AvatarImage src={app.avatar} alt={app.client} data-ai-hint="person portrait" />
                    <AvatarFallback>{app.client.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1 flex-1">
                    <p className="text-sm font-medium leading-none">{app.client}</p>
                    <p className="text-sm text-muted-foreground">{app.service}</p>
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

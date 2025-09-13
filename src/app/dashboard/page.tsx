
"use client"

import * as React from "react"
import Link from "next/link"
import { collection, query, where, getDocs, limit, orderBy, Timestamp, doc, updateDoc, increment } from "firebase/firestore"
import { startOfMonth, endOfMonth, format, startOfToday, endOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Activity, ArrowUpRight, Calendar, Users, DollarSign, MessageCircle, RefreshCw, CheckCircle } from "lucide-react"

import { db } from "@/lib/firebase/client"
import { useBusiness } from "@/app/dashboard/layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

type Appointment = {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  serviceName: string;
  time: string;
  price: number;
  date: Timestamp;
  clientAvatar?: string;
  status?: string;
};

type DashboardStats = {
  totalRevenue: number;
  newClients: number;
  monthlyAppointments: number;
  attendanceRate: number;
};

// Helper to group appointments by date
const groupAppointmentsByDate = (appointments: Appointment[]) => {
  if (!appointments) return {};
  return appointments.reduce((acc, appointment) => {
    const date = format(appointment.date.toDate(), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);
};


export default function DashboardPage() {
  const { business } = useBusiness();
  const { toast } = useToast();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = React.useState<Appointment[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [loadingAppointments, setLoadingAppointments] = React.useState(true);
  const [isSendingReminder, setIsSendingReminder] = React.useState<string | null>(null);
  const [isCompleting, setIsCompleting] = React.useState<string | null>(null);

  const fetchRecentAppointments = React.useCallback(async () => {
    if (!business?.id) return;
    setLoadingAppointments(true);
    try {
       const appointmentsRef = collection(db, `businesses/${business.id}/appointments`);
       const todayStart = startOfToday();
       const todayEnd = endOfToday();

       const q = query(appointmentsRef, 
          where("date", ">=", Timestamp.fromDate(todayStart)),
          where("date", "<=", Timestamp.fromDate(todayEnd)),
          orderBy("date")
      );
      
      const snapshot = await getDocs(q);
      const now = new Date();

      const appointmentsData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Appointment))
        .filter(app => {
            const appDate = app.date.toDate();
            // Filter for appointments that are "Confirmado" AND are in the future
            return (app.status === 'Confirmado' || !app.status) && appDate >= now;
        });

      setUpcomingAppointments(appointmentsData);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Erro ao buscar agendamentos",
        description: "Houve um problema ao carregar seus próximos horários.",
      });
    } finally {
      setLoadingAppointments(false);
    }
  }, [business, toast]);

  const fetchDashboardData = React.useCallback(async () => {
      if (!business?.id) return;
      setLoadingStats(true);
      try {
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const endOfCurrentMonth = endOfMonth(now);
        
        // Fetch appointments for the current month
        const appointmentsRef = collection(db, `businesses/${business.id}/appointments`);
        const monthAppointmentsQuery = query(appointmentsRef, 
          where("date", ">=", Timestamp.fromDate(startOfCurrentMonth)), 
          where("date", "<=", Timestamp.fromDate(endOfCurrentMonth))
        );
        const monthAppointmentsSnapshot = await getDocs(monthAppointmentsQuery);
        
        let totalRevenue = 0;
        monthAppointmentsSnapshot.forEach(doc => {
            const appointmentData = doc.data();
            // Ensure price is a number before adding
            if (typeof appointmentData.price === 'number') {
                totalRevenue += appointmentData.price;
            }
        });

        // Fetch new clients for the current month
        const clientsRef = collection(db, `businesses/${business.id}/clients`);
        const newClientsQuery = query(clientsRef, 
          where("createdAt", ">=", Timestamp.fromDate(startOfCurrentMonth)),
          where("createdAt", "<=", Timestamp.fromDate(endOfCurrentMonth))
        );
        const newClientsSnapshot = await getDocs(newClientsQuery);

        setStats({
          totalRevenue: totalRevenue,
          newClients: newClientsSnapshot.size,
          monthlyAppointments: monthAppointmentsSnapshot.size,
          attendanceRate: 92, // Static for now as we don't have status tracking for this yet
        });

      } catch (error) {
        // Silently fail for stats for now
      } finally {
        setLoadingStats(false);
      }
    }, [business]);

  React.useEffect(() => {
    fetchDashboardData();
    fetchRecentAppointments();
  }, [fetchDashboardData, fetchRecentAppointments]);
  
  const handleMarkAsDone = async (appointment: Appointment) => {
    if (!business?.id || !appointment.clientId) return;
    setIsCompleting(appointment.id);
    try {
        const appointmentRef = doc(db, `businesses/${business.id}/appointments`, appointment.id);
        await updateDoc(appointmentRef, {
            status: 'Concluído'
        });

        const clientRef = doc(db, `businesses/${business.id}/clients`, appointment.clientId);
        await updateDoc(clientRef, {
            lastVisit: appointment.date,
            totalAppointments: increment(1),
        });

        toast({
            variant: "success",
            title: "Atendimento finalizado!",
            description: "O agendamento foi marcado como concluído.",
        });
        fetchRecentAppointments(); // Re-fetch to remove it from the list
        fetchDashboardData(); // Re-fetch stats
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível atualizar o agendamento.",
        });
    } finally {
        setIsCompleting(null);
    }
  }

  const groupedAppointments = groupAppointmentsByDate(upcomingAppointments);
  const appointmentDates = Object.keys(groupedAppointments).sort();
  let globalAppIndex = 0;
  
  const generateWhatsAppLink = (appointment: Appointment) => {
    if (!appointment.clientPhone) return "";
    const cleanPhone = appointment.clientPhone.replace(/\D/g, '');
    const phoneWithCountryCode = cleanPhone.length > 11 ? cleanPhone : `55${cleanPhone}`;
    const dateStr = format(appointment.date.toDate(), "dd/MM/yyyy");
    const message = `Olá, ${appointment.clientName}! Este é um lembrete do seu agendamento para ${appointment.serviceName} no dia ${dateStr} às ${appointment.time}. Estou te esperando, tudo bem?`;
    return `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
  }
  
  const handleSendReminder = (e: React.MouseEvent<HTMLAnchorElement>, appointment: Appointment) => {
    e.preventDefault();
    setIsSendingReminder(appointment.id);
    setTimeout(() => {
        window.open(generateWhatsAppLink(appointment), '_blank', 'noopener,noreferrer');
        setIsSendingReminder(null);
    }, 500);
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="lg:col-span-1">
           <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Próximos Atendimentos</CardTitle>
              <CardDescription>
                Seus compromissos confirmados para hoje.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href="/dashboard/agenda">
                Ver Agenda Completa
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingAppointments ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="grid gap-1 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                  <Skeleton className="h-4 w-10" />
                </div>
              ))
            ) : appointmentDates.length > 0 ? (
                <div className="space-y-4">
                    {appointmentDates.map((dateStr) => (
                      <div key={dateStr}>
                        <h4 className="text-sm font-semibold capitalize mb-3">
                            {format(new Date(dateStr.replace(/-/g, '/')), "eeee, dd 'de' MMMM", { locale: ptBR })}
                        </h4>
                        <div className="space-y-2">
                            {groupedAppointments[dateStr].map((app) => {
                                const currentIndex = globalAppIndex++;
                                return (
                                <div key={app.id} className={cn("flex items-center gap-4 p-2 rounded-md", currentIndex % 2 !== 0 && "bg-muted/50")}>
                                    <Avatar aria-hidden="true" className="hidden h-9 w-9 sm:flex">
                                    <AvatarImage src={app.clientAvatar} alt="" data-ai-hint="person portrait" />
                                    <AvatarFallback>{app.clientName?.substring(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">{app.clientName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {app.serviceName}
                                    </p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost" className="shrink-0 h-9 w-9" onClick={() => handleMarkAsDone(app)} disabled={isCompleting === app.id}>
                                                    {isCompleting === app.id ? <RefreshCw className="h-5 w-5 animate-spin"/> : <CheckCircle className="h-5 w-5 text-primary"/>}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Marcar como concluído</p></TooltipContent>
                                        </Tooltip>
                                        {app.clientPhone && (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button asChild size="icon" variant="ghost" className="shrink-0 h-9 w-9 text-success-foreground bg-success/10 hover:bg-success/20" disabled={isSendingReminder === app.id}>
                                                    <a href={generateWhatsAppLink(app)} onClick={(e) => handleSendReminder(e, app)} target="_blank" rel="noopener noreferrer" aria-label="Enviar lembrete no WhatsApp">
                                                        {isSendingReminder === app.id ? (
                                                           <RefreshCw className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                           <MessageCircle className="h-5 w-5 text-success" />
                                                        )}
                                                    </a>
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Enviar lembrete via WhatsApp</p>
                                              </TooltipContent>
                                            </Tooltip>
                                        )}
                                        <div className="font-medium tabular-nums">{app.time}</div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                      </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                  <p>Nenhum agendamento para hoje.</p>
                   <Button asChild variant="link">
                     <Link href="/dashboard/agenda">Criar novo agendamento</Link>
                   </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-pastel-green text-green-900 dark:bg-pastel-green dark:text-green-100 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita (Mês)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-800 dark:text-green-200" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-3/4 bg-black/10" />
            ) : (
              <div className="text-2xl font-bold">R$ {stats?.totalRevenue.toFixed(2) ?? '0.00'}</div>
            )}
            <p className="text-xs text-green-800/80 dark:text-green-200/80">
              Receita total este mês
            </p>
          </CardContent>
        </Card>
        <Card className="bg-pastel-blue text-blue-900 dark:bg-pastel-blue dark:text-blue-100 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Clientes (Mês)
            </CardTitle>
            <Users className="h-4 w-4 text-blue-800 dark:text-blue-200" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
              <Skeleton className="h-8 w-1/4 bg-black/10" />
            ) : (
              <div className="text-2xl font-bold">+{stats?.newClients ?? 0}</div>
            )}
            <p className="text-xs text-blue-800/80 dark:text-blue-200/80">
              Clientes cadastrados este mês
            </p>
          </CardContent>
        </Card>
        <Card className="bg-pastel-purple text-purple-900 dark:bg-pastel-purple dark:text-purple-100 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos (Mês)</CardTitle>
            <Calendar className="h-4 w-4 text-purple-800 dark:text-purple-200" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
              <Skeleton className="h-8 w-1/4 bg-black/10" />
            ) : (
              <div className="text-2xl font-bold">+{stats?.monthlyAppointments ?? 0}</div>
            )}
            <p className="text-xs text-purple-800/80 dark:text-purple-200/80">
              Agendamentos realizados este mês
            </p>
          </CardContent>
        </Card>
        <Card className="bg-pastel-pink text-pink-900 dark:bg-pastel-pink dark:text-pink-100 border-pink-200 dark:border-pink-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Comparecimento
            </CardTitle>
            <Activity className="h-4 w-4 text-pink-800 dark:text-pink-200" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
              <Skeleton className="h-8 w-1/4 bg-black/10" />
            ) : (
              <div className="text-2xl font-bold">{stats?.attendanceRate ?? 0}%</div>
            )}
            <p className="text-xs text-pink-800/80 dark:text-pink-200/80">
              (Funcionalidade em breve)
            </p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

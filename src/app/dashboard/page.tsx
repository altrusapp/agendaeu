
"use client"

import * as React from "react"
import Link from "next/link"
import { collection, query, where, getDocs, limit, orderBy, Timestamp } from "firebase/firestore"
import { startOfMonth, endOfMonth, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Activity, ArrowUpRight, Calendar, Users, DollarSign, MessageCircle } from "lucide-react"

import { db } from "@/lib/firebase/client"
import { useBusiness } from "@/app/dashboard/layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type Appointment = {
  id: string;
  clientName: string;
  clientPhone?: string;
  serviceName: string;
  time: string;
  price: number;
  date: Timestamp;
  clientAvatar?: string;
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
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = React.useState<Appointment[]>([]);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [loadingAppointments, setLoadingAppointments] = React.useState(true);

  React.useEffect(() => {
    if (!business?.id) return;

    async function fetchDashboardData() {
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
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    async function fetchRecentAppointments() {
      setLoadingAppointments(true);
      try {
         const appointmentsRef = collection(db, `businesses/${business.id}/appointments`);
         const upcomingQuery = query(appointmentsRef, 
            where("date", ">=", Timestamp.fromDate(new Date())), 
            orderBy("date"), 
            limit(10) // Fetch more to ensure we have appointments for a few days
        );
        const snapshot = await getDocs(upcomingQuery);
        const appointmentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
        setRecentAppointments(appointmentsData);
      } catch (error)
 {
        console.error("Error fetching recent appointments:", error);
      } finally {
        setLoadingAppointments(false);
      }
    }

    fetchDashboardData();
    fetchRecentAppointments();
  }, [business]);

  const groupedAppointments = groupAppointmentsByDate(recentAppointments);
  const appointmentDates = Object.keys(groupedAppointments).sort();
  let globalAppIndex = 0;
  
  const generateWhatsAppLink = (appointment: Appointment) => {
    if (!appointment.clientPhone) return "";
    const cleanPhone = appointment.clientPhone.replace(/\D/g, '');
    // Assuming Brazilian numbers, add 55 if not present. This could be improved.
    const phoneWithCountryCode = cleanPhone.length > 11 ? cleanPhone : `55${cleanPhone}`;
    const dateStr = format(appointment.date.toDate(), "dd/MM/yyyy");
    const message = `Olá, ${appointment.clientName}! Este é um lembrete do seu agendamento para ${appointment.serviceName} no dia ${dateStr} às ${appointment.time}. Estamos ansiosos para te ver!`;
    return `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`;
  }

  return (
    <>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-semibold font-headline">Início</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita (Mês)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-3/4" />
            ) : (
              <div className="text-2xl font-bold">R$ {stats?.totalRevenue.toFixed(2) ?? '0.00'}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Receita total este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Clientes (Mês)
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
              <Skeleton className="h-8 w-1/4" />
            ) : (
              <div className="text-2xl font-bold">+{stats?.newClients ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Clientes cadastrados este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos (Mês)</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
              <Skeleton className="h-8 w-1/4" />
            ) : (
              <div className="text-2xl font-bold">+{stats?.monthlyAppointments ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Agendamentos realizados este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Comparecimento
            </CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
             {loadingStats ? (
              <Skeleton className="h-8 w-1/4" />
            ) : (
              <div className="text-2xl font-bold">{stats?.attendanceRate ?? 0}%</div>
            )}
            <p className="text-xs text-muted-foreground">
              (Funcionalidade em breve)
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="lg:col-span-1">
           <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Próximos Agendamentos</CardTitle>
              <CardDescription>
                Seus próximos compromissos confirmados.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href="/dashboard/agenda">
                Ver Agenda Completa
                <ArrowUpRight className="h-4 w-4" />
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
                                    <div className="ml-auto font-medium tabular-nums">{app.time}</div>
                                    {app.clientPhone && (
                                        <Button asChild size="icon" variant="ghost" className="shrink-0 h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-100">
                                            <a href={generateWhatsAppLink(app)} target="_blank" rel="noopener noreferrer" aria-label="Enviar lembrete no WhatsApp">
                                                <MessageCircle className="h-5 w-5" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                                );
                            })}
                        </div>
                      </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-10">
                  <p>Nenhum agendamento futuro encontrado.</p>
                   <Button asChild variant="link">
                     <Link href="/dashboard/agenda">Criar novo agendamento</Link>
                   </Button>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

"use client"

import { MoreHorizontal, PlusCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


const clients = [
  { id: 1, name: "Olivia Martin", email: "olivia.martin@email.com", phone: "(11) 98765-4321", totalAppointments: 12, lastVisit: "2024-07-15", avatar: "https://picsum.photos/100?c1" },
  { id: 2, name: "Jackson Lee", email: "jackson.lee@email.com", phone: "(21) 91234-5678", totalAppointments: 8, lastVisit: "2024-07-20", avatar: "https://picsum.photos/100?c2" },
  { id: 3, name: "Isabella Nguyen", email: "isabella.nguyen@email.com", phone: "(31) 98888-7777", totalAppointments: 25, lastVisit: "2024-07-22", avatar: "https://picsum.photos/100?c3" },
  { id: 4, name: "William Kim", email: "will@email.com", phone: "(41) 99999-6666", totalAppointments: 5, lastVisit: "2024-06-10", avatar: "https://picsum.photos/100?c4" },
  { id: 5, name: "Sofia Davis", email: "sofia.davis@email.com", phone: "(51) 97654-1234", totalAppointments: 1, lastVisit: "2024-07-28", avatar: "https://picsum.photos/100?c5" },
];

export default function ClientesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Clientes</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Novo Cliente
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do novo cliente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input id="name" placeholder="Ex: Ana Silva" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="ana@email.com" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Telefone
                </Label>
                <Input id="phone" placeholder="(11) 99999-9999" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Salvar Cliente</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sua Carteira de Clientes</CardTitle>
          <CardDescription>
            Gerencie seus clientes e veja o histórico de agendamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Avatar</span>
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="hidden md:table-cell">
                  Total de Agendamentos
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Última Visita
                </TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map(client => (
                <TableRow key={client.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={client.avatar} alt={client.name} data-ai-hint="person portrait"/>
                      <AvatarFallback>{client.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <div className="font-medium">{client.email}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">{client.phone}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {client.totalAppointments}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(client.lastVisit).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Histórico</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>1-5</strong> de <strong>{clients.length}</strong> clientes
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

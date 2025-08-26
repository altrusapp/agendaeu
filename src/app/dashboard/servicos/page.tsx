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
import { Switch } from "@/components/ui/switch"

const services = [
  { id: 1, name: "Corte Feminino", duration: "1h", price: "R$ 120,00", active: true },
  { id: 2, name: "Corte Masculino", duration: "45min", price: "R$ 70,00", active: true },
  { id: 3, name: "Manicure", duration: "45min", price: "R$ 40,00", active: true },
  { id: 4, name: "Pedicure", duration: "45min", price: "R$ 50,00", active: true },
  { id: 5, name: "Coloração", duration: "2h 30min", price: "A partir de R$ 250,00", active: true },
  { id: 6, name: "Escova Progressiva", duration: "3h", price: "A partir de R$ 350,00", active: false },
  { id: 7, "name": "Barba Terapia", "duration": "1h", "price": "R$ 80,00", "active": true }
];

export default function ServicosPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Serviços</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Novo Serviço
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Serviço</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do novo serviço que você oferece.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input id="name" placeholder="Ex: Corte Feminino" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duração
                </Label>
                <Input id="duration" placeholder="Ex: 1h 30min" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Preço (R$)
                </Label>
                <Input id="price" type="number" placeholder="120.00" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Salvar Serviço</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Seus Serviços</CardTitle>
          <CardDescription>
            Gerencie os serviços oferecidos em seu estabelecimento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Duração</TableHead>
                <TableHead className="hidden md:table-cell">Preço</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map(service => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                   <TableCell>
                    <Badge variant={service.active ? "default" : "outline"} className={service.active ? "bg-green-500/80 text-white" : ""}>
                      {service.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{service.duration}</TableCell>
                  <TableCell className="hidden md:table-cell">{service.price}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>
                          {service.active ? "Desativar" : "Ativar"}
                        </DropdownMenuItem>
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
            Mostrando <strong>1-{services.length}</strong> de <strong>{services.length}</strong> serviços
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/logo"

const onboardingSchema = z.object({
  businessName: z.string().min(2, { message: "O nome do negócio é obrigatório." }),
  logo: z.any().optional(),
})

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: "",
    },
  })

  function onSubmit(values: z.infer<typeof onboardingSchema>) {
    // Mock onboarding logic
    console.log(values)
    const slug = values.businessName.toLowerCase().replace(/\s+/g, '-')
    toast({
      title: "Tudo pronto!",
      description: "Seu espaço foi criado com sucesso.",
    })
    // In a real app, you'd save this to Firestore and then redirect.
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-6">
           <Link href="/" className="flex items-center gap-2">
              <Logo className="h-10 w-10 text-primary" />
              <span className="text-3xl font-bold font-headline">AgeNails</span>
            </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Configure seu Espaço</CardTitle>
            <CardDescription>Só mais um passo para começar a agendar. Isso aparecerá na sua página pública.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do seu Salão / Barbearia</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Espaço Beleza Unica" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sua Logo (Opcional)</FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 800x400px)</p>
                              </div>
                              <Input id="dropzone-file" type="file" className="hidden" {...field} />
                          </label>
                        </div> 
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Concluir e ir para o painel</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FirebaseError } from "firebase/app"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/logo"
import { auth } from "@/lib/firebase/client"
import { cn } from "@/lib/utils"

const signupSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string()
    .min(8, { message: "A senha deve ter no mínimo 8 caracteres." })
    .regex(/[A-Z]/, { message: "Deve conter pelo menos uma letra maiúscula." })
    .regex(/[a-z]/, { message: "Deve conter pelo menos uma letra minúscula." })
    .regex(/[0-9]/, { message: "Deve conter pelo menos um número." })
    .regex(/[^A-Za-z0-9]/, { message: "Deve conter pelo menos um caractere especial." }),
})

const PasswordRequirement = ({ text, met }: { text: string, met: boolean }) => (
  <p className={cn("text-xs flex items-center gap-2", met ? "text-green-600" : "text-muted-foreground")}>
    <Check className="h-3.5 w-3.5" /> {text}
  </p>
)

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  })
  
  const passwordValue = useWatch({
    control: form.control,
    name: 'password',
  });
  
  const passwordRequirements = {
    length: (passwordValue || '').length >= 8,
    uppercase: /[A-Z]/.test(passwordValue || ''),
    lowercase: /[a-z]/.test(passwordValue || ''),
    number: /[0-9]/.test(passwordValue || ''),
    special: /[^A-Za-z0-9]/.test(passwordValue || ''),
  }


  async function onSubmit(values: z.infer<typeof signupSchema>) {
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Conta criada com sucesso!",
        description: "Vamos configurar seu espaço.",
      })
      router.push("/onboarding")
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("Firebase signup error:", firebaseError.message)
      if (firebaseError.code === "auth/email-already-in-use") {
        toast({
          variant: "destructive",
          title: "Ops! Este email já está em uso.",
          description: "Tente fazer login ou use um email diferente.",
        })
      } else {
         toast({
          variant: "destructive",
          title: "Erro ao criar a conta.",
          description: "Ocorreu um erro inesperado. Tente novamente.",
        })
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
           <Link href="/" className="flex items-center gap-2">
              <Logo className="h-10 w-10 text-primary" />
              <span className="text-3xl font-bold font-headline">AgeNails</span>
            </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Crie sua conta</CardTitle>
            <CardDescription>Comece a gerenciar seu negócio em minutos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seu Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Maria Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                       <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                          <PasswordRequirement text="Pelo menos 8 caracteres" met={passwordRequirements.length} />
                          <PasswordRequirement text="Uma letra maiúscula" met={passwordRequirements.uppercase} />
                          <PasswordRequirement text="Um número" met={passwordRequirements.number} />
                          <PasswordRequirement text="Um caractere especial" met={passwordRequirements.special} />
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{" "}
              <Link href="/login" className="underline text-primary">
                Faça login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

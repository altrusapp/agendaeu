
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Upload, Image as ImageIcon, X } from "lucide-react"
import * as React from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/logo"
import { auth, db } from "@/lib/firebase/client"
import { generateSlug } from "@/lib/utils"

const onboardingSchema = z.object({
  businessName: z.string().min(2, { message: "O nome do negócio é obrigatório." }),
  logo: z.any().optional(),
})

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)

  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])


  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: "",
    },
  })

  async function onSubmit(values: z.infer<typeof onboardingSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Usuário não encontrado. Por favor, faça login novamente.",
      })
      return
    }

    // TODO: Implementar a lógica de upload do arquivo 'values.logo' para o Firebase Storage
    // e obter a URL da imagem para salvar no Firestore.

    const businessId = user.uid;
    const slug = generateSlug(values.businessName);

    try {
      await setDoc(doc(db, "businesses", businessId), {
        businessName: values.businessName,
        ownerId: user.uid,
        slug: slug,
        slugHasBeenChanged: false,
        createdAt: new Date(),
        publicUrl: `/agendar/${slug}`
      });

      toast({
        title: "Tudo pronto!",
        description: "Seu espaço foi criado com sucesso.",
      })
      router.push(`/dashboard`)
    } catch (error) {
      console.error("Error creating business: ", error)
      toast({
        variant: "destructive",
        title: "Erro ao criar seu espaço.",
        description: "Ocorreu um problema ao salvar seus dados. Tente novamente.",
      })
    }
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "Por favor, selecione uma imagem com menos de 2MB.",
        });
        return;
      }
      form.setValue("logo", file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    form.setValue("logo", null);
    setLogoPreview(null);
    if(fileRef.current) {
      fileRef.current.value = "";
    }
  };
  
  if (loading) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="flex flex-col items-center gap-4">
             <Logo className="h-10 w-10 text-primary animate-pulse" />
             <p className="text-muted-foreground">Carregando...</p>
          </div>
       </div>
    )
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
                  render={() => (
                    <FormItem>
                      <FormLabel>Sua Logo (Opcional)</FormLabel>
                       <FormControl>
                        <div>
                          {logoPreview ? (
                            <div className="relative group w-40 h-40 mx-auto">
                              <Image 
                                src={logoPreview} 
                                alt="Pré-visualização da logo" 
                                layout="fill" 
                                objectFit="cover" 
                                className="rounded-full"
                              />
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon"
                                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8"
                                onClick={handleRemoveLogo}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remover logo</span>
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-full">
                              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary">
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Clique para enviar</span> ou arraste e solte</p>
                                      <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 2MB)</p>
                                  </div>
                                  <Input id="dropzone-file" type="file" className="hidden" ref={fileRef} onChange={handleLogoChange} accept="image/png, image/jpeg"/>
                              </label>
                            </div> 
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting ? "Salvando..." : "Concluir e ir para o painel"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


"use client"

import * as React from "react"
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { AlertCircle } from "lucide-react"

import { useBusiness } from "@/app/dashboard/layout"
import { db } from "@/lib/firebase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { generateSlug } from "@/lib/utils"


const profileFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "O nome do negócio precisa ter pelo menos 2 caracteres.",
  }),
  slug: z.string().min(3, {
    message: "O URL precisa ter pelo menos 3 caracteres.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "O URL pode conter apenas letras minúsculas, números e hífens.",
  }),
  description: z.string().max(200).optional(),
  logoUrl: z.string().url({ message: "Por favor, insira uma URL válida para a logo." }).optional().or(z.literal('')),
  coverImageUrl: z.string().url({ message: "Por favor, insira uma URL válida para a imagem de capa." }).optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>


export default function ConfiguracoesPage() {
  const { business } = useBusiness();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      businessName: "",
      slug: "",
      description: "",
      logoUrl: "",
      coverImageUrl: "",
    },
    mode: "onChange",
  })
  
   React.useEffect(() => {
    if (business) {
      form.reset({
        businessName: business.businessName || "",
        slug: business.slug || "",
        description: business.description || "",
        logoUrl: business.logoUrl || "",
        coverImageUrl: business.coverImageUrl || "",
      });
    }
  }, [business, form]);
  
  const handleSlugBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const slugValue = generateSlug(e.target.value);
    form.setValue("slug", slugValue, { shouldValidate: true });
  }

  async function onSubmit(data: ProfileFormValues) {
    if (!business?.id) {
       toast({
        variant: "destructive",
        title: "Erro",
        description: "ID do negócio não encontrado.",
      });
      return;
    }
    
    // Check if slug is changing and has already been changed
    if (data.slug !== business.slug && business.slugHasBeenChanged) {
        toast({
            variant: "destructive",
            title: "Atenção",
            description: "Você não pode alterar a URL pública mais de uma vez.",
        });
        form.setValue("slug", business.slug); // Reset to original slug
        return;
    }

     // Check if the new slug is already taken
    if (data.slug !== business.slug) {
        const q = query(collection(db, "businesses"), where("slug", "==", data.slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            form.setError("slug", {
                type: "manual",
                message: "Esta URL já está em uso. Por favor, escolha outra.",
            });
            return;
        }
    }

    try {
      const businessRef = doc(db, "businesses", business.id);
      
      const updateData: any = {
        businessName: data.businessName,
        description: data.description,
        logoUrl: data.logoUrl,
        coverImageUrl: data.coverImageUrl,
        slug: data.slug,
      };

      if (data.slug !== business.slug) {
        updateData.slugHasBeenChanged = true;
      }
      
      await updateDoc(businessRef, updateData);
       toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado.",
      });
    } catch (error) {
      console.error("Error updating profile:", error)
       toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
      });
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Configurações</h1>
      </div>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil do Negócio</TabsTrigger>
          <TabsTrigger value="account">Minha Conta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfil Público</CardTitle>
              <CardDescription>
                Estas são as informações que seus clientes verão na sua página de agendamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Negócio</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Espaço Beleza Unica" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                   <div className="space-y-2">
                     <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                          Atenção: A URL da sua página pública só pode ser alterada <strong>uma única vez</strong>. Escolha com cuidado.
                      </AlertDescription>
                    </Alert>
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Página Pública</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                onBlur={handleSlugBlur}
                                placeholder="ex: espaco-beleza-unica" 
                                className="pl-32" 
                                disabled={business?.slugHasBeenChanged}
                              />
                               <p className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
                                anotaai.com/agendar/
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   </div>

                   <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Curta</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Fale um pouco sobre seu negócio..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da sua Logo</FormLabel>
                        <FormControl>
                          <Input placeholder="https://exemplo.com/logo.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem de Capa</FormLabel>
                        <FormControl>
                           <Input placeholder="https://exemplo.com/capa.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                     {form.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="account" className="space-y-4">
           <Card>
            <CardHeader>
              <CardTitle>Conta</CardTitle>
              <CardDescription>
                Gerencie as configurações da sua conta pessoal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label>Email</Label>
              <Input value={business?.ownerEmail || "Carregando..."} disabled />
              <p className="text-sm text-muted-foreground">
                Para alterar seu email ou senha, entre em contato com o suporte.
              </p>
            </CardContent>
          </Card>
         </TabsContent>
      </Tabs>
    </>
  )
}

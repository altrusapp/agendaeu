
"use client"

import * as React from "react"
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { AlertCircle, Clock, PlusCircle, Trash2 } from "lucide-react"

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
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

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

const hoursFormSchema = z.object({
  businessHours: z.object({
    sunday: z.object({
      active: z.boolean(),
      slots: z.array(z.object({ start: z.string(), end: z.string() }))
    }),
    monday: z.object({
      active: z.boolean(),
      slots: z.array(z.object({ start: z.string(), end: z.string() }))
    }),
    tuesday: z.object({
      active: z.boolean(),
      slots: z.array(z.object({ start: z.string(), end: z.string() }))
    }),
    wednesday: z.object({
      active: z.boolean(),
      slots: z.array(z.object({ start: z.string(), end: z.string() }))
    }),
    thursday: z.object({
      active: z.boolean(),
      slots: z.array(z.object({ start: z.string(), end: z.string() }))
    }),
    friday: z.object({
      active: z.boolean(),
      slots: z.array(z.object({ start: z.string(), end: z.string() }))
    }),
    saturday: z.object({
      active: z.boolean(),
      slots: z.array(z.object({ start: z.string(), end: z.string() }))
    }),
  })
})

type HoursFormValues = z.infer<typeof hoursFormSchema>

const defaultBusinessHours: HoursFormValues["businessHours"] = {
  sunday: { active: false, slots: [{ start: "09:00", end: "18:00" }] },
  monday: { active: true, slots: [{ start: "09:00", end: "18:00" }] },
  tuesday: { active: true, slots: [{ start: "09:00", end: "18:00" }] },
  wednesday: { active: true, slots: [{ start: "09:00", end: "18:00" }] },
  thursday: { active: true, slots: [{ start: "09:00", end: "18:00" }] },
  friday: { active: true, slots: [{ start: "09:00", end: "18:00" }] },
  saturday: { active: true, slots: [{ start: "09:00", end: "14:00" }] },
}

const dayNames: Record<keyof typeof defaultBusinessHours, string> = {
  sunday: 'Domingo',
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado'
};

function BusinessHoursForm() {
  const { business } = useBusiness();
  const { toast } = useToast();

  const form = useForm<HoursFormValues>({
    resolver: zodResolver(hoursFormSchema),
    defaultValues: {
      businessHours: defaultBusinessHours,
    },
  });

  React.useEffect(() => {
    if (business?.businessHours) {
      form.reset({ businessHours: business.businessHours });
    }
  }, [business, form]);
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "businessHours.monday",
  });

  async function onSubmit(data: HoursFormValues) {
    if (!business?.id) return;
    try {
      const businessRef = doc(db, "businesses", business.id);
      await updateDoc(businessRef, {
        businessHours: data.businessHours
      });
      toast({
        title: "Sucesso!",
        description: "Seus horários de funcionamento foram atualizados.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar horários",
        description: "Não foi possível salvar as alterações. Tente novamente.",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários de Atendimento</CardTitle>
        <CardDescription>Defina os dias e horários que você atende. Isso será refletido na sua página pública de agendamento.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {Object.keys(dayNames).map((day) => (
              <div key={day} className="space-y-4">
                 <FormField
                  control={form.control}
                  name={`businessHours.${day}.active` as const}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {dayNames[day as keyof typeof dayNames]}
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 {form.watch(`businessHours.${day}.active`) && (
                  <div className="pl-4 ml-4 border-l space-y-4">
                      <DaySlots day={day} form={form} />
                  </div>
                )}
                <Separator />
              </div>
            ))}
             <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar Horários"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function DaySlots({ day, form }: { day: string, form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `businessHours.${day}.slots`
  });

  return (
    <div className="space-y-4">
      {fields.map((item, index) => (
        <div key={item.id} className="flex items-end gap-2">
           <FormField
              control={form.control}
              name={`businessHours.${day}.slots.${index}.start` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Início</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`businessHours.${day}.slots.${index}.end` as const}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fim</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ start: '09:00', end: '18:00' })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Adicionar turno
      </Button>
    </div>
  )
}


export default function ConfiguracoesPage() {
  const { business } = useBusiness();
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormValues>({
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
      profileForm.reset({
        businessName: business.businessName || "",
        slug: business.slug || "",
        description: business.description || "",
        logoUrl: business.logoUrl || "",
        coverImageUrl: business.coverImageUrl || "",
      });
    }
  }, [business, profileForm]);
  
  const handleSlugBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const slugValue = generateSlug(e.target.value);
    profileForm.setValue("slug", slugValue, { shouldValidate: true });
  }

  async function onProfileSubmit(data: ProfileFormValues) {
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
        profileForm.setValue("slug", business.slug); // Reset to original slug
        return;
    }

     // Check if the new slug is already taken
    if (data.slug !== business.slug) {
        const q = query(collection(db, "businesses"), where("slug", "==", data.slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            profileForm.setError("slug", {
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
          <TabsTrigger value="hours">Horários</TabsTrigger>
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
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                  <FormField
                    control={profileForm.control}
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
                      control={profileForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Página Pública</FormLabel>
                           <div className="flex items-center gap-2">
                            <span className="p-2 rounded-l-md bg-muted text-muted-foreground text-sm">/agendar/</span>
                            <FormControl>
                              <Input 
                                {...field} 
                                onBlur={handleSlugBlur}
                                placeholder="ex-espaco-beleza" 
                                className="rounded-l-none"
                                disabled={business?.slugHasBeenChanged}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   </div>

                   <FormField
                    control={profileForm.control}
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
                    control={profileForm.control}
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
                    control={profileForm.control}
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
                  <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                     {profileForm.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <BusinessHoursForm />
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

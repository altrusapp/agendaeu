
"use client"

import * as React from "react"
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { AlertCircle, PlusCircle, Trash2 } from "lucide-react"

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
import { cn } from "@/lib/utils"

const profileFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "O nome do negócio precisa ter pelo menos 2 caracteres.",
  }),
  slug: z.string().min(3, {
    message: "O link precisa ter pelo menos 3 caracteres.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "O link pode conter apenas letras minúsculas, números e hífens.",
  }),
  description: z.string().max(200).optional(),
  logoUrl: z.string().url({ message: "Por favor, insira um link válida para a logo." }).optional().or(z.literal('')),
  coverImageUrl: z.string().url({ message: "Por favor, insira um link válida para a imagem de capa." }).optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const accountFormSchema = z.object({
  ownerAvatarUrl: z.string().url({ message: "Por favor, insira uma URL válida para o avatar." }).optional().or(z.literal('')),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;


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

function DaySlots({ day, form }: { day: string, form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `businessHours.${day}.slots`
  });
  
  const isActive = form.watch(`businessHours.${day}.active`);

  return (
    <div className="md:col-span-3">
        {isActive ? (
          <div className="space-y-4">
            {fields.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`businessHours.${day}.slots.${index}.start` as const}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl><Input type="time" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <span className="text-muted-foreground">-</span>
                <FormField
                  control={form.control}
                  name={`businessHours.${day}.slots.${index}.end` as const}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl><Input type="time" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="shrink-0" aria-label={`Remover turno ${index + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => append({ start: '09:00', end: '18:00' })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar turno
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground italic h-full flex items-center">Fechado</p>
        )}
    </div>
  )
}

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
      form.reset({ businessHours: { ...defaultBusinessHours, ...business.businessHours} });
    }
  }, [business, form]);

  async function onSubmit(data: HoursFormValues) {
    if (!business?.id) return;
    try {
      const businessRef = doc(db, "businesses", business.id);
      await updateDoc(businessRef, {
        businessHours: data.businessHours
      });
      toast({
        variant: "success",
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {Object.keys(dayNames).map((day) => (
               <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border p-4 rounded-lg">
                 <div className="md:col-span-1 flex md:flex-col justify-between md:justify-start gap-2">
                    <FormLabel className="text-base font-semibold capitalize">
                      {dayNames[day as keyof typeof dayNames]}
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name={`businessHours.${day}.active` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-label={`Ativar/desativar ${dayNames[day as keyof typeof dayNames]}`}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                 </div>
                 <DaySlots day={day} form={form} />
               </div>
            ))}
             <Button type="submit" disabled={form.formState.isSubmitting} className="mt-6">
              {form.formState.isSubmitting ? "Salvando..." : "Salvar Horários"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
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
  
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      ownerAvatarUrl: "",
    },
    mode: "onChange",
  });
  
   React.useEffect(() => {
    if (business) {
      profileForm.reset({
        businessName: business.businessName || "",
        slug: business.slug || "",
        description: business.description || "",
        logoUrl: business.logoUrl || "",
        coverImageUrl: business.coverImageUrl || "",
      });
      accountForm.reset({
        ownerAvatarUrl: business.ownerAvatarUrl || "",
      });
    }
  }, [business, profileForm, accountForm]);
  
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
    
    if (data.slug !== business.slug && business.slugHasBeenChanged) {
        toast({
            variant: "destructive",
            title: "Atenção",
            description: "Você não pode alterar o link público mais de uma vez.",
        });
        profileForm.setValue("slug", business.slug);
        return;
    }

    if (data.slug !== business.slug) {
        const q = query(collection(db, "businesses"), where("slug", "==", data.slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            profileForm.setError("slug", {
                type: "manual",
                message: "Este link já está em uso. Por favor, escolha outra.",
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
        variant: "success",
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

  async function onAccountSubmit(data: AccountFormValues) {
    if (!business?.id) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "ID do negócio não encontrado.",
      });
      return;
    }

    try {
      const businessRef = doc(db, "businesses", business.id);
      await updateDoc(businessRef, {
        ownerAvatarUrl: data.ownerAvatarUrl,
      });
      toast({
        variant: "success",
        title: "Sucesso!",
        description: "As configurações da sua conta foram atualizadas.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações da conta. Tente novamente.",
      });
    }
  }


  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold font-headline">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do seu negócio e da sua conta.</p>
        </div>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Perfil do Negócio</TabsTrigger>
            <TabsTrigger value="hours">Horários</TabsTrigger>
            <TabsTrigger value="account">Minha Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
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
                            O link da sua página pública só pode ser alterado <strong>uma única vez</strong>.
                          </AlertDescription>
                      </Alert>
                      <FormField
                        control={profileForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link da Página Pública</FormLabel>
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
                          <FormLabel>Link da sua Logo</FormLabel>
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
                          <FormLabel>Link da Imagem de Capa</FormLabel>
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

          <TabsContent value="hours" className="space-y-6">
            <BusinessHoursForm />
          </TabsContent>

           <TabsContent value="account" className="space-y-6">
             <Card>
              <CardHeader>
                <CardTitle>Conta</CardTitle>
                <CardDescription>
                  Gerencie as configurações da sua conta pessoal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <Form {...accountForm}>
                    <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-8">
                      <FormField
                        control={accountForm.control}
                        name="ownerAvatarUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL do seu Avatar</FormLabel>
                            <FormControl>
                              <Input placeholder="https://exemplo.com/minha-foto.png" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                         <Label>Email</Label>
                          <Input value={business?.ownerEmail || "Carregando..."} disabled />
                          <p className="text-sm text-muted-foreground">
                              Para alterar seu email ou senha, entre em contato com o suporte.
                          </p>
                      </div>

                      <Button type="submit" disabled={accountForm.formState.isSubmitting}>
                        {accountForm.formState.isSubmitting ? "Salvando..." : "Salvar Alterações da Conta"}
                      </Button>
                    </form>
                  </Form>
              </CardContent>
            </Card>
           </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

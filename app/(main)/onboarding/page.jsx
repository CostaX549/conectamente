"use client"

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from 'zod';
import { setUserRole } from "@/actions/onboarding";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Stethoscope, User } from 'lucide-react';
import useFetch from '@/hooks/use-fetch';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SPECIALTIES } from '@/lib/specialities';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
const doctorFormSchema = z.object({
    specialty: z.string().min(1, "Especialidade é requirida"),
    experience: z.number().min(1, "A experiência deve ser pelo menos 1 ano")
        .max(70, "A experiência deve ser inferior a 70 anos"),
    credentialUrl: z.url("Por favor insira uma URL válida").min(1, "URL da credencial é necessária"),
    description: z.string()
        .min(20, "Descrição deve ter pelo menos 20 caracteres")
        .max(1000, "Descrição não pode exceder 1000 caracteres")
})
const OnboardingPage = () => {
    const [step, setStep] = useState("choose-role");
    const router = useRouter()
    const { data, fn: submitUserRole, loading } = useFetch(setUserRole)
    const { register, handleSubmit, formState: { errors }, setValue, watch, } = useForm({
        resolver: zodResolver(doctorFormSchema),
        defaultValues: {
            specialty: "",
            experience: undefined,
            credentialUrl: "",
            description: ""
        }
    })
    const specialtyValue = watch("specialty")
    const handlePatientSelection = async () => {
        if (loading) return
        const formData = new FormData()
        formData.append("role", "PATIENT")
        await submitUserRole(formData)
    }
    useEffect(() => {
        if (data && data?.success) {
            toast.success("Cargo Selecionado")
            router.push(data.redirect)
        }
    }, [data])

    const onDoctorSubmit = async (data) => {
    if(loading) return;
    const formData = new FormData()
    formData.append("role", "DOCTOR")
    formData.append("specialty", data.specialty)
    formData.append("experience", data.experience.toString())
    formData.append("credentialUrl", data.credentialUrl)
    formData.append("description", data.description)

    await submitUserRole(formData)
    }
    if (step === "choose-role") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card onClick={() => !loading && handlePatientSelection()} className="border-emerald-900/20 hover:border-emerald-700/40 cursor-pointer transition-all">

                    <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                        <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
                            <User className="h-8 w-8 text-emerald-400" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-white mb-2">Entre como paciente</CardTitle>
                        <CardDescription className="mb-4">Agende consultas, consulte médicos e gerencie sua jornada de saúde.</CardDescription>
                        <Button disabled={loading} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700"> {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            "Continue como paciente"
                        )}</Button>
                    </CardContent>

                </Card>
                <Card
                    onClick={() => !loading && setStep("doctor-form")}
                    className="border-emerald-900/20 hover:border-emerald-700/40 cursor-pointer transition-all">

                    <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
                        <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
                            <Stethoscope className="h-8 w-8 text-emerald-400" />
                        </div>
                        <CardTitle className="text-xl font-semibold text-white mb-2">Entre como médico</CardTitle>
                        <CardDescription className="mb-4">Crie seu perfil profssional, gerencie seus horários e ofereça consultas.</CardDescription>
                        <Button disabled={loading} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700">Continue como médico</Button>
                    </CardContent>

                </Card>

            </div>
        )
    }

    if (step === "doctor-form") {
        return (
            <Card

                className="border-emerald-900/20 ">

                <CardContent className="pt-6">
                    <div className="mb-6">
                        <CardTitle className="text-2xl font-semibold text-white mb-2">Complete seu perfil profissional</CardTitle>
                        <CardDescription className="mb-4">Crie seu perfil profssional, gerencie seus horários e ofereça consultas.</CardDescription>
                    </div>
                    <form className="space-y-6" onSubmit={handleSubmit(onDoctorSubmit)}>
                        <div className="space-y-2">
                            <Label htmlFor="specialty">Especialidade do médico</Label>
                            <Select onValueChange={(value) => setValue("specialty",value)}>
                                <SelectTrigger id="specialty">
                                    <SelectValue placeholder="Selecione sua especialidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SPECIALTIES.map((spec) => {
                                    return  <SelectItem  key={spec.name}
                                    value={spec.name}
                                    className="flex items-center gap-2"
                                    >
                                    <span className="text-emerald-400">{spec.icon}</span>
                                    {spec.name}
                                    </SelectItem>
                                    })}
                                   
                                  
                                </SelectContent>
                            </Select>
                            {errors.specialty &&  (<p className="text-sm font-medium text-red-500 mt-1">
                             {errors.specialty.message}
                                </p>)}
                        </div>
                           <div className="space-y-2">
                            <Label htmlFor="experience">Anos de Experiência</Label>
                            <Input id="experience" type="number" placeholder="eg.5" 
                            {...register("experience", { valueAsNumber: true })}
                             />
                            {errors.experience &&  (<p className="text-sm font-medium text-red-500 mt-1">
                             {errors.experience.message}
                                </p>)}
                        </div>
                           <div className="space-y-2">
                            <Label htmlFor="credentialUrl">Link do Documento Credencial</Label>
                            <Input id="credentialUrl" type="url" placeholder="https://example.com/my-medical-degree.pdf" 
                            {...register("credentialUrl")}
                             />
                            {errors.credentialUrl &&  (<p className="text-sm font-medium text-red-500 mt-1">
                             {errors.credentialUrl.message}
                                </p>)}
                                <p className="text-sm text-muted-foreground">
                                    Por favor, forneça um link para o seu diploma médico ou certificado.
                                </p>
                        </div>
                        <div className="space-y-2">
  <Label htmlFor="description">Descrição de seus serviços</Label>
  <Textarea
    id="description"
    placeholder="Descreva sua experiência, serviços e abordagem no cuidado com os pacientes..."
    rows={4}
    {...register("description")}
  />
  {errors.description && (
    <p className="text-sm font-medium text-red-500 mt-1">
      {errors.description.message}
    </p>
  )}
</div>

<div className="pt-2 flex items-center justify-between">
    <Button type="button" variant="outline" onClick={() => setStep("choose-role")} className="border-emerald-900/30" disabled={loading}>Voltar</Button>
     <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>{loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            "Enviar para verificação"
                        )}</Button>
</div>

                    </form>
                </CardContent>

            </Card>
        )
    }

}

export default OnboardingPage
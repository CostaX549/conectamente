"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Clock, ArrowLeft, Calendar, CreditCard } from "lucide-react";
import { bookAppointment } from "@/actions/appointments";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

export function AppointmentForm({ doctorId, slot, onBack, onComplete }) {
  const [description, setDescription] = useState("");

  // Hook para lidar com loading, dados e erros
  const { loading, data, fn: submitBooking } = useFetch(bookAppointment);

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("doctorId", doctorId);
    formData.append("startTime", slot.startTime);
    formData.append("endTime", slot.endTime);
    formData.append("description", description);

    await submitBooking(formData);
  };

  // Resposta após tentativa de agendamento
  useEffect(() => {
    if (data) {
      if (data.success) {
        toast.success("Consulta agendada com sucesso!");
        onComplete();
      }
    }
  }, [data]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted/20 p-4 rounded-lg border border-emerald-900/20 space-y-3">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-emerald-400 mr-2" />
          <span className="text-white font-medium">
            {format(new Date(slot.startTime), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-emerald-400 mr-2" />
          <span className="text-white">{format(new Date(slot.startTime), "HH:mm")} - {format(new Date(slot.endTime), "HH:mm")}</span>
        </div>
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 text-emerald-400 mr-2" />
          <span className="text-muted-foreground">
            Custo: <span className="text-white font-medium">2 créditos</span>
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Descreva sua preocupação médica (opcional)
        </Label>
        <Textarea
          id="description"
          placeholder="Forneça detalhes sobre sua preocupação médica ou o que deseja discutir na consulta..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-background border-emerald-900/20 h-32"
        />
        <p className="text-sm text-muted-foreground">
          Essas informações serão compartilhadas com o médico antes da consulta.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="border-emerald-900/30"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Alterar Horário
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Agendando...
            </>
          ) : (
            "Confirmar Agendamento"
          )}
        </Button>
      </div>
    </form>
  );
}

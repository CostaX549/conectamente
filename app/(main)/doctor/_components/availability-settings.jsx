"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Plus, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { setAvailabilitySlots } from "@/actions/doctor";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const daysOfWeek = [
  { label: "Domingo", value: 0 },
  { label: "Segunda-feira", value: 1 },
  { label: "Terça-feira", value: 2 },
  { label: "Quarta-feira", value: 3 },
  { label: "Quinta-feira", value: 4 },
  { label: "Sexta-feira", value: 5 },
  { label: "Sábado", value: 6 },
];

export function AvailabilitySettings({ slots }) {
  const [showForm, setShowForm] = useState(false);
  const { loading, fn: submitSlots, data } = useFetch(setAvailabilitySlots);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      dayOfWeek: "1",
      startTime: "",
      endTime: "",
      breakStart: "",
      breakEnd: "",
    },
  });

  const createLocalDateFromTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );
  };

  const onSubmit = async (data) => {
    if (loading) return;

    const formData = new FormData();
    formData.append("dayOfWeek", data.dayOfWeek);
    formData.append(
      "startTime",
      createLocalDateFromTime(data.startTime).toISOString()
    );
    formData.append(
      "endTime",
      createLocalDateFromTime(data.endTime).toISOString()
    );
    if (data.breakStart)
      formData.append(
        "breakStart",
        createLocalDateFromTime(data.breakStart).toISOString()
      );
    if (data.breakEnd)
      formData.append(
        "breakEnd",
        createLocalDateFromTime(data.breakEnd).toISOString()
      );

    await submitSlots(formData);
  };

  useEffect(() => {
    if (data?.success) {
      setShowForm(false);
      toast.success("Disponibilidade salva com sucesso!");
    }
  }, [data]);

  const formatTime = (date) => format(new Date(date), "HH:mm");

  return (
    <Card className="border-emerald-900/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center">
          <Clock className="h-5 w-5 mr-2 text-emerald-400" />
          Configurações de Disponibilidade
        </CardTitle>
        <CardDescription>
          Defina sua disponibilidade diária para consultas
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!showForm ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">
                Disponibilidade Atual
              </h3>

              {slots.length === 0 ? (
                <p className="text-muted-foreground">
                  Nenhum horário definido ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center p-3 rounded-md bg-muted/20 border border-emerald-900/20"
                    >
                      <div className="bg-emerald-900/20 p-2 rounded-full mr-3">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {daysOfWeek.find((d) => d.value === slot.dayOfWeek)
                            ?.label}{" "}
                          - {formatTime(slot.startTime)} às{" "}
                          {formatTime(slot.endTime)}
                        </p>
                        {slot.breakStart && slot.breakEnd && (
                          <p className="text-xs text-muted-foreground">
                            Intervalo: {formatTime(slot.breakStart)} às{" "}
                            {formatTime(slot.breakEnd)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowForm(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Definir Horário de Disponibilidade
            </Button>
          </>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 border border-emerald-900/20 rounded-md p-4"
          >
            <h3 className="text-lg font-medium text-white mb-2">
              Nova Disponibilidade
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Dia da Semana</Label>
                <Select
                  onValueChange={(val) => setValue("dayOfWeek", val)}
                  defaultValue={watch("dayOfWeek")}
                >
                  <SelectTrigger className="bg-background border-emerald-900/20 text-white w-full">
                    <SelectValue placeholder="Selecione um dia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Dias da Semana</SelectLabel>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day.value} value={String(day.value)}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2">Horário de Início</Label>
                <Input
                  type="time"
                  {...register("startTime", { required: true })}
                  className="bg-background border-emerald-900/20"
                />
              </div>

              <div>
                <Label className="mb-2">Horário de Término</Label>
                <Input
                  type="time"
                  {...register("endTime", { required: true })}
                  className="bg-background border-emerald-900/20"
                />
              </div>

              <div>
                <Label className="mb-2">Início do Intervalo (opcional)</Label>
                <Input
                  type="time"
                  {...register("breakStart")}
                  className="bg-background border-emerald-900/20"
                />
              </div>

              <div>
                <Label className="mb-2">Fim do Intervalo (opcional)</Label>
                <Input
                  type="time"
                  {...register("breakEnd")}
                  className="bg-background border-emerald-900/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

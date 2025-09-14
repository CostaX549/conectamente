// /app/doctors/[id]/_components/doctor-profile.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  Clock,
  Medal,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SlotPicker } from "./slot-picker";
import { AppointmentForm } from "./appointment-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DoctorProfile({ doctor, availableDays }) {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const router = useRouter();

  // Total de horários disponíveis
  const totalSlots = availableDays?.reduce(
    (total, day) => total + day.slots.length,
    0
  );

  const toggleBooking = () => {
    setShowBooking(!showBooking);
    if (!showBooking) {
      setTimeout(() => {
        document.getElementById("booking-section")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookingComplete = () => {
    router.push("/appointments");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Coluna esquerda - Foto e informações rápidas */}
      <div className="md:col-span-1">
        <div className="md:sticky md:top-24">
          <Card className="border-emerald-900/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 bg-emerald-900/20">
                  {doctor.imageUrl ? (
                    <Image
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-16 w-16 text-emerald-400" />
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold text-white mb-1">
                  Dr. {doctor.name}
                </h2>

                <Badge
                  variant="outline"
                  className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400 mb-4"
                >
                  {doctor.specialty}
                </Badge>

                <div className="flex items-center justify-center mb-2">
                  <Medal className="h-4 w-4 text-emerald-400 mr-2" />
                  <span className="text-muted-foreground">
                    {doctor.experience} anos de experiência
                  </span>
                </div>

                <Button
                  onClick={toggleBooking}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
                >
                  {showBooking ? (
                    <>
                      Ocultar Agendamento
                      <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Agendar Consulta
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Coluna direita - Detalhes do médico e agendamento */}
      <div className="md:col-span-2 space-y-6">
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Sobre o Dr. {doctor.name}
            </CardTitle>
            <CardDescription>
              Formação profissional e área de atuação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                <h3 className="text-white font-medium">Descrição</h3>
              </div>
              <p className="text-muted-foreground whitespace-pre-line">
                {doctor.description}
              </p>
            </div>

            <Separator className="bg-emerald-900/20" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <h3 className="text-white font-medium">Disponibilidade</h3>
              </div>
              {totalSlots > 0 ? (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-emerald-400 mr-2" />
                  <p className="text-muted-foreground">
                    {totalSlots} horários disponíveis para agendamento nos próximos 4 dias
                  </p>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Não há horários disponíveis nos próximos 4 dias. Por favor, verifique novamente mais tarde.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seção de agendamento */}
        {showBooking && (
          <div id="booking-section">
            <Card className="border-emerald-900/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  Agendar Consulta
                </CardTitle>
                <CardDescription>
                  Selecione um horário e forneça detalhes para a consulta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {totalSlots > 0 ? (
                  <>
                    {/* Seleção de horário */}
                    {!selectedSlot && (
                      <SlotPicker
                        days={availableDays}
                        onSelectSlot={handleSlotSelect}
                      />
                    )}

                    {/* Formulário de agendamento */}
                    {selectedSlot && (
                      <AppointmentForm
                        doctorId={doctor.id}
                        slot={selectedSlot}
                        onBack={() => setSelectedSlot(null)}
                        onComplete={handleBookingComplete}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      Sem horários disponíveis
                    </h3>
                    <p className="text-muted-foreground">
                      Este médico não possui horários de consulta disponíveis para os próximos 4 dias. Por favor, verifique mais tarde ou tente outro médico.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

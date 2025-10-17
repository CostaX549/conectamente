"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { deductCreditsForAppointment } from "@/actions/credits";
import { Vonage } from "@vonage/server-sdk";
import { addDays, addMinutes, endOfDay, format, getDay, isBefore } from "date-fns";

import { Auth } from "@vonage/auth";

// Initialize Vonage Video API client
const credentials = new Auth({
  applicationId: process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID,
  privateKey: process.env.VONAGE_PRIVATE_KEY,
});
const options = {};
const vonage = new Vonage(credentials, options);

/**
 * Book a new appointment with a doctor
 */
export async function bookAppointment(formData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the patient user
    const patient = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Parse form data
    const doctorId = formData.get("doctorId");
    const startTime = new Date(formData.get("startTime"));
    const endTime = new Date(formData.get("endTime"));
    const patientDescription = formData.get("description") || null;

    // Validate input
    if (!doctorId || !startTime || !endTime) {
      throw new Error("Doctor, start time, and end time are required");
    }

    // Check if the doctor exists and is verified
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found or not verified");
    }

    // Check if the patient has enough credits (2 credits per appointment)
    if (patient.credits < 2) {
      throw new Error("Insufficient credits to book an appointment");
    }

    // Check if the requested time slot is available
    const overlappingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: doctorId,
        status: "SCHEDULED",
        OR: [
          {
            // New appointment starts during an existing appointment
            startTime: {
              lte: startTime,
            },
            endTime: {
              gt: startTime,
            },
          },
          {
            // New appointment ends during an existing appointment
            startTime: {
              lt: endTime,
            },
            endTime: {
              gte: endTime,
            },
          },
          {
            // New appointment completely overlaps an existing appointment
            startTime: {
              gte: startTime,
            },
            endTime: {
              lte: endTime,
            },
          },
        ],
      },
    });

    if (overlappingAppointment) {
      throw new Error("This time slot is already booked");
    }

    // Create a new Vonage Video API session
    const sessionId = await createVideoSession();

    // Deduct credits from patient and add to doctor
    const { success, error } = await deductCreditsForAppointment(
      patient.id,
      doctor.id
    );

    if (!success) {
      throw new Error(error || "Failed to deduct credits");
    }

    // Create the appointment with the video session ID
    const appointment = await db.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        startTime,
        endTime,
        patientDescription,
        status: "SCHEDULED",
        videoSessionId: sessionId, // Store the Vonage session ID
      },
    });

        // 💬 CRIA OU BUSCA CHAT EXISTENTE
    let chat = await db.chat.findUnique({
      where: {
        patientId_doctorId: {
          patientId: patient.id,
          doctorId: doctor.id,
        },
      },
    });

    if (!chat) {
      chat = await db.chat.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          isActive: true,
        },
      });
    }


    revalidatePath("/appointments");
    return { success: true, appointment: appointment };
  } catch (error) {
    console.error("Failed to book appointment:", error);
    throw new Error("Failed to book appointment:" + error.message);
  }
}

/**
 * Generate a Vonage Video API session
 */
async function createVideoSession() {
  try {
    const session = await vonage.video.createSession({ mediaMode: "routed" });
    return session.sessionId;
  } catch (error) {
    throw new Error("Failed to create video session: " + error.message);
  }
}

/**
 * Generate a token for a video session
 * This will be called when either doctor or patient is about to join the call
 */
export async function generateVideoToken(formData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const appointmentId = formData.get("appointmentId");

    if (!appointmentId) {
      throw new Error("Appointment ID is required");
    }

    // Find the appointment and verify the user is part of it
    const appointment = await db.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Verify the user is either the doctor or the patient for this appointment
    if (appointment.doctorId !== user.id && appointment.patientId !== user.id) {
      throw new Error("You are not authorized to join this call");
    }

    // Verify the appointment is scheduled
    if (appointment.status !== "SCHEDULED") {
      throw new Error("This appointment is not currently scheduled");
    }

    // Verify the appointment is within a valid time range (e.g., starting 5 minutes before scheduled time)
    const now = new Date();
    const appointmentTime = new Date(appointment.startTime);
    const timeDifference = (appointmentTime - now) / (1000 * 60); // difference in minutes

    if (timeDifference > 30) {
      throw new Error(
        "The call will be available 30 minutes before the scheduled time"
      );
    }

    // Generate a token for the video session
    // Token expires 2 hours after the appointment start time
    const appointmentEndTime = new Date(appointment.endTime);
    const expirationTime =
      Math.floor(appointmentEndTime.getTime() / 1000) + 60 * 60; // 1 hour after end time

    // Use user's name and role as connection data
    const connectionData = JSON.stringify({
      name: user.name,
      role: user.role,
      userId: user.id,
    });

    // Generate the token with appropriate role and expiration
    const token = vonage.video.generateClientToken(appointment.videoSessionId, {
      role: "publisher", // Both doctor and patient can publish streams
      expireTime: expirationTime,
      data: connectionData,
    });

    // Update the appointment with the token
    await db.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        videoSessionToken: token,
      },
    });
 let chat = await db.chat.findUnique({
  where: {
    patientId_doctorId: {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
    },
  },
});

if (!chat) {
  chat = await db.chat.create({
    data: {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      isActive: true,
    },
  });
}
    return {
      success: true,
      videoSessionId: appointment.videoSessionId,
      token: token,
      chatId: chat.id
    };
  } catch (error) {
    console.error("Failed to generate video token:", error);
    throw new Error("Failed to generate video token:" + error.message);
  }
}

/**
 * Get doctor by ID
 */
import { db } from "@/lib/prisma";
import { addDays, addMinutes, endOfDay, format, getDay, isBefore } from "date-fns";

export async function getAvailableTimeSlots(doctorId) {
  try {
    // Verifica se o médico existe e está verificado
    const doctor = await db.user.findUnique({
      where: { id: doctorId, role: "DOCTOR", verificationStatus: "VERIFIED" },
    });
    if (!doctor) throw new Error("Doctor not found or not verified");

    // Busca todas as disponibilidades do médico
    const availabilities = await db.availability.findMany({
      where: { doctorId: doctor.id, status: "AVAILABLE" },
    });
    if (!availabilities || availabilities.length === 0)
      throw new Error("No availability set by doctor");

    // Próximos 4 dias
    const now = new Date();
    const days = [now, addDays(now, 1), addDays(now, 2), addDays(now, 3)];

    // Consulta os compromissos já agendados
    const lastDay = endOfDay(days[3]);
    const existingAppointments = await db.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "SCHEDULED",
        startTime: { lte: lastDay },
      },
    });

    const availableSlotsByDay = {};

    for (const day of days) {
      const dayString = format(day, "yyyy-MM-dd");
      availableSlotsByDay[dayString] = [];

      // Encontra a disponibilidade correspondente ao dia da semana
      const dayOfWeek = getDay(day); // 0 = domingo
      const availability = availabilities.find((a) => a.dayOfWeek === dayOfWeek);
      if (!availability) continue; // Nenhuma disponibilidade para esse dia

      // Define horários de início e fim
      let availabilityStart = new Date(availability.startTime);
      let availabilityEnd = new Date(availability.endTime);

      availabilityStart.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
      availabilityEnd.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());

      // Define intervalo de pausa, se existir
      let breakStart = availability.breakStart
        ? new Date(availability.breakStart)
        : null;
      let breakEnd = availability.breakEnd ? new Date(availability.breakEnd) : null;

      if (breakStart) breakStart.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
      if (breakEnd) breakEnd.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());

      let current = new Date(availabilityStart);

      while (isBefore(current, availabilityEnd)) {
        const next = addMinutes(current, 30);

        // Ignora slots passados
        if (isBefore(next, now)) {
          current = next;
          continue;
        }

        // Ignora slots dentro do intervalo de pausa
        if (breakStart && breakEnd && current < breakEnd && next > breakStart) {
          current = next;
          continue;
        }

        // Ignora slots que conflitam com consultas existentes
        const overlaps = existingAppointments.some((appointment) => {
          const aStart = new Date(appointment.startTime);
          const aEnd = new Date(appointment.endTime);
          return (
            (current >= aStart && current < aEnd) ||
            (next > aStart && next <= aEnd) ||
            (current <= aStart && next >= aEnd)
          );
        });

        if (!overlaps) {
          availableSlotsByDay[dayString].push({
            startTime: current.toISOString(),
            endTime: next.toISOString(),
            formatted: `${format(current, "h:mm a")} - ${format(next, "h:mm a")}`,
            day: format(current, "EEEE, MMMM d"),
          });
        }

        current = next;
      }
    }

    // Converte para array para facilitar o consumo na UI
    const result = Object.entries(availableSlotsByDay).map(([date, slots]) => ({
      date,
      displayDate: slots.length > 0 ? slots[0].day : format(new Date(date), "EEEE, MMMM d"),
      slots,
    }));

    return { days: result };
  } catch (error) {
    console.error("Failed to fetch available slots:", error);
    throw new Error("Failed to fetch available time slots: " + error.message);
  }
}


"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";

/**
 * Verifica se o usuário está autenticado
 */
async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("Usuário não encontrado");
  return user;
}

/**
 * Cria ou retorna um chat existente entre paciente e médico
 * Só cria se houver agendamento válido entre ambos
 */
export async function createOrGetChat(formData) {
  const user = await getCurrentUser();
  const doctorId = formData.get("doctorId");

  if (!doctorId) throw new Error("ID do médico é obrigatório");

  // Verifica se há um agendamento válido (status scheduled ou completed)
  const hasAppointment = await db.appointment.findFirst({
    where: {
      doctorId,
      patientId: user.id,
      status: { in: ["SCHEDULED", "COMPLETED"] },
    },
  });

  if (!hasAppointment) throw new Error("Nenhum agendamento válido encontrado");

  // Verifica se o chat já existe
  let chat = await db.chat.findUnique({
    where: {
      patientId_doctorId: {
        patientId: user.id,
        doctorId,
      },
    },
  });

  // Se não existir, cria
  if (!chat) {
    chat = await db.chat.create({
      data: {
        patientId: user.id,
        doctorId,
        isActive: true,
      },
    });
  }

  revalidatePath("/chat");
  return { chat };
}

/**
 * Retorna todos os chats do usuário (como paciente ou médico)
 */
export async function getUserChats() {
  const user = await getCurrentUser();

  const chats = await db.chat.findMany({
    where: {
      OR: [
        { patientId: user.id },
        { doctorId: user.id },
      ],
    },
    include: {
      patient: { select: { id: true, name: true, imageUrl: true } },
      doctor: { select: { id: true, name: true, imageUrl: true, specialty: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1, // última mensagem
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return { chats };
}

/**
 * Busca todas as mensagens de um chat específico
 */
export async function getChatMessages(chatId) {
  const user = await getCurrentUser();

   const chat = await db.chat.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          files: true, // ✅ inclui os arquivos relacionados à mensagem
        },
      },
    },
  });

  if (!chat) throw new Error("Chat não encontrado");
  if (chat.patientId !== user.id && chat.doctorId !== user.id)
    throw new Error("Acesso negado");

  return { messages: chat.messages };
}

/**
 * Envia uma nova mensagem em um chat
 */


// ...

import path from "path";
import fs from "fs/promises";

export async function sendMessage(formData) {
  try {
    const chatId = formData.get("chatId");
    const content = formData.get("content");

    if (!chatId || (!content && !formData.has("files"))) {
      throw new Error("Mensagem inválida");
    }

    const { userId } = await auth();
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("Usuário não encontrado");

    const chat = await db.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new Error("Chat não encontrado");

    if (chat.patientId !== user.id && chat.doctorId !== user.id)
      throw new Error("Você não faz parte deste chat");

    // Criar mensagem
    const message = await db.message.create({
      data: {
        chatId,
        senderId: user.id,
        content: content || null,
      },
      include: {
        sender: { select: { id: true, name: true, imageUrl: true } },
      },
    });

    // Salvar arquivos (se houver)
    const files = formData.getAll("files");
    if (files.length > 0) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
     
  await fs.mkdir(uploadsDir, { recursive: true });
      const filesData = await Promise.all(
        files.map(async (file) => {
          const filename = `${Date.now()}-${file.name}`;
          const filepath = path.join(uploadsDir, filename);

          const buffer = Buffer.from(await file.arrayBuffer());
          await fs.writeFile(filepath, buffer);

          return db.file.create({
            data: {
              messageId: message.id,
              filename: file.name,
              url: `/uploads/${filename}`, // URL pública continua igual
              mimetype: file.type,
            },
          });
        })
      );

      message.files = filesData;
    }

    // Trigger Pusher
   await pusherServer.trigger(`chat-${chatId}`, "new-message", message)
      .catch((err) => console.error("Pusher trigger failed:", err));

    return { message };
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    throw err;
  }
}





/**
 * Desativa um chat (caso o paciente cancele o agendamento, por exemplo)
 */
export async function deactivateChat(chatId) {
  const user = await getCurrentUser();

  const chat = await db.chat.findUnique({ where: { id: chatId } });
  if (!chat) throw new Error("Chat não encontrado");

  // Apenas o admin ou o paciente pode encerrar
  if (chat.patientId !== user.id && user.role !== "ADMIN")
    throw new Error("Acesso negado");

  await db.chat.update({
    where: { id: chatId },
    data: { isActive: false },
  });

  revalidatePath("/chat");
  return { success: true };
}

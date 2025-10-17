'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { pusherClient } from "@/lib/pusher";
import { getChatMessages, sendMessage, getUserChats } from "@/actions/chat";
import { getCurrentUser } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Paperclip, Loader2, Send, ArrowLeft } from "lucide-react";

export default function DoctorChatPainel() {
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newMessageFiles, setNewMessageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const messagesContainerRef = useRef(null);

  // 🔹 Carrega usuário e conversas
  useEffect(() => {
    const fetchUserAndChats = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        const userChats = await getUserChats();
        setChats(userChats.chats);
      } catch {
        toast.error("Erro ao carregar usuário ou chats");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndChats();
  }, []);

  // 🔹 Carrega mensagens do chat ativo
  useEffect(() => {
    if (!activeChatId) return;
    const loadMessages = async () => {
      try {
        setIsMessagesLoading(true);
        const messagesData = await getChatMessages(activeChatId);
        setMessages(messagesData?.messages || []);
      } catch {
        toast.error("Erro ao carregar mensagens");
      } finally {
        setIsMessagesLoading(false);
      }
    };
    loadMessages();
  }, [activeChatId]);

  // 🔹 Pusher - mensagens em tempo real
  useEffect(() => {
    if (!activeChatId) return;

    const channel = pusherClient.subscribe(`chat-${activeChatId}`);

    const handleNewMessage = (message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;

        const normalize = (txt) => (txt ?? "").trim();
        const tempIndex = prev.findIndex(
          (m) =>
            m.pending &&
            m.senderId === message.senderId &&
            normalize(m.content) === normalize(message.content)
        );

        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = { ...message, pending: false };
          return updated;
        }

        return [...prev, message];
      });
    };

    channel.bind("new-message", handleNewMessage);
    return () => {
      channel.unbind("new-message", handleNewMessage);
      pusherClient.unsubscribe(`chat-${activeChatId}`);
    };
  }, [activeChatId]);

  // 🔹 Auto-scroll no final da conversa
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // 🔹 Enviar mensagem
  const handleSendMessage = async () => {
    if (!currentUser || !activeChatId) return;
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      senderId: currentUser.id,
      content: newMessage,
      files: newMessageFiles.map((file, i) => ({
        id: `temp-file-${i}`,
        url: previews[i]?.url || null,
        filename: file.name,
        mimetype: file.type,
      })),
      pending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setNewMessageFiles([]);
    setPreviews([]);

    try {
      const formData = new FormData();
      formData.append("chatId", activeChatId);
      formData.append("content", tempMessage.content);
      newMessageFiles.forEach((file) => formData.append("files", file));
      await sendMessage(formData);
    } catch {
      toast.error("Erro ao enviar mensagem");
    }
  };

  // 🔹 Upload de arquivos (suporte a imagem, vídeo e documento)
  const handleFileUpload = (files) => {
    if (!files) return;
    const selectedFiles = Array.from(files);

    const newPreviews = selectedFiles.map((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const url = URL.createObjectURL(file);
      return {
        name: file.name,
        type: isImage ? "image" : isVideo ? "video" : "file",
        url,
      };
    });

    setNewMessageFiles((prev) => [...prev, ...selectedFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[85vh] bg-[#050505] text-white">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <div className="flex h-[85vh] bg-[#050505] text-white md:flex-row flex-col transition-all duration-300">
      {/* 🔹 Sidebar */}
      <aside
        className={`bg-[#0b0b0b] border-r border-emerald-900/40 p-4 flex flex-col 
        w-full md:w-72 md:block ${activeChatId ? "hidden md:flex" : "flex"} transition-all`}
      >
        <h1 className="text-2xl font-bold text-emerald-500 mb-6 text-center md:text-left">
          💬 Conversas
        </h1>
        <div className="flex-1 overflow-y-auto space-y-2">
          {chats.length === 0 ? (
            <p className="text-emerald-400 text-sm opacity-70 text-center md:text-left">
              Nenhuma conversa
            </p>
          ) : (
            chats.map((chat) => {
              const otherUser =
                chat.patient.id === currentUser?.id ? chat.doctor : chat.patient;
              const isActive = chat.id === activeChatId;
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`w-full flex items-center p-3 rounded-xl border border-emerald-900/20 transition-all
                    ${
                      isActive
                        ? "bg-emerald-900/40 border-emerald-600"
                        : "bg-emerald-950/20 hover:bg-emerald-900/30"
                    }`}
                >
                  <Image
                    src={otherUser.imageUrl || "/default-avatar.png"}
                    alt={otherUser.name}
                    width={40}
                    height={40}
                    className="rounded-full mr-3 object-cover"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-emerald-400 text-sm">
                      {otherUser.name?.replace(/null/g, "").trim()}
                    </div>
                   
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* 🔹 Chat principal */}
     <main
  className={`flex-1 flex flex-col bg-[#0b0b0b] h-[85vh] ${
    activeChatId ? "flex" : "hidden md:flex"
  } transition-all`}
>
        {!activeChat ? (
          <div className="flex items-center justify-center flex-1 text-gray-400 text-center p-4">
            Selecione um chat para começar
          </div>
        ) : (
          <>
            {/* 🔹 Cabeçalho */}
            <div className="p-4 border-b border-emerald-900/40 flex items-center shrink-0 relative">
              <button
                onClick={() => setActiveChatId(null)}
                className="absolute left-4 md:hidden p-2 text-emerald-400"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <Image
                src={
                  activeChat.doctor.id === currentUser?.id
                    ? activeChat.patient.imageUrl
                    : activeChat.doctor.imageUrl
                }
                alt="User"
                width={40}
                height={40}
                className="rounded-full mr-3 ml-8 md:ml-0"
              />
              <div>
                <div className="font-semibold text-emerald-400 text-sm md:text-base">
                  {(activeChat.doctor.id === currentUser?.id
                    ? activeChat.patient.name
                    : activeChat.doctor.name
                  )?.replace(/null/g, "").trim()}
                </div>
                <div className="text-xs text-gray-400">
                  {activeChat.doctor.specialty || ""}
                </div>
              </div>
            </div>

            {/* 🔹 Mensagens */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3 bg-gradient-to-b from-[#0b0b0b] to-[#08100b] min-h-0"
            >
              {isMessagesLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-[85%] md:max-w-[70%] text-sm md:text-base ${
                          isMe
                            ? "bg-emerald-700 text-white rounded-br-none"
                            : "bg-emerald-950/40 border border-emerald-800/50 text-gray-200 rounded-bl-none"
                        }`}
                      >
                        {msg.content && <p>{msg.content}</p>}

                        {msg.files && msg.files.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {msg.files.map((file) => {
                              if (file.mimetype?.startsWith("image/")) {
                                return (
                                  <Image
                                    key={file.id}
                                    src={file.url}
                                    alt={file.filename}
                                    width={120}
                                    height={120}
                                    className="object-cover rounded-md border border-emerald-800"
                                  />
                                );
                              } else if (file.mimetype?.startsWith("video/")) {
                                return (
                                  <video
                                    key={file.id}
                                    controls
                                    width={200}
                                    className="rounded-md border border-emerald-800"
                                  >
                                    <source src={file.url} type={file.mimetype} />
                                    Seu navegador não suporta vídeo.
                                  </video>
                                );
                              } else {
                                return (
                                 <a
  key={file.id}
  href={`${file.url}?fl_attachment`} // adiciona attachment sempre
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block px-2 py-1 text-xs text-emerald-100 bg-emerald-800/40 rounded-md border border-emerald-700"
>
  {file.filename}
</a>
                                );
                              }
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 🔹 Pré-visualizações */}
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-3 p-2 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative group w-24 h-24 flex items-center justify-center rounded-lg overflow-hidden border border-emerald-800/60 bg-emerald-950/60"
                  >
                    {preview.type === "image" && (
                      <Image
                        src={preview.url}
                        alt={preview.name}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    )}
                    {preview.type === "video" && (
                      <video
                        src={preview.url}
                        className="object-cover w-full h-full"
                        muted
                        loop
                        autoPlay
                      />
                    )}
                    {preview.type === "file" && (
                      <div className="flex flex-col items-center justify-center text-xs text-gray-300 p-1 text-center">
                        <Paperclip className="w-4 h-4 text-emerald-400 mb-1" />
                        <span className="truncate max-w-[70px]">{preview.name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        const newFiles = [...newMessageFiles];
                        const newPreviews = [...previews];
                        newFiles.splice(index, 1);
                        newPreviews.splice(index, 1);
                        setNewMessageFiles(newFiles);
                        setPreviews(newPreviews);
                      }}
                      className="absolute top-1 right-1 bg-black/60 rounded-full text-xs text-white px-[5px] hover:bg-red-600 transition"
                      title="Remover"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 🔹 Input */}
            <div className="p-3 md:p-4 border-t border-emerald-900/40 bg-[#0b0b0b] shrink-0 flex items-center gap-3">
              <input
                type="text"
                placeholder="Digite uma mensagem..."
                className="flex-1 bg-emerald-950/40 border border-emerald-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <input
                type="file"
                id="fileInput"
                className="hidden"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer bg-emerald-700 hover:bg-emerald-600 p-2 rounded-xl"
              >
                <Paperclip className="w-4 h-4" />
              </label>
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() && !newMessageFiles.length}
                className="bg-emerald-700 hover:bg-emerald-600 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

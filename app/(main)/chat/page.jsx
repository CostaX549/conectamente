'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { pusherClient } from "@/lib/pusher";
import { getChatMessages, sendMessage, getUserChats } from "@/actions/chat";
import { getCurrentUser } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Paperclip, Loader2, ArrowLeft } from "lucide-react";

export default function MobileChat() {
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newMessageFiles, setNewMessageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // 🔹 Buscar usuário e chats
  useEffect(() => {
    const fetchUserAndChats = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        const userChats = await getUserChats();
        setChats(userChats.chats);
      } catch (err) {
        toast.error("Erro ao carregar usuário ou chats");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndChats();
  }, []);

  // 🔹 Carregar mensagens do chat ativo
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

  // 🔹 Pusher
  useEffect(() => {
    if (!activeChatId) return;

    const channel = pusherClient.subscribe(`chat-${activeChatId}`);
    const handleNewMessage = (message) => setMessages(prev => [...prev, message]);

    channel.bind("new-message", handleNewMessage);
    return () => {
      channel.unbind("new-message", handleNewMessage);
      pusherClient.unsubscribe(`chat-${activeChatId}`);
    };
  }, [activeChatId]);

  // 🔹 Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentUser || !activeChatId) return;
    const formData = new FormData();
    formData.append("chatId", activeChatId);
    formData.append("content", newMessage);
    newMessageFiles.forEach(file => formData.append("files", file));
    setNewMessage("");

    try {
      await sendMessage(formData);
      setNewMessageFiles([]);
      setPreviews([]);
    } catch {
      toast.error("Erro ao enviar mensagem");
    }
  };

  const handleFileUpload = (files) => {
    if (!files) return;
    const selectedFiles = Array.from(files);
    setNewMessageFiles(prev => [...prev, ...selectedFiles]);

    const imagePreviews = selectedFiles
      .filter(file => file.type.startsWith("image/"))
      .map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...imagePreviews]);
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  if (isLoading) {
    return (
      <div className="flex items-center rounded-xl justify-center h-screen bg-emerald-950 text-white">
        <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // 📱 Mobile layout
  if (!activeChatId) {
    // Lista de chats
    return (
      <div className="h-screen bg-emerald-950 text-white flex flex-col">
        <div className="p-4 font-bold text-lg border-b border-emerald-800 bg-emerald-900/30">Conversas</div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => {
            const lastMessage = chat.messages?.[chat.messages.length - 1];
            const otherUser = chat.patient.id === currentUser?.id ? chat.doctor : chat.patient;

            return (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className="w-full flex items-center p-3 border-b border-emerald-800 hover:bg-emerald-900"
              >
                <Image
                  src={otherUser.imageUrl || "/default-avatar.png"}
                  alt={otherUser.name}
                  width={40}
                  height={40}
                  className="rounded-full mr-3 object-cover"
                />
                <div className="flex-1 text-left overflow-hidden">
               <div className="font-medium truncate">
  {otherUser.name?.replace(/null/g, "")}
</div>
                  {lastMessage && (
                    <div className="text-sm text-emerald-400 truncate">
                      {lastMessage.content}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Chat ativo
  return (
    <div className="flex flex-col h-screen bg-emerald-950 text-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-emerald-800 bg-emerald-900/30">
        <button onClick={() => setActiveChatId(null)} className="mr-3">
          <ArrowLeft className="h-6 w-6 text-emerald-400"/>
        </button>
        <Image
          src={activeChat.doctor.id === currentUser?.id ? activeChat.patient.imageUrl : activeChat.doctor.imageUrl}
          alt={activeChat.doctor.name}
          width={40}
          height={40}
          className="rounded-full mr-3 object-cover"
        />
        <div>
          <div className="font-semibold">
           {(activeChat.doctor.id === currentUser?.id 
    ? activeChat.patient.name 
    : activeChat.doctor.name)?.replace(/null/g, "").trim()}
          </div>
          <div className="text-sm text-emerald-400">{activeChat.doctor.specialty || ""}</div>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isMessagesLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md ${isMe ? "bg-emerald-600 text-white rounded-br-none" : "bg-emerald-800/40 text-emerald-50 rounded-bl-none"}`}>
                  {msg.content && <p>{msg.content}</p>}
                  {msg.files && msg.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.files.map(file =>
                        file.mimetype.startsWith("image/") ? (
                          <Image
                            key={file.id}
                            src={file.url}
                            alt={file.filename}
                            width={100}
                            height={100}
                            className="object-cover rounded-xl border border-emerald-800"
                          />
                        ) : (
                          <a
                            key={file.id}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-2 py-1 text-xs text-emerald-100 bg-emerald-800/40 rounded-xl border border-emerald-700"
                          >
                            {file.filename}
                          </a>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-emerald-800 bg-emerald-950/60 flex flex-col space-y-2">
        <div className="flex flex-wrap gap-2">
          {newMessageFiles.map((file, index) => (
            <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden">
              {file.type.startsWith("image/") ? (
                <img src={previews[index]} alt={file.name} className="h-16 w-16 object-cover rounded-xl border border-emerald-800"/>
              ) : (
                <div className="flex items-center justify-center h-16 w-16 bg-emerald-800/40 text-white rounded-xl border border-emerald-800 p-2 text-xs">
                  <span className="truncate">{file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setNewMessageFiles(prev => prev.filter((_, i) => i !== index));
                  setPreviews(prev => prev.filter((_, i) => i !== index));
                }}
                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >×</button>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-emerald-900/40 border border-emerald-800 rounded-2xl px-4 py-2 text-sm text-white placeholder-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 h-10"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendMessage()}
          />
          <input type="file" id="fileInput" className="hidden" multiple onChange={e => handleFileUpload(e.target.files)}/>
          <label htmlFor="fileInput" className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-2 h-10 w-10 flex items-center justify-center">
            <Paperclip className="h-5 w-5"/>
          </label>
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && !newMessageFiles.length}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-4 h-10 flex items-center justify-center"
          >Enviar</Button>
        </div>
      </div>
    </div>
  );
}

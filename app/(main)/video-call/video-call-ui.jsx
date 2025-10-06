'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { pusherClient } from "@/lib/pusher";
import { createOrGetChat, getChatMessages, sendMessage } from "@/actions/chat";

export default function VideoCall({ sessionId, token, doctorId }) {
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState(null);

  const sessionRef = useRef(null);
  const publisherRef = useRef(null);
  const router = useRouter();
  const appId = process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID;

  // --- Inicializa Video ---
  const handleScriptLoad = () => {
    setScriptLoaded(true);
    if (!window.OT) {
      toast.error("Falha ao carregar Vonage Video API");
      setIsLoading(false);
      return;
    }
    initializeSession();
  };

  const initializeSession = () => {
    if (!appId || !sessionId || !token) {
      toast.error("Parâmetros da chamada ausentes");
      router.push("/appointments");
      return;
    }

    try {
      sessionRef.current = window.OT.initSession(appId, sessionId);

      sessionRef.current.on("streamCreated", (event) => {
        sessionRef.current.subscribe(
          event.stream,
          "subscriber",
          { insertMode: "append", width: "100%", height: "100%" },
          (error) => error && toast.error("Erro ao conectar ao stream")
        );
      });

      sessionRef.current.on("sessionConnected", () => {
        setIsConnected(true);
        setIsLoading(false);
        publisherRef.current = window.OT.initPublisher(
          "publisher",
          { insertMode: "replace", width: "100%", height: "100%", publishAudio: isAudioEnabled, publishVideo: isVideoEnabled },
          (error) => error && toast.error("Erro ao inicializar câmera")
        );
      });

      sessionRef.current.connect(token, (error) => {
        if (!error && publisherRef.current) {
          sessionRef.current.publish(publisherRef.current, (error) => {
            if (error) toast.error("Erro ao publicar stream");
          });
        }
      });
    } catch {
      toast.error("Falha ao inicializar chamada");
      setIsLoading(false);
    }
  };

  // --- Inicializa Chat ---
  useEffect(() => {
    const initChat = async () => {
      try {
        const { chat } = await createOrGetChat(new FormData().append("doctorId", doctorId));
        setChatId(chat.id);

        const { messages } = await getChatMessages(chat.id);
        setMessages(messages);

        // Inscreve no canal em tempo real
        const channel = pusherClient.subscribe(`chat-${chat.id}`);
        channel.bind("new-message", (msg) => {
          setMessages((prev) => [...prev, msg]);
        });

        return () => {
          pusherClient.unsubscribe(`chat-${chat.id}`);
        };
      } catch (err) {
        toast.error("Erro ao carregar chat");
      }
    };
    initChat();
  }, [doctorId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;
    const formData = new FormData();
    formData.append("chatId", chatId);
    formData.append("content", newMessage);

    const { message } = await sendMessage(formData);
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const toggleVideo = () => {
    if (publisherRef.current) {
      publisherRef.current.publishVideo(!isVideoEnabled);
      setIsVideoEnabled((prev) => !prev);
    }
  };

  const toggleAudio = () => {
    if (publisherRef.current) {
      publisherRef.current.publishAudio(!isAudioEnabled);
      setIsAudioEnabled((prev) => !prev);
    }
  };

  const endCall = () => {
    publisherRef.current?.destroy();
    sessionRef.current?.disconnect();
    router.push("/appointments");
  };

  // --- Render ---
  return (
    <>
      <Script
        src="https://unpkg.com/@vonage/client-sdk-video@latest/dist/js/opentok.js"
        onLoad={handleScriptLoad}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Consulta por Vídeo</h1>
          <p className="text-muted-foreground">{isConnected ? "Conectado" : "Conectando..."}</p>
        </div>

        {/* ... (mantém o mesmo layout de vídeo) ... */}

        {/* Chat lateral */}
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full p-4 h-14 w-14 border-emerald-900/30"
            >
              <MessageCircle />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 flex flex-col">
            <SheetHeader>
              <SheetTitle>Chat</SheetTitle>
              <SheetClose />
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg) => (
                <p
                  key={msg.id}
                  className={`p-2 rounded max-w-[80%] ${
                    msg.senderId === chatId ? "self-end bg-muted/20" : "bg-emerald-900/20"
                  }`}
                >
                  {msg.content}
                </p>
              ))}
            </div>
            <div className="p-2 border-t flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite uma mensagem..."
                className="flex-1 border rounded p-2"
              />
              <Button onClick={handleSendMessage}>Enviar</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

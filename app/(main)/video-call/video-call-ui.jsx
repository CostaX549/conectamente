'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { toast } from "sonner";
import Image from "next/image";
import { getChatMessages, sendMessage } from "@/actions/chat";
import { getCurrentUser } from "@/actions/onboarding";
import { pusherClient } from "@/lib/pusher";
import {
  Loader2,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Paperclip,
  MessageCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function VideoCall({ sessionId, token, chatId }) {
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [devices, setDevices] = useState({ hasVideo: false, hasAudio: false });
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newMessageFiles, setNewMessageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const messagesEndRef = useRef(null);
  const sessionRef = useRef(null);
  const publisherRef = useRef(null);
  const router = useRouter();

  const appId = process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID;

  // 🔹 Carregar mensagens
  useEffect(() => {
    if (!chatId) return;

    const loadMessages = async () => {
      try {
        const messagesData = await getChatMessages(chatId);
        setMessages(messagesData?.messages || []);
      } catch (err) {
        toast.error("Erro ao carregar mensagens do chat");
      }
    };

    loadMessages();
  }, [chatId]);

  // 🔹 Buscar usuário atual
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // 🔹 Pusher — escutar novas mensagens
  useEffect(() => {
    if (!chatId) return;

    const channel = pusherClient.subscribe(`chat-${chatId}`);
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
      pusherClient.unsubscribe(`chat-${chatId}`);
    };
  }, [chatId]);

  // 🔹 Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Enviar mensagem
  const handleSendMessage = async () => {
    if (!currentUser) return;
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      senderId: currentUser.id,
      content: newMessage,
      files: newMessageFiles.map((file, i) => ({
        id: `temp-file-${i}`,
        url: file.type.startsWith("image/")
          ? previews[i] || URL.createObjectURL(file)
          : "",
        filename: file.name,
        mimetype: file.type,
      })),
      pending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    const formData = new FormData();
    formData.append("chatId", chatId);
    formData.append("content", newMessage);
    newMessageFiles.forEach((file) => formData.append("files", file));
    setNewMessage("");
    setNewMessageFiles([]);
    setPreviews([]);

    try {
      await sendMessage(formData);
    } catch {
      toast.error("Erro ao enviar a mensagem");
    }
  };

  // 🔹 Upload de arquivos
  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    const selectedFiles = Array.from(files);
    setNewMessageFiles((prev) => [...prev, ...selectedFiles]);
    const imagePreviews = selectedFiles
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...imagePreviews]);
  };

  // 🔹 Verificar dispositivos
  const checkDevices = async () => {
    try {
      const devicesList = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devicesList.some((d) => d.kind === "videoinput");
      const hasAudio = devicesList.some((d) => d.kind === "audioinput");

      let videoAvailable = false;
      let audioAvailable = false;

      if (hasVideo) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoAvailable = true;
          stream.getTracks().forEach((t) => t.stop());
        } catch {}
      }

      if (hasAudio) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioAvailable = true;
          stream.getTracks().forEach((t) => t.stop());
        } catch {}
      }

      setDevices({ hasVideo: videoAvailable, hasAudio: audioAvailable });
      return { videoAvailable, audioAvailable };
    } catch (err) {
      console.warn(err);
      setDevices({ hasVideo: false, hasAudio: false });
      return { videoAvailable: false, audioAvailable: false };
    }
  };

  // 🔹 Carregar script do Vonage
  const handleScriptLoad = async () => {
    setScriptLoaded(true);
    if (!window.OT) {
      toast.error("Falha ao carregar Vonage Video API");
      setIsLoading(false);
      return;
    }
    const { videoAvailable, audioAvailable } = await checkDevices();
    initializeSession(videoAvailable, audioAvailable);
  };

  // 🔹 Inicializar sessão
  const initializeSession = (videoAvailable, audioAvailable) => {
    if (!appId || !sessionId || !token) {
      toast.error("Parâmetros obrigatórios ausentes");
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

        if (!videoAvailable && !audioAvailable) {
          toast.info(
            "Nenhum dispositivo de áudio/vídeo detectado. Você entrará sem transmitir áudio ou vídeo."
          );
          return;
        }

        publisherRef.current = window.OT.initPublisher(
          "publisher",
          {
            insertMode: "append",
    width: "100%",
    height: "100%",
            publishAudio: isAudioEnabled,
            publishVideo: isVideoEnabled,
            videoSource: videoAvailable ? undefined : null,
            audioSource: audioAvailable ? undefined : null,
          },
          (error) => error && toast.error("Erro ao inicializar câmera/microfone")
        );

        sessionRef.current.publish(publisherRef.current, (error) => {
          if (error) toast.error("Erro ao publicar seu stream");
        });
      });

      sessionRef.current.on("sessionDisconnected", () => setIsConnected(false));

      sessionRef.current.connect(token, (error) => {
        if (error) toast.error("Falha ao conectar à sessão");
      });
    } catch {
      toast.error("Falha ao inicializar chamada de vídeo");
      setIsLoading(false);
    }
  };

  // 🔹 Controles
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

  useEffect(() => {
    return () => {
      publisherRef.current?.destroy();
      sessionRef.current?.disconnect();
    };
  }, []);

  return (
    <>
      <Script
        key="vonage-script"
        src="https://unpkg.com/@vonage/client-sdk-video@latest/dist/js/opentok.js"
        onLoad={handleScriptLoad}
        onError={() => {
          toast.error("Falha ao carregar script da chamada de vídeo");
          setIsLoading(false);
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Consulta por Vídeo</h1>
          <p className="text-muted-foreground">
            {isConnected
              ? "Conectado"
              : isLoading
              ? "Conectando..."
              : "Falha na conexão"}
          </p>
        </div>

        {isLoading || !scriptLoaded ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
            <p className="text-white text-lg">
              Carregando componentes da chamada de vídeo...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Publisher */}
              <div className="border border-emerald-900/20 rounded-lg overflow-hidden">
                <div className="bg-emerald-900/10 px-3 py-2 text-emerald-400 text-sm font-medium">
                  Você
                </div>
                <div id="publisher" className="w-full aspect-video bg-muted/30">
                  {(!isConnected || !scriptLoaded) && (
                    <div className="flex items-center justify-center h-full">
                      <div className="bg-muted/20 rounded-full p-8">
                        <User className="h-12 w-12 text-emerald-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscriber */}
              <div className="border border-emerald-900/20 rounded-lg overflow-hidden">
                <div className="bg-emerald-900/10 px-3 py-2 text-emerald-400 text-sm font-medium">
                  Outro Participante
                </div>
                <div id="subscriber" className="w-full aspect-video bg-muted/30">
                  {(!isConnected || !scriptLoaded) && (
                    <div className="flex items-center justify-center h-full">
                      <div className="bg-muted/20 rounded-full p-8">
                        <User className="h-12 w-12 text-emerald-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={toggleVideo}
                disabled={!publisherRef.current || !devices.hasVideo}
                className={`rounded-full p-4 h-14 w-14 ${
                  isVideoEnabled
                    ? "border-emerald-900/30"
                    : "bg-red-900/20 border-red-900/30 text-red-400"
                }`}
              >
                {isVideoEnabled ? <Video /> : <VideoOff />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={toggleAudio}
                disabled={!publisherRef.current || !devices.hasAudio}
                className={`rounded-full p-4 h-14 w-14 ${
                  isAudioEnabled
                    ? "border-emerald-900/30"
                    : "bg-red-900/20 border-red-900/30 text-red-400"
                }`}
              >
                {isAudioEnabled ? <Mic /> : <MicOff />}
              </Button>

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

                {/* CHAT */}
                <SheetContent
                  side="right"
                  className="w-96 flex flex-col h-full bg-gradient-to-b from-emerald-950 to-emerald-900 text-white"
                >
                  <SheetHeader className="border-b border-emerald-800 pb-2">
                    <SheetTitle className="text-emerald-300 text-lg">
                      Chat da Consulta
                    </SheetTitle>
                    <SheetClose />
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-emerald-800/40 scrollbar-track-transparent">
                    {messages.map((msg) => {
                      const isMe = currentUser && msg.senderId === currentUser.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`relative max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md ${
                              isMe
                                ? "bg-emerald-600 text-white rounded-br-none"
                                : "bg-emerald-800/40 text-emerald-50 rounded-bl-none"
                            }`}
                          >
                            {msg.content && <p>{msg.content}</p>}

                            {msg.files && msg.files.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {msg.files.map((file) => {
                                  if (file.mimetype.startsWith("image/")) {
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
                                  } else if (file.mimetype.startsWith("video/")) {
                                    return (
                                      <video
                                        key={file.id}
                                        src={file.url}
                                        controls
                                        className="w-48 rounded-md border border-emerald-800"
                                      />
                                    );
                                  } else {
                                    return (
                                      <a
                                        key={file.id}
                                        href={`${file.url}?fl_attachment`}
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
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-3 border-t border-emerald-800 bg-emerald-950/60 flex flex-col space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newMessageFiles.map((file, index) => (
                        <div key={index} className="relative w-16 h-16">
                          <img
                            src={previews[index]}
                            alt={file.name}
                            className="h-16 w-16 object-cover rounded-md border border-emerald-800"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewMessageFiles((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                              setPreviews((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2 items-center">
                      <input
                        type="text"
                        placeholder="Digite uma mensagem..."
                        className="flex-1 bg-emerald-900/40 border border-emerald-800 rounded-full px-4 py-2 text-sm text-white placeholder-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 h-10"
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
                        className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center transition-all"
                      >
                        <Paperclip size={18} />
                      </label>

                      <Button
                        onClick={handleSendMessage}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 rounded-full h-10 px-4"
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                variant="destructive"
                size="lg"
                onClick={endCall}
                className="rounded-full p-4 h-14 w-14"
              >
                <PhoneOff />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

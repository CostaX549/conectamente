'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageCircle, // ícone do chat
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function VideoCall({ sessionId, token }) {
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const sessionRef = useRef(null);
  const publisherRef = useRef(null);

  const router = useRouter();
  const appId = process.env.NEXT_PUBLIC_VONAGE_APPLICATION_ID;

  // --- Script load / Session init (mesmo do seu código) ---
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
      toast.error("Parâmetros obrigatórios da chamada de vídeo ausentes");
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
          (error) => error && toast.error("Erro ao conectar ao stream do outro participante")
        );
      });

      sessionRef.current.on("sessionConnected", () => {
        setIsConnected(true);
        setIsLoading(false);
        publisherRef.current = window.OT.initPublisher(
          "publisher",
          { insertMode: "replace", width: "100%", height: "100%", publishAudio: isAudioEnabled, publishVideo: isVideoEnabled },
          (error) => error && toast.error("Erro ao inicializar sua câmera e microfone")
        );
      });

      sessionRef.current.on("sessionDisconnected", () => setIsConnected(false));

      sessionRef.current.connect(token, (error) => {
        if (!error && publisherRef.current) {
          sessionRef.current.publish(publisherRef.current, (error) => {
            if (error) toast.error("Erro ao publicar seu stream");
          });
        }
      });
    } catch {
      toast.error("Falha ao inicializar chamada de vídeo");
      setIsLoading(false);
    }
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

  useEffect(() => {
    return () => {
      publisherRef.current?.destroy();
      sessionRef.current?.disconnect();
    };
  }, []);

  // --- Render ---
  return (
    <>
      <Script
        src="https://unpkg.com/@vonage/client-sdk-video@latest/dist/js/opentok.js"
        onLoad={handleScriptLoad}
        onError={() => { toast.error("Falha ao carregar script da chamada de vídeo"); setIsLoading(false); }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Consulta por Vídeo</h1>
          <p className="text-muted-foreground">
            {isConnected ? "Conectado" : isLoading ? "Conectando..." : "Falha na conexão"}
          </p>
        </div>

        {isLoading && !scriptLoaded ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
            <p className="text-white text-lg">Carregando componentes da chamada de vídeo...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Publisher */}
              <div className="border border-emerald-900/20 rounded-lg overflow-hidden">
                <div className="bg-emerald-900/10 px-3 py-2 text-emerald-400 text-sm font-medium">Você</div>
                <div id="publisher" className="w-full h-[300px] md:h-[400px] bg-muted/30">
                  {!scriptLoaded && (
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
                <div className="bg-emerald-900/10 px-3 py-2 text-emerald-400 text-sm font-medium">Outro Participante</div>
                <div id="subscriber" className="w-full h-[300px] md:h-[400px] bg-muted/30">
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

            {/* Video controls + Chat */}
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={toggleVideo}
                className={`rounded-full p-4 h-14 w-14 ${isVideoEnabled ? "border-emerald-900/30" : "bg-red-900/20 border-red-900/30 text-red-400"}`}
                disabled={!publisherRef.current}
              >
                {isVideoEnabled ? <Video /> : <VideoOff />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={toggleAudio}
                className={`rounded-full p-4 h-14 w-14 ${isAudioEnabled ? "border-emerald-900/30" : "bg-red-900/20 border-red-900/30 text-red-400"}`}
                disabled={!publisherRef.current}
              >
                {isAudioEnabled ? <Mic /> : <MicOff />}
              </Button>

              {/* Chat button usando Sheet */}
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
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Chat</SheetTitle>
                    <SheetClose />
                  </SheetHeader>
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      <p className="bg-emerald-900/20 p-2 rounded">Olá! Esta é uma mensagem de exemplo.</p>
                      <p className="bg-muted/20 p-2 rounded self-end">Oi, tudo bem?</p>
                    </div>
                    <div className="p-2 border-t">
                      <input
                        type="text"
                        placeholder="Digite uma mensagem..."
                        className="w-full border rounded p-2"
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                variant="destructive"
                size="lg"
                onClick={endCall}
                className="rounded-full p-4 h-14 w-14 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                {isVideoEnabled ? "Câmera ligada" : "Câmera desligada"} •
                {isAudioEnabled ? " Microfone ligado" : " Microfone desligado"}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Quando terminar sua consulta, clique no botão vermelho para encerrar a chamada
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

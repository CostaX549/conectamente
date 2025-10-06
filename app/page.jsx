import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Stethoscope } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { creditBenefits, features, testimonials } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Pricing from "@/components/pricing";

export default function Home() {
  return (
    <main className="bg-background text-white overflow-hidden">

      {/* HERO - layout de dois blocos diagonais */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-background to-emerald-950 opacity-90" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-600/30 blur-3xl rounded-full" />
        <div className="container relative z-10 mx-auto px-6 flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              ConectaMente <br/> <span className="text-emerald-400">Terapia sem barreiras</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto lg:mx-0">
              Psicólogos disponíveis 24h — atendimento humanizado, online e confidencial.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/onboarding">
                  Começar <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-emerald-800/40 hover:bg-emerald-900/30"
                asChild
              >
                <Link href="/doctors">Ver psicólogos</Link>
              </Button>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="absolute -inset-6 bg-emerald-900/30 rounded-3xl rotate-3 blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/40">
              <Image
                src="/terapia-online-videochamada.jpg"
                alt="Sessão de terapia online"
                width={700}
                height={500}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO DE FEATURES ALTERNADO */}
      <section className="py-32 bg-gradient-to-b from-background to-emerald-950/20">
        <div className="container mx-auto px-6 space-y-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-16 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="lg:w-1/2 space-y-4">
                <Badge className="bg-emerald-900/40 border-emerald-700/30 text-emerald-400">
                  Etapa {index + 1}
                </Badge>
                <h2 className="text-4xl font-bold">{feature.title}</h2>
                <p className="text-muted-foreground text-lg">{feature.description}</p>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-2xl p-10 flex justify-center items-center h-[280px]">
                  {feature.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING + BENEFÍCIOS */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/60 to-background" />
        <div className="container relative z-10 mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Nossos planos de <span className="text-emerald-400">terapia</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pague por consulta ou adquira créditos para mais flexibilidade.
            </p>
          </div>

          <Pricing />

          <div className="mt-20 grid md:grid-cols-2 gap-12">
            <div className="bg-muted/20 p-10 rounded-2xl border border-emerald-900/30">
              <h3 className="flex items-center text-xl font-semibold mb-6">
                <Stethoscope className="mr-3 text-emerald-400" /> Benefícios do sistema de créditos
              </h3>
              <ul className="space-y-3">
                {creditBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1 bg-emerald-900/30 p-1 rounded-full">
                      <Check className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p
                      className="text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: benefit }}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl overflow-hidden">
              <Image
                src="/psicologo2.jpg"
                alt="Sessão de vídeo chamada"
                width={600}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TESTEMUNHOS - formato carrossel */}
      <section className="py-32 bg-emerald-950/30 backdrop-blur-md">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">O que nossos pacientes dizem</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-background/70 border-emerald-800/30 shadow-lg p-6 w-full md:w-1/3"
              >
                <CardContent>
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-900/40 flex items-center justify-center mb-3">
                      <span className="text-emerald-400 font-bold">{testimonial.initials}</span>
                    </div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <p className="text-muted-foreground text-center">“{testimonial.quote}”</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL - estilo glassmorphism */}
      <section className="relative py-28">
        <div className="absolute inset-0 bg-[url('/terapia-online-videochamada.jpg')] bg-cover bg-center opacity-20" />
        <div className="container relative mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto bg-background/70 backdrop-blur-md border border-emerald-800/30 rounded-3xl p-10">
            <h2 className="text-4xl font-bold mb-4">Precisa de suporte?</h2>
            <p className="text-muted-foreground mb-8">
              Nossa equipe de atendimento está disponível para te ajudar a qualquer momento.
            </p>
            <Button
              size="lg"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              asChild
            >
              <Link
                href="https://wa.me/5512991789979"
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar no WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

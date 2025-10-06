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
    <div className="bg-background text-white">
      {/* Hero */}
      <section className="relative py-24 md:py-40 bg-gradient-to-b from-emerald-950/70 to-background">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-emerald-900/50 border-emerald-800/40 text-emerald-400 text-sm px-3 py-1">
              Psicologia Digital
            </Badge>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Encontre seu <span className="text-emerald-400">psicólogo</span> ideal <br />
              com apenas alguns cliques
            </h1>

            <p className="text-muted-foreground text-lg max-w-lg">
              Uma plataforma feita para conectar você com profissionais da saúde mental — de forma rápida, segura e acessível.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/onboarding">
                  Começar agora <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-emerald-700/40 hover:bg-muted/70">
                <Link href="/doctors">Explorar profissionais</Link>
              </Button>
            </div>
          </div>

          <div className="relative h-[380px] md:h-[520px] rounded-2xl overflow-hidden shadow-xl shadow-emerald-900/30">
            <Image
              src="/banner2.png"
              alt="Atendimento psicológico online"
              fill
              priority
              className="object-cover rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-3">Como funciona</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simples, rápido e feito para você cuidar da sua saúde emocional
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-background/70 border border-emerald-900/20 hover:border-emerald-800/40 hover:bg-emerald-900/10 transition-all duration-300"
              >
                <CardHeader>
                  <div className="bg-emerald-900/30 p-3 rounded-lg w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-900/30 border-emerald-800/40 text-emerald-400 mb-3">
              Planos e Créditos
            </Badge>
            <h2 className="text-4xl font-bold mb-3">Escolha seu plano ideal</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nossos pacotes se adaptam às suas necessidades — sem complicações.
            </p>
          </div>

          <Pricing />

          <Card className="mt-16 bg-muted/10 border-emerald-900/30">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Stethoscope className="mr-2 text-emerald-400" /> Sistema de Créditos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {creditBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1 bg-emerald-900/20 p-1 rounded-full">
                      <Check className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p
                      className="text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: benefit }}
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-900/40 border-emerald-800/40 text-emerald-400 mb-3">
              Depoimentos
            </Badge>
            <h2 className="text-4xl font-bold mb-3">O que dizem nossos usuários</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experiências reais de pacientes e psicólogos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-background/70 border border-emerald-900/20 hover:border-emerald-700/40 transition-all duration-300"
              >
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-900/30 flex items-center justify-center mr-4">
                      <span className="text-emerald-400 font-bold">{testimonial.initials}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    “{testimonial.quote}”
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-emerald-950/40 to-emerald-900/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Precisa de ajuda?</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Fale diretamente com nossa equipe via WhatsApp. Estamos aqui para ajudar você a cuidar da mente.
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
              Fale Conosco
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

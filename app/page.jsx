import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, Stethoscope } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { creditBenefits, features, testimonials } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Pricing from "@/components/pricing";

export default function Home() {
  return (
    <div className="bg-background">
      <section className="relative overflow-hidden py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="bg-emerald-900/30 border-emerald-700/30 px-4 py-2 text-emerald-400 text-sm font-medium">Facilitando a saúde</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">Conecte com psicólogos <br /> <span className="gradient-title">A qualquer hora e a qualquer momento</span></h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-md">
                Agende consultas, faça atendimentos por vídeo e gerencie sua jornada de saúde em uma única plataforma segura.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <Link href={'/onboarding'}>
                    Começar <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-emerald-700/30 hover:bg-muted/80">
                  <Link href={'/doctors'}>
                    Encontre psicólogos
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[600px] rounded-xl overflow-hidden">
              <Image src="/banner2.png" alt="Consulta com psicólogo" fill priority className="object-cover md:pt-14 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Entenda como funciona</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Nossa plataforma torna o acesso à saúde possível com apenas alguns cliques
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              return (
                <Card key={index} className="border-emerald-900/20 hover:border-emerald-800/40 transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="bg-emerald-900/20 p-3 rounded-lg w-fit mb-4">{feature.icon}</div>
                    <CardTitle className="text-xl font-semibold text-white">{feature.title}</CardTitle>

                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>

                </Card>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4">Saúde acessível</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pacotes de consultas</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Escolha o pacote de consultas perfeito que atenda às suas necessidades de saúde
            </p>
          </div>
          <div>
            {/* Pricing Table */}
            <Pricing />
            <Card className="mt-12 bg-muted/20 border-emerald-900/30">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2 text-emerald-400" />
                  Como funciona o nosso sistema de créditos
                  </CardTitle>

              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                {creditBenefits.map((benefit,index) => {
                 return (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1 bg-emerald-900/20 p-1 rounded-full">
                      <Check className="h-4 w-4 text-emerald-400" />
                     
                    </div>
                     <p 
                      className="text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: benefit }}
                      />
                  </li>
                 )
                })}
                </ul>
              </CardContent>

            </Card>
          </div>
        </div>

      </section>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
             <Badge  variant="outline" className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4">Histórias de sucesso</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">O que nossos usuários dizem</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ouça pacientes e médicos que usam nossa plataforma
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => {
              return (
                <Card key={index} className="border-emerald-900/20 hover:border-emerald-800/40 transition-all duration-300">
                  
                  <CardContent>
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-900/20 flex items-center justify-center mr-4"><span className="text-emerald-400 font-bold">{testimonial.initials}</span></div>
                        <div>
                          <h4 className="font-semibold text-white">{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        &quot;{testimonial.quote}&quot;
                      </p>
                  </CardContent>

                </Card>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20">
        <div className="container mx-auto px-4">
         
      
  
                <Card  className="bg-gradient-to-r from-emerald-900/30 to-emerald-950/20 border-emerald-800/20">
                  
                  <CardContent className="p-8 md:p-12 lg:p-16 relative overflow-hidden">
                       <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                          Pronto para assumir o controle da sua saúde?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                          Junte-se a milhares de usuários que simplificaram sua jornada de saúde com nossa plataforma. Comece hoje e experimente a saúde do jeito que deveria ser.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                          size="lg"
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                           asChild
                           >
                            <Link href="/sign-up">Cadastre-se agora</Link>
                          </Button>
                            <Button
                            variant="outline"
                          size="lg"
                          className="border-emerald-700/30 hover:bg-muted/80"
                           asChild
                           >
                            <Link href="/pricing">Ver preços</Link>
                          </Button>
                        </div>
                       </div>
                  </CardContent>

                </Card>
             
      
        </div>
      </section>
    </div>

  );
}

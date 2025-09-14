import { ClipboardCheck, AlertCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";

export default async function VerificationPage() {
  // Obter perfil completo do usuário
  const user = await getCurrentUser();

  // Se já estiver verificado, redirecionar para o dashboard
  if (user?.verificationStatus === "VERIFIED") {
    redirect("/doctor");
  }

  const isRejected = user?.verificationStatus === "REJECTED";

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card className="border-emerald-900/20">
          <CardHeader className="text-center">
            <div
              className={`mx-auto p-4 ${
                isRejected ? "bg-red-900/20" : "bg-amber-900/20"
              } rounded-full mb-4 w-fit`}
            >
              {isRejected ? (
                <XCircle className="h-8 w-8 text-red-400" />
              ) : (
                <ClipboardCheck className="h-8 w-8 text-amber-400" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {isRejected
                ? "Verificação Rejeitada"
                : "Verificação em Andamento"}
            </CardTitle>
            <CardDescription className="text-lg">
              {isRejected
                ? "Infelizmente, sua inscrição precisa de revisão"
                : "Obrigado por enviar suas informações"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {isRejected ? (
              <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-4 mb-6 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-muted-foreground text-left">
                  <p className="mb-2">
                    Nossa equipe administrativa analisou sua inscrição e
                    constatou que ela não atende aos nossos requisitos atuais.
                    Razões comuns para rejeição incluem:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    <li>Documentação de credenciais insuficiente ou pouco clara</li>
                    <li>Requisitos de experiência profissional não atendidos</li>
                    <li>Descrição dos serviços incompleta ou vaga</li>
                  </ul>
                  <p>
                    Você pode atualizar sua inscrição com mais informações e
                    reenviar para revisão.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-900/10 border border-amber-900/20 rounded-lg p-4 mb-6 flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground text-left">
                  Seu perfil está atualmente em análise pela nossa equipe
                  administrativa. Esse processo geralmente leva de 1 a 2 dias
                  úteis. Você receberá uma notificação por e-mail assim que
                  sua conta for verificada.
                </p>
              </div>
            )}

            <p className="text-muted-foreground mb-6">
              {isRejected
                ? "Você pode atualizar seu perfil de médico e reenviar para verificação."
                : "Enquanto aguarda, você pode se familiarizar com nossa plataforma ou entrar em contato com nossa equipe de suporte caso tenha dúvidas."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isRejected ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="border-emerald-900/30"
                  >
                    <Link href="/">Voltar para a Página Inicial</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Link href="/doctor/update-profile">Atualizar Perfil</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="border-emerald-900/30"
                  >
                    <Link href="/">Voltar para a Página Inicial</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Link href="/contact-support">Contatar Suporte</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

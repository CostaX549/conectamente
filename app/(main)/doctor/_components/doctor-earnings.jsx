"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Calendar,
  BarChart3,
  CreditCard,
  Loader2,
  AlertCircle,
  Coins,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { requestPayout } from "@/actions/payout";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

export function DoctorEarnings({ earnings, payouts = [] }) {
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");

  const {
    thisMonthEarnings = 0,
    completedAppointments = 0,
    averageEarningsPerMonth = 0,
    availableCredits = 0,
    availablePayout = 0,
  } = earnings;

  const { loading, data, fn: submitPayoutRequest } = useFetch(requestPayout);

  const pendingPayout = payouts.find(
    (payout) => payout.status === "PROCESSING"
  );

  const handlePayoutRequest = async (e) => {
    e.preventDefault();

    if (!paypalEmail) {
      toast.error("O email do PayPal é obrigatório");
      return;
    }

    const formData = new FormData();
    formData.append("paypalEmail", paypalEmail);

    await submitPayoutRequest(formData);
  };

  useEffect(() => {
    if (data?.success) {
      setShowPayoutDialog(false);
      setPaypalEmail("");
      toast.success("Solicitação de saque enviada com sucesso!");
    }
  }, [data]);

  const platformFee = availableCredits * 2; // $2 por crédito

  return (
    <div className="space-y-6">
      {/* Visão Geral dos Ganhos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Créditos Disponíveis
                </p>
                <p className="text-3xl font-bold text-white">
                  {availableCredits}
                </p>
                <p className="text-xs text-muted-foreground">
                  ${availablePayout.toFixed(2)} disponíveis para saque
                </p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <Coins className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-3xl font-bold text-white">
                  ${thisMonthEarnings.toFixed(2)}
                </p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Consultas Concluídas
                </p>
                <p className="text-3xl font-bold text-white">
                  {completedAppointments}
                </p>
                <p className="text-xs text-muted-foreground">concluídas</p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média/Mês</p>
                <p className="text-3xl font-bold text-white">
                  ${averageEarningsPerMonth.toFixed(2)}
                </p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Saque */}
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-emerald-400" />
            Gerenciamento de Saques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Atual do Saque */}
          <div className="bg-muted/20 p-4 rounded-lg border border-emerald-900/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-white">
                Disponível para Saque
              </h3>
              {pendingPayout ? (
                <Badge
                  variant="outline"
                  className="bg-amber-900/20 border-amber-900/30 text-amber-400"
                >
                  EM PROCESSAMENTO
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                >
                  DISPONÍVEL
                </Badge>
              )}
            </div>

            {pendingPayout ? (
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Créditos Pendentes</p>
                    <p className="text-white font-medium">
                      {pendingPayout.credits}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor Pendente</p>
                    <p className="text-white font-medium">
                      ${pendingPayout.netAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email do PayPal</p>
                    <p className="text-white font-medium text-xs">
                      {pendingPayout.paypalEmail}
                    </p>
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Sua solicitação de saque está sendo processada. Você receberá
                    o pagamento após aprovação do administrador. Seus créditos
                    serão deduzidos após o processamento.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Créditos Disponíveis</p>
                  <p className="text-white font-medium">{availableCredits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valor para Saque</p>
                  <p className="text-white font-medium">
                    ${availablePayout.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taxa da Plataforma</p>
                  <p className="text-white font-medium">
                    ${platformFee.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {!pendingPayout && availableCredits > 0 && (
              <Button
                onClick={() => setShowPayoutDialog(true)}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
              >
                Solicitar Saque de Todos os Créditos
              </Button>
            )}

            {availableCredits === 0 && !pendingPayout && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Nenhum crédito disponível para saque. Conclua mais consultas
                  para ganhar créditos.
                </p>
              </div>
            )}
          </div>

          {/* Informações do Saque */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Estrutura de Saque:</strong> Você ganha $8 por crédito.
              A taxa da plataforma é $2 por crédito. Os saques incluem todos
              os créditos disponíveis e são processados via PayPal.
            </AlertDescription>
          </Alert>

          {/* Histórico de Saques */}
          {payouts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">Histórico de Saques</h3>
              <div className="space-y-2">
                {payouts.slice(0, 5).map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/10 border border-emerald-900/10"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {format(new Date(payout.createdAt), "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payout.credits} créditos • ${payout.netAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payout.paypalEmail}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        payout.status === "PROCESSED"
                          ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                          : "bg-amber-900/20 border-amber-900/30 text-amber-400"
                      }
                    >
                      {payout.status === "PROCESSED" ? "PROCESSADO" : "EM PROCESSAMENTO"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Solicitação de Saque */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Solicitar Saque
            </DialogTitle>
            <DialogDescription>
              Solicitar saque de todos os seus créditos disponíveis
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePayoutRequest} className="space-y-4">
            <div className="bg-muted/20 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Créditos disponíveis:
                </span>
                <span className="text-white">{availableCredits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor bruto:</span>
                <span className="text-white">
                  ${(availableCredits * 10).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Taxa da plataforma (20%):
                </span>
                <span className="text-white">-${platformFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-emerald-900/20 pt-2 flex justify-between font-medium">
                <span className="text-white">Valor líquido:</span>
                <span className="text-emerald-400">
                  ${availablePayout.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paypalEmail">Email do PayPal</Label>
              <Input
                id="paypalEmail"
                type="email"
                placeholder="seu-email@paypal.com"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="bg-background border-emerald-900/20"
                required
              />
              <p className="text-sm text-muted-foreground">
                Insira o email do PayPal onde deseja receber o saque.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Após o processamento pelo administrador, {availableCredits} créditos
                serão deduzidos da sua conta e ${availablePayout.toFixed(2)} serão
                enviados para seu PayPal.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPayoutDialog(false)}
                disabled={loading}
                className="border-emerald-900/30"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Solicitando...
                  </>
                ) : (
                  "Solicitar Saque"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

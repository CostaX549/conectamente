"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  User,
  DollarSign,
  Mail,
  Stethoscope,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { approvePayout } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

export function PendingPayouts({ payouts }) {
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  const { loading, data, fn: submitApproval } = useFetch(approvePayout);

  const handleViewDetails = (payout) => {
    setSelectedPayout(payout);
  };

  const handleApprovePayout = (payout) => {
    setSelectedPayout(payout);
    setShowApproveDialog(true);
  };

  const confirmApproval = async () => {
    if (!selectedPayout || loading) return;

    const formData = new FormData();
    formData.append("payoutId", selectedPayout.id);

    await submitApproval(formData);
  };

  useEffect(() => {
    if (data?.success) {
      setShowApproveDialog(false);
      setSelectedPayout(null);
      toast.success("Pagamento aprovado com sucesso!");
    }
  }, [data]);

  const closeDialogs = () => {
    setSelectedPayout(null);
    setShowApproveDialog(false);
  };

  return (
    <div>
      <Card className="bg-muted/20 border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Pagamentos Pendentes
          </CardTitle>
          <CardDescription>
            Revise e aprove solicitações de pagamento dos médicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação de pagamento pendente no momento.
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <Card
                  key={payout.id}
                  className="bg-background border-emerald-900/20 hover:border-emerald-700/30 transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-muted/20 rounded-full p-2 mt-1">
                          <User className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">
                            Dr. {payout.doctor.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {payout.doctor.specialty}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-emerald-400" />
                              <span>
                                {payout.credits} créditos • $
                                {payout.netAmount.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1 text-emerald-400" />
                              <span className="text-xs">
                                {payout.paypalEmail}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Solicitado em{" "}
                            {format(
                              new Date(payout.createdAt),
                              "dd/MM/yyyy 'às' HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 self-end lg:self-center">
                        <Badge
                          variant="outline"
                          className="bg-amber-900/20 border-amber-900/30 text-amber-400 w-fit"
                        >
                          Pendente
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(payout)}
                            className="border-emerald-900/30 hover:bg-muted/80"
                          >
                            Ver Detalhes
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprovePayout(payout)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalhes do Pagamento */}
      {selectedPayout && !showApproveDialog && (
        <Dialog open={!!selectedPayout} onOpenChange={closeDialogs}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Detalhes da Solicitação de Pagamento
              </DialogTitle>
              <DialogDescription>
                Revise as informações da solicitação de pagamento
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Informações do Médico */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-white font-medium">Informações do Médico</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Nome
                    </p>
                    <p className="text-white">
                      Dr. {selectedPayout.doctor.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="text-white">{selectedPayout.doctor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Especialidade
                    </p>
                    <p className="text-white">
                      {selectedPayout.doctor.specialty}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Créditos Atuais
                    </p>
                    <p className="text-white">
                      {selectedPayout.doctor.credits}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações do Pagamento */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-white font-medium">Detalhes do Pagamento</h3>
                </div>
                <div className="bg-muted/20 p-4 rounded-lg border border-emerald-900/20 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Créditos a pagar:
                    </span>
                    <span className="text-white font-medium">
                      {selectedPayout.credits}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Valor bruto (10 BRL/crédito):
                    </span>
                    <span className="text-white">
                      ${selectedPayout.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Taxa da plataforma (2 BRL/crédito):
                    </span>
                    <span className="text-white">
                      -${selectedPayout.platformFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-emerald-900/20 pt-3 flex justify-between font-medium">
                    <span className="text-white">Pagamento líquido:</span>
                    <span className="text-emerald-400">
                      R${selectedPayout.netAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-emerald-900/20 pt-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Email do PayPal
                    </p>
                    <p className="text-white">{selectedPayout.paypalEmail}</p>
                  </div>
                </div>
              </div>

              {/* Alerta se créditos insuficientes */}
              {selectedPayout.doctor.credits < selectedPayout.credits && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Atenção: O médico possui apenas {selectedPayout.doctor.credits} créditos,
                    mas este pagamento exige {selectedPayout.credits} créditos. O pagamento não pode ser processado.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeDialogs}
                className="border-emerald-900/30"
              >
                Fechar
              </Button>
              <Button
                onClick={() => handleApprovePayout(selectedPayout)}
                disabled={selectedPayout.doctor.credits < selectedPayout.credits}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Aprovar Pagamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmação de Aprovação */}
      {showApproveDialog && selectedPayout && (
        <Dialog
          open={showApproveDialog}
          onOpenChange={() => setShowApproveDialog(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Confirmar Aprovação do Pagamento
              </DialogTitle>
              <DialogDescription>
                Tem certeza de que deseja aprovar este pagamento?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta ação irá:
                  <ul className="mt-2 space-y-1 list-disc pl-4">
                    <li>
                      Deduzir {selectedPayout.credits} créditos da conta do Dr. {selectedPayout.doctor.name}
                    </li>
                    <li>Marcar o pagamento como PROCESSADO</li>
                    <li>Esta ação não pode ser desfeita</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-muted/20 p-4 rounded-lg border border-emerald-900/20">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Médico:</span>
                  <span className="text-white">Dr. {selectedPayout.doctor.name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Valor a pagar:</span>
                  <span className="text-emerald-400 font-medium">
                    ${selectedPayout.netAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PayPal:</span>
                  <span className="text-white text-sm">{selectedPayout.paypalEmail}</span>
                </div>
              </div>
            </div>

            {loading && <BarLoader width={"100%"} color="#36d7b7" />}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                disabled={loading}
                className="border-emerald-900/30"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmApproval}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirmar Aprovação
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

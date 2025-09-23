import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Calendar, User, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ApprovalHistoryPage() {
  const { user, permissions } = useAuth();

  const { data: approvalHistory = [], isLoading } = useQuery({
    queryKey: ["/api/approval-history"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-corporate mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando histórico...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Histórico de Aprovações
          </h1>
          <p className="text-gray-600">
            Registro cronológico de todas as decisões de repasse de custos
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Decisões</p>
                  <p className="text-2xl font-bold text-gray-900">{approvalHistory.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovações</p>
                  <p className="text-2xl font-bold text-green-600">
                    {approvalHistory.filter(h => h.status === "aprovado").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejeições</p>
                  <p className="text-2xl font-bold text-red-600">
                    {approvalHistory.filter(h => h.status === "rejeitado").length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico Cronológico
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvalHistory.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum histórico encontrado
                </h3>
                <p className="text-gray-600">
                  Quando aprovações ou rejeições forem processadas, elas aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Data/Hora
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Insumo
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Produtos Afetados
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Valor Anterior
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Valor Novo
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Variação
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Aprovado por
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvalHistory.map((item) => {
                      const valorAnterior = parseFloat(item.valorAnterior);
                      const valorNovo = parseFloat(item.valorNovo);
                      const variacao = ((valorNovo - valorAnterior) / valorAnterior) * 100;
                      const isIncrease = variacao > 0;

                      return (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {format(new Date(item.approvedAt || item.rejectedAt), "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                              <div className="text-gray-600">
                                {format(new Date(item.approvedAt || item.rejectedAt), "HH:mm", { locale: ptBR })}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">
                              {item.insumoName}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {item.affectedProducts?.map((product: any, index: number) => (
                                <span key={product.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                  {product.name}
                                </span>
                              )) || (
                                <span className="text-sm text-gray-500">Nenhum produto encontrado</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-sm">
                              R$ {valorAnterior.toFixed(2)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono text-sm">
                              R$ {valorNovo.toFixed(2)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`flex items-center gap-1 text-sm font-medium ${
                              isIncrease ? "text-red-600" : "text-green-600"
                            }`}>
                              {isIncrease ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {isIncrease ? "+" : ""}{variacao.toFixed(1)}%
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={item.status === "aprovado" ? "default" : "destructive"}
                              className={
                                item.status === "aprovado"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }
                            >
                              {item.status === "aprovado" ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {item.status === "aprovado" ? "Aprovado" : "Rejeitado"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900">
                                {item.approverName || "Sistema"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
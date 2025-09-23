import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Check, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  User,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PendenciaRepasse {
  id: number;
  insumoId: number;
  productId: number;
  valorAnterior: number;
  valorNovo: number;
  percentualVariacao: number;
  status: string;
  userId: number;
  createdAt: string;
  insumoName: string;
  insumoCode: string;
  affectedProducts: Array<{
    id: number;
    name: string;
    code: string;
  }>;
  userName: string;
}

interface RealPendenciasProps {
  userCanApprove: boolean;
}

export default function RealPendencias({ userCanApprove }: RealPendenciasProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendencias = [], isLoading } = useQuery<PendenciaRepasse[]>({
    queryKey: ["/api/pendencias-repasse"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/pendencias-repasse/${id}/approve`, {});
    },
    onSuccess: () => {
      toast({ title: "Pendência aprovada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/pendencias-repasse"] });
      queryClient.invalidateQueries({ queryKey: ["/api/approval-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/changes"] });
    },
    onError: () => {
      toast({ title: "Erro ao aprovar pendência", variant: "destructive" });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/pendencias-repasse/${id}/reject`, {});
    },
    onSuccess: () => {
      toast({ title: "Pendência rejeitada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/pendencias-repasse"] });
      queryClient.invalidateQueries({ queryKey: ["/api/approval-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/changes"] });
    },
    onError: () => {
      toast({ title: "Erro ao rejeitar pendência", variant: "destructive" });
    }
  });

  const getCriticidade = (percentualVariacao: number) => {
    const absVariacao = Math.abs(percentualVariacao);
    if (absVariacao >= 15) return { level: 'alta', color: 'border-red-500 bg-red-50' };
    if (absVariacao >= 8) return { level: 'media', color: 'border-amber-500 bg-amber-50' };
    return { level: 'baixa', color: 'border-blue-500 bg-blue-50' };
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pendências de Repasse de Custos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando pendências...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mb-6 transition-all duration-300 ${
      pendencias.length > 0 ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg' : 'hover:shadow-md'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {pendencias.length > 0 && <AlertTriangle className="h-5 w-5 text-amber-600" />}
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pendências de Repasse de Custos
            </span>
          </div>
          {pendencias.length > 0 && (
            <div className="flex gap-2">
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                {pendencias.length} pendente{pendencias.length > 1 ? 's' : ''}
              </Badge>
              {pendencias.filter((p) => Math.abs(p.percentualVariacao) >= 15).length > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {pendencias.filter((p) => Math.abs(p.percentualVariacao) >= 15).length} crítica{pendencias.filter((p) => Math.abs(p.percentualVariacao) >= 15).length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </CardTitle>
        {pendencias.length > 0 && (
          <div className="bg-amber-100 border border-amber-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ Atenção: {pendencias.length} alteração{pendencias.length > 1 ? 'ões' : ''} de custo aguardando aprovação
            </p>
            <p className="text-xs text-amber-700 mt-1">
              O sistema detectou mudanças nos custos de insumos. Analise o impacto antes de aprovar.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {pendencias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Tudo atualizado!</h3>
            <p className="text-sm">Nenhuma pendência de repasse encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendencias.map((pendencia) => {
              const criticidade = getCriticidade(pendencia.percentualVariacao);
              const isIncrease = pendencia.percentualVariacao > 0;
              
              return (
                <div
                  key={`${pendencia.id}-${pendencia.insumoId}-${pendencia.productId}`}
                  className={`group border rounded-xl p-5 transition-all duration-300 hover:shadow-lg border-l-4 ${criticidade.color}`}
                >
                  {/* Header with insumo info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {pendencia.insumoName}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {pendencia.insumoCode}
                        </Badge>
                      </div>
                      
                      {/* Price comparison */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Anterior:</span>
                          <span className="font-mono text-sm font-medium">
                            R$ {pendencia.valorAnterior.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Novo:</span>
                          <span className="font-mono text-sm font-medium">
                            R$ {pendencia.valorNovo.toFixed(2)}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                          isIncrease ? "text-red-600" : "text-green-600"
                        }`}>
                          {isIncrease ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {isIncrease ? "+" : ""}{pendencia.percentualVariacao.toFixed(1)}%
                        </div>
                      </div>
                      
                      {/* Affected products */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">
                          Produtos impactados ({pendencia.affectedProducts.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {pendencia.affectedProducts.map((product) => (
                            <Badge key={product.id} variant="secondary" className="text-xs">
                              {product.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Variação detectada em: {format(new Date(pendencia.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Criticality badge */}
                    <Badge 
                      variant={criticidade.level === 'alta' ? 'destructive' : criticidade.level === 'media' ? 'secondary' : 'default'}
                      className="ml-4"
                    >
                      {criticidade.level === 'alta' ? 'Alto Risco' : criticidade.level === 'media' ? 'Médio Risco' : 'Baixo Risco'}
                    </Badge>
                  </div>
                  
                  {/* Action buttons */}
                  {userCanApprove && (
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectMutation.mutate(pendencia.id)}
                        disabled={rejectMutation.isPending}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reprovar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(pendencia.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {criticidade.level === 'alta' ? 'Aprovar (Alto Risco)' : 'Aprovar Repasse'}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";

export default function InsumoVariationsAlert() {
  const { user, permissions } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dismissedVariations, setDismissedVariations] = useState<number[]>([]);
  
  // Don't show alerts for consultation users
  if (user?.userType === 'consulta' || !permissions?.canEdit) {
    return null;
  }

  const { data: variations = [], isLoading } = useQuery({
    queryKey: ["/api/insumo-variations"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (variationId: number) => {
      const response = await apiRequest("POST", `/api/insumo-variations/${variationId}/acknowledge`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insumo-variations"] });
      toast({
        title: "Variação reconhecida",
        description: "A variação foi marcada como reconhecida.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao reconhecer variação.",
        variant: "destructive",
      });
    },
  });

  const handleDismiss = (variationId: number) => {
    setDismissedVariations(prev => [...prev, variationId]);
  };

  const handleAcknowledge = (variationId: number) => {
    acknowledgeMutation.mutate(variationId);
  };

  // Filter out dismissed variations
  const activeVariations = variations.filter(v => !dismissedVariations.includes(v.id));

  if (isLoading || activeVariations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {activeVariations.map((variation) => {
        const isIncrease = variation.percentualVariacao > 0;
        const severity = Math.abs(variation.percentualVariacao) > 10 ? "high" : 
                        Math.abs(variation.percentualVariacao) > 5 ? "medium" : "low";

        return (
          <Alert key={variation.id} className={`border-l-4 ${
            severity === "high" ? "border-l-red-500 bg-red-50" :
            severity === "medium" ? "border-l-yellow-500 bg-yellow-50" :
            "border-l-blue-500 bg-blue-50"
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                  severity === "high" ? "text-red-600" :
                  severity === "medium" ? "text-yellow-600" :
                  "text-blue-600"
                }`} />
                <div className="flex-1">
                  <AlertDescription>
                    <div className="font-medium text-gray-900 mb-2">
                      Variação de Custo Detectada: {variation.insumoName} ({variation.insumoCode})
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          {isIncrease ? (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          )}
                          <span className={`font-medium ${
                            isIncrease ? "text-red-600" : "text-green-600"
                          }`}>
                            {isIncrease ? "+" : ""}{variation.percentualVariacao.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-gray-600">
                          Impacto no preço final: {variation.impactoNoPreco.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          R$ {parseFloat(variation.valorAnterior).toFixed(2)} → 
                          R$ {parseFloat(variation.valorNovo).toFixed(2)}
                        </span>
                        <Badge variant={
                          severity === "high" ? "destructive" :
                          severity === "medium" ? "secondary" : "default"
                        }>
                          {severity === "high" ? "Alto Impacto" :
                           severity === "medium" ? "Médio Impacto" : "Baixo Impacto"}
                        </Badge>
                      </div>
                    </div>
                  </AlertDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcknowledge(variation.id)}
                  disabled={acknowledgeMutation.isPending}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Reconhecer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(variation.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Alert>
        );
      })}
    </div>
  );
}
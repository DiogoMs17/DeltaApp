import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  Calculator,
  DollarSign,
  Target
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-context";

interface InsumoVariation {
  id: number;
  insumoId: number;
  insumoCode: string;
  insumoName: string;
  valorAnterior: number;
  valorNovo: number;
  percentualVariacao: number;
  impactoNoPreco: number;
  affectedProducts: Array<{
    id: number;
    code: string;
    name: string;
    currentPrice: number;
    newPrice: number;
  }>;
  createdAt: string;
  acknowledged: boolean;
}

interface DecisionForm {
  decision: 'maintain_margin' | 'maintain_price';
  newMargin?: number;
  newPrice?: number;
}

export default function InsumoVariationsDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedVariation, setSelectedVariation] = useState<InsumoVariation | null>(null);
  const [decisionForm, setDecisionForm] = useState<DecisionForm>({ decision: 'maintain_margin' });

  const { data: variations = [], isLoading } = useQuery({
    queryKey: ["/api/insumo-variations"],
    enabled: user?.userType !== 'consulta'
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async ({ variationId, decision }: { variationId: number, decision: DecisionForm }) => {
      const response = await apiRequest("POST", `/api/insumo-variations/${variationId}/acknowledge`, {
        body: JSON.stringify({
          userId: user?.id,
          decision: decision.decision,
          newMargin: decision.newMargin,
          newPrice: decision.newPrice
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insumo-variations"] });
      setSelectedVariation(null);
      setDecisionForm({ decision: 'maintain_margin' });
    }
  });

  const unacknowledgedVariations = variations.filter((v: InsumoVariation) => !v.acknowledged);

  if (user?.userType === 'consulta' || unacknowledgedVariations.length === 0) {
    return null;
  }

  const handleDecision = () => {
    if (selectedVariation) {
      acknowledgeMutation.mutate({
        variationId: selectedVariation.id,
        decision: decisionForm
      });
    }
  };

  return (
    <div className="mb-8">
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-orange-800">
              Variações de Insumos Detectadas
            </CardTitle>
            <Badge variant="destructive">
              {unacknowledgedVariations.length} {unacknowledgedVariations.length === 1 ? 'variação' : 'variações'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 mb-4">
            Foram detectadas alterações nos custos dos insumos. Revise e tome decisões manuais sobre o impacto nos preços.
          </p>
          
          <div className="space-y-3">
            {unacknowledgedVariations.map((variation: InsumoVariation) => (
              <div key={variation.id} className="bg-white rounded-lg p-4 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {variation.percentualVariacao > 0 ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <span className="font-medium text-gray-900">
                          {variation.insumoCode} - {variation.insumoName}
                        </span>
                        <div className="text-sm text-gray-600">
                          Variação: <span className={`font-medium ${variation.percentualVariacao > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {variation.percentualVariacao > 0 ? '+' : ''}{variation.percentualVariacao.toFixed(2)}%
                          </span>
                          {' '}(R$ {variation.valorAnterior.toFixed(4)} → R$ {variation.valorNovo.toFixed(4)})
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Produtos Afetados:</div>
                      <div className="font-medium">{variation.affectedProducts.length}</div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedVariation(variation)}
                        >
                          <Calculator className="h-4 w-4 mr-1" />
                          Decidir
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            Aba de Decisão {variation.insumoCode}
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Variation Summary */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Resumo da Variação</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Insumo:</span>
                                <div className="font-medium">{variation.insumoCode} - {variation.insumoName}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Variação:</span>
                                <div className={`font-medium ${variation.percentualVariacao > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  {variation.percentualVariacao > 0 ? '+' : ''}{variation.percentualVariacao.toFixed(2)}%
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">Valor Anterior:</span>
                                <div className="font-medium">R$ {variation.valorAnterior.toFixed(4)}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Valor Novo:</span>
                                <div className="font-medium">R$ {variation.valorNovo.toFixed(4)}</div>
                              </div>
                            </div>
                          </div>

                          {/* Affected Products */}
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Produtos Afetados ({variation.affectedProducts.length})
                            </h4>
                            <div className="max-h-40 overflow-y-auto space-y-2">
                              {variation.affectedProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <span className="font-medium">{product.code}</span>
                                    <span className="text-gray-600 ml-2">{product.name}</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-600">R$ {product.currentPrice.toFixed(2)} → </span>
                                    <span className="font-medium">R$ {product.newPrice.toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Decision Options */}
                          <div>
                            <h4 className="font-medium mb-3">Opções de Decisão</h4>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="maintain_margin"
                                  name="decision"
                                  value="maintain_margin"
                                  checked={decisionForm.decision === 'maintain_margin'}
                                  onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value as any })}
                                />
                                <label htmlFor="maintain_margin" className="flex items-center gap-2">
                                  <Target className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">Manter a margem líquida e aumentar o preço final</span>
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id="maintain_price"
                                  name="decision"
                                  value="maintain_price"
                                  checked={decisionForm.decision === 'maintain_price'}
                                  onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value as any })}
                                />
                                <label htmlFor="maintain_price" className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">Diminuir a margem líquida e manter o preço</span>
                                </label>
                              </div>
                            </div>

                            {decisionForm.decision === 'maintain_price' && (
                              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <Label htmlFor="newMargin" className="text-sm font-medium">
                                  Nova Margem (%)
                                </Label>
                                <Input
                                  id="newMargin"
                                  type="number"
                                  step="0.1"
                                  placeholder="Ex: 15.5"
                                  value={decisionForm.newMargin || ''}
                                  onChange={(e) => setDecisionForm({ 
                                    ...decisionForm, 
                                    newMargin: parseFloat(e.target.value) || undefined 
                                  })}
                                  className="mt-1"
                                />
                              </div>
                            )}

                            {decisionForm.decision === 'maintain_margin' && (
                              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <Label htmlFor="newPrice" className="text-sm font-medium">
                                  Novo Preço (R$)
                                </Label>
                                <Input
                                  id="newPrice"
                                  type="number"
                                  step="0.01"
                                  placeholder="Ex: 12.50"
                                  value={decisionForm.newPrice || ''}
                                  onChange={(e) => setDecisionForm({ 
                                    ...decisionForm, 
                                    newPrice: parseFloat(e.target.value) || undefined 
                                  })}
                                  className="mt-1"
                                />
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSelectedVariation(null)}>
                              Cancelar
                            </Button>
                            <Button 
                              onClick={handleDecision}
                              disabled={acknowledgeMutation.isPending}
                            >
                              {acknowledgeMutation.isPending ? 'Processando...' : 'Confirmar Decisão'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
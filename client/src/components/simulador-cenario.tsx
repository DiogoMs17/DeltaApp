import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, RefreshCw, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SimuladorCenarioProps {
  productId: number;
  currentConfig?: any;
  userCanEdit?: boolean;
}

interface SimulationConfig {
  acordosContratuais: string;
  contratuaisPercent: string;
  tradeMarketingPercent: string;
  comissoesPercent: string;
  despesasGeraisAdm: string;
  prazoPagamentoDias: number;
  jurosAm: string;
  encargosPercent: string;
  armazenagemPercent: string;
  margemPercent: string;
  icmsPercent: string;
  pisPercent: string;
  cofinsPercent: string;
}

interface SimulationResult {
  precoAtual: {
    perKg: string;
    perUnit: string;
    perBox: string;
  };
  precoSimulado: {
    perKg: string;
    perUnit: string;
    perBox: string;
  };
  diferenca: {
    perKg: string;
    perUnit: string;
    perBox: string;
    percentual: string;
  };
}

export default function SimuladorCenario({ productId, currentConfig, userCanEdit = false }: SimuladorCenarioProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [scenarioName, setScenarioName] = useState("");

  useEffect(() => {
    if (currentConfig) {
      setSimulationConfig({ ...currentConfig });
    }
  }, [currentConfig]);

  // Auto-calculate when simulation config changes
  useEffect(() => {
    if (simulationConfig && isSimulating) {
      const timeoutId = setTimeout(() => {
        simulateMutation.mutate(simulationConfig);
      }, 500); // Debounce 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [simulationConfig, isSimulating]);

  const simulateMutation = useMutation({
    mutationFn: async (config: SimulationConfig) => {
      const response = await apiRequest("POST", `/api/products/${productId}/simulate-price`, config);
      return response.json();
    },
    onSuccess: (data) => {
      setSimulationResult(data);
      setIsSimulating(true);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao simular cenário",
        variant: "destructive",
      });
    },
  });

  const saveScenarioMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/products/${productId}/save-scenario`, {
        nome: scenarioName,
        configuracao: simulationConfig,
        precoSimulado: simulationResult?.precoSimulado.perKg
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Cenário salvo com sucesso",
      });
      setScenarioName("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar cenário",
        variant: "destructive",
      });
    },
  });

  const applyAsPadronMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/products/${productId}/pricing-config`, {
        ...simulationConfig,
        userId: 1
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Configuração aplicada como padrão",
      });
      queryClient.invalidateQueries({ queryKey: [`pricing-config-${productId}`] });
      setIsSimulating(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao aplicar configuração",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof SimulationConfig, value: string | number) => {
    if (simulationConfig) {
      setSimulationConfig({ ...simulationConfig, [field]: value });
    }
  };

  const handleSimulate = () => {
    if (simulationConfig) {
      simulateMutation.mutate(simulationConfig);
    }
  };

  const handleReset = () => {
    if (currentConfig) {
      setSimulationConfig({ ...currentConfig });
      setIsSimulating(false);
      setSimulationResult(null);
    }
  };

  if (!simulationConfig) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center py-4">Carregando simulador...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Simulador de Cenários de Preço
        </CardTitle>
        <p className="text-sm text-gray-600">
          Altere os percentuais abaixo para simular diferentes cenários sem afetar a configuração atual.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuração de Simulação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sim-acordos">Acordos Contratuais (%)</Label>
            <Input
              id="sim-acordos"
              type="number"
              step="0.001"
              value={simulationConfig.acordosContratuais}
              onChange={(e) => handleInputChange("acordosContratuais", e.target.value)}
              disabled={!userCanEdit}
            />
          </div>

          <div>
            <Label htmlFor="sim-trade">Trade Marketing (%)</Label>
            <Input
              id="sim-trade"
              type="number"
              step="0.001"
              value={simulationConfig.tradeMarketingPercent}
              onChange={(e) => handleInputChange("tradeMarketingPercent", e.target.value)}
              disabled={!userCanEdit}
            />
          </div>

          <div>
            <Label htmlFor="sim-comissoes">Comissões (%)</Label>
            <Input
              id="sim-comissoes"
              type="number"
              step="0.001"
              value={simulationConfig.comissoesPercent}
              onChange={(e) => handleInputChange("comissoesPercent", e.target.value)}
              disabled={!userCanEdit}
            />
          </div>

          <div>
            <Label htmlFor="sim-despesas">Despesas Administrativas (%)</Label>
            <Input
              id="sim-despesas"
              type="number"
              step="0.001"
              value={simulationConfig.despesasGeraisAdm}
              onChange={(e) => handleInputChange("despesasGeraisAdm", e.target.value)}
              disabled={!userCanEdit}
            />
          </div>

          <div>
            <Label htmlFor="sim-margem">Margem (%)</Label>
            <Input
              id="sim-margem"
              type="number"
              step="0.001"
              value={simulationConfig.margemPercent}
              onChange={(e) => handleInputChange("margemPercent", e.target.value)}
              disabled={!userCanEdit}
            />
          </div>

          <div>
            <Label htmlFor="sim-icms">ICMS (%)</Label>
            <Input
              id="sim-icms"
              type="number"
              step="0.001"
              value={simulationConfig.icmsPercent}
              onChange={(e) => handleInputChange("icmsPercent", e.target.value)}
              disabled={!userCanEdit}
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <Button
            onClick={handleSimulate}
            disabled={simulateMutation.isPending || !userCanEdit}
            className="bg-corporate hover:bg-corporate/90"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {simulateMutation.isPending ? "Simulando..." : "Simular Preço"}
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            disabled={!isSimulating}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        </div>

        {/* Resultado da Simulação */}
        {simulationResult && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultado da Simulação</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preços Atuais */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Preços Atuais</h4>
                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <span>Por kg:</span>
                      <span className="font-mono">R$ {simulationResult.precoAtual.perKg}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Por unidade:</span>
                      <span className="font-mono">R$ {simulationResult.precoAtual.perUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Por caixa:</span>
                      <span className="font-mono">R$ {simulationResult.precoAtual.perBox}</span>
                    </div>
                  </div>
                </div>

                {/* Preços Simulados */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Preços Simulados</h4>
                  <div className="space-y-2 p-4 bg-corporate-light rounded-lg">
                    <div className="flex justify-between">
                      <span>Por kg:</span>
                      <span className="font-mono font-bold text-corporate">R$ {simulationResult.precoSimulado.perKg}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Por unidade:</span>
                      <span className="font-mono font-bold text-corporate">R$ {simulationResult.precoSimulado.perUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Por caixa:</span>
                      <span className="font-mono font-bold text-corporate">R$ {simulationResult.precoSimulado.perBox}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diferença */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Diferença</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Por kg:</span>
                    <div className="font-mono font-bold text-blue-900">R$ {simulationResult.diferenca.perKg}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Por unidade:</span>
                    <div className="font-mono font-bold text-blue-900">R$ {simulationResult.diferenca.perUnit}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Por caixa:</span>
                    <div className="font-mono font-bold text-blue-900">R$ {simulationResult.diferenca.perBox}</div>
                  </div>
                  <div>
                    <span className="text-blue-700">Variação:</span>
                    <div className="font-mono font-bold text-blue-900">{simulationResult.diferenca.percentual}%</div>
                  </div>
                </div>
              </div>

              {/* Ações do Resultado */}
              {userCanEdit && (
                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Nome do cenário (opcional)"
                      value={scenarioName}
                      onChange={(e) => setScenarioName(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => saveScenarioMutation.mutate()}
                    variant="outline"
                    disabled={saveScenarioMutation.isPending || !scenarioName.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Cenário
                  </Button>
                  <Button
                    onClick={() => applyAsPadronMutation.mutate()}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={applyAsPadronMutation.isPending}
                  >
                    Aplicar como Padrão
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
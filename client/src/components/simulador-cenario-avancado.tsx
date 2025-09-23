import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calculator, TrendingUp, Save, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimuladorCenarioAvancadoProps {
  productId: string;
  currentConfig?: any;
  userCanEdit?: boolean;
}

interface SimulationConfig {
  acordosContratuaisVariacao: string;
  contratuaisPercentVariacao: string;
  tradeMarketingPercentVariacao: string;
  comissoesPercentVariacao: string;
  despesasGeraisAdmVariacao: string;
  margemPercentVariacao: string;
  icmsPercentVariacao: string;
  pisPercentVariacao: string;
  cofinsPercentVariacao: string;
}

interface SimulationResult {
  custoOperacional: number;
  custoVendas: number;
  custoAdministrativo: number;
  custoFinanceiro: number;
  precoFinalPorKg: number;
  precoFinalPorUnidade: number;
  precoFinalPorCaixa: number;
  variacaoPercentual: number;
}

export default function SimuladorCenarioAvancado({ 
  productId, 
  currentConfig,
  userCanEdit = false 
}: SimuladorCenarioAvancadoProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig>({
    acordosContratuaisVariacao: "0",
    contratuaisPercentVariacao: "0",
    tradeMarketingPercentVariacao: "0",
    comissoesPercentVariacao: "0",
    despesasGeraisAdmVariacao: "0",
    margemPercentVariacao: "0",
    icmsPercentVariacao: "0",
    pisPercentVariacao: "0",
    cofinsPercentVariacao: "0",
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [scenarioName, setScenarioName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: savedScenarios = [] } = useQuery({
    queryKey: [`/api/products/${productId}/scenarios`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/scenarios`);
      if (!response.ok) throw new Error('Failed to fetch scenarios');
      return response.json();
    },
  });

  const saveScenarioMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/scenarios/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: parseInt(productId),
          nome: scenarioName,
          configuracao: simulationConfig,
          precoSimulado: simulationResult?.precoFinalPorKg || 0,
          userId: 1,
        }),
      });
      if (!response.ok) throw new Error('Failed to save scenario');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/scenarios`] });
      toast({
        title: "Cenário salvo",
        description: "O cenário foi salvo com sucesso.",
      });
      setScenarioName("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cenário.",
        variant: "destructive",
      });
    },
  });

  const calculateSimulation = () => {
    if (!currentConfig) {
      toast({
        title: "Erro",
        description: "Configuração de preços não encontrada.",
        variant: "destructive",
      });
      return;
    }

    // Aplicar variações percentuais aos valores base
    const acordosBase = parseFloat(currentConfig.acordosContratuais || "0");
    const contratuaisBase = parseFloat(currentConfig.contratuaisPercent || "0");
    const tradeBase = parseFloat(currentConfig.tradeMarketingPercent || "0");
    const comissoesBase = parseFloat(currentConfig.comissoesPercent || "0");
    const despesasBase = parseFloat(currentConfig.despesasGeraisAdm || "0");
    const margemBase = parseFloat(currentConfig.margemPercent || "0");
    const icmsBase = parseFloat(currentConfig.icmsPercent || "0");
    const pisBase = parseFloat(currentConfig.pisPercent || "0");
    const cofinsBase = parseFloat(currentConfig.cofinsPercent || "0");

    // Calcular novos valores com variações
    const acordosNovo = acordosBase * (1 + parseFloat(simulationConfig.acordosContratuaisVariacao) / 100);
    const contratuaisNovo = contratuaisBase * (1 + parseFloat(simulationConfig.contratuaisPercentVariacao) / 100);
    const tradeNovo = tradeBase * (1 + parseFloat(simulationConfig.tradeMarketingPercentVariacao) / 100);
    const comissoesNovo = comissoesBase * (1 + parseFloat(simulationConfig.comissoesPercentVariacao) / 100);
    const despesasNovo = despesasBase * (1 + parseFloat(simulationConfig.despesasGeraisAdmVariacao) / 100);
    const margemNovo = margemBase * (1 + parseFloat(simulationConfig.margemPercentVariacao) / 100);
    const icmsNovo = icmsBase * (1 + parseFloat(simulationConfig.icmsPercentVariacao) / 100);
    const pisNovo = pisBase * (1 + parseFloat(simulationConfig.pisPercentVariacao) / 100);
    const cofinsNovo = cofinsBase * (1 + parseFloat(simulationConfig.cofinsPercentVariacao) / 100);

    // Simulação de cálculo (valores base simulados)
    const custoBase = 100; // Valor base para demonstração
    
    const custoOperacional = custoBase * (1 + acordosNovo / 100);
    const custoVendas = custoOperacional * (1 + (contratuaisNovo + tradeNovo + comissoesNovo) / 100);
    const custoAdministrativo = custoVendas * (1 + despesasNovo / 100);
    const custoFinanceiro = custoAdministrativo * (1 + (icmsNovo + pisNovo + cofinsNovo) / 100);
    const precoFinalPorKg = custoFinanceiro * (1 + margemNovo / 100);

    const precoFinalPorUnidade = precoFinalPorKg * 0.35; // Simulando 350g por unidade
    const precoFinalPorCaixa = precoFinalPorUnidade * 12; // Simulando 12 unidades por caixa

    const precoOriginal = 120; // Valor original para comparação
    const variacaoPercentual = ((precoFinalPorKg - precoOriginal) / precoOriginal) * 100;

    const result: SimulationResult = {
      custoOperacional,
      custoVendas,
      custoAdministrativo,
      custoFinanceiro,
      precoFinalPorKg,
      precoFinalPorUnidade,
      precoFinalPorCaixa,
      variacaoPercentual,
    };

    setSimulationResult(result);
  };

  const resetSimulation = () => {
    setSimulationConfig({
      acordosContratuaisVariacao: "0",
      contratuaisPercentVariacao: "0",
      tradeMarketingPercentVariacao: "0",
      comissoesPercentVariacao: "0",
      despesasGeraisAdmVariacao: "0",
      margemPercentVariacao: "0",
      icmsPercentVariacao: "0",
      pisPercentVariacao: "0",
      cofinsPercentVariacao: "0",
    });
    setSimulationResult(null);
  };

  const handleConfigChange = (field: keyof SimulationConfig, value: string) => {
    setSimulationConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-gray-50 cursor-pointer transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="text-sm font-medium">Simulador de Cenários</span>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
        {/* Controles de Simulação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="acordos-var">Acordos Contratuais (%)</Label>
            <Input
              id="acordos-var"
              type="number"
              step="0.1"
              value={simulationConfig.acordosContratuaisVariacao}
              onChange={(e) => handleConfigChange("acordosContratuaisVariacao", e.target.value)}
              placeholder="Variação %"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contratuais-var">Contratuais (%)</Label>
            <Input
              id="contratuais-var"
              type="number"
              step="0.1"
              value={simulationConfig.contratuaisPercentVariacao}
              onChange={(e) => handleConfigChange("contratuaisPercentVariacao", e.target.value)}
              placeholder="Variação %"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade-var">Trade Marketing (%)</Label>
            <Input
              id="trade-var"
              type="number"
              step="0.1"
              value={simulationConfig.tradeMarketingPercentVariacao}
              onChange={(e) => handleConfigChange("tradeMarketingPercentVariacao", e.target.value)}
              placeholder="Variação %"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comissoes-var">Comissões (%)</Label>
            <Input
              id="comissoes-var"
              type="number"
              step="0.1"
              value={simulationConfig.comissoesPercentVariacao}
              onChange={(e) => handleConfigChange("comissoesPercentVariacao", e.target.value)}
              placeholder="Variação %"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="despesas-var">Despesas Gerais (%)</Label>
            <Input
              id="despesas-var"
              type="number"
              step="0.1"
              value={simulationConfig.despesasGeraisAdmVariacao}
              onChange={(e) => handleConfigChange("despesasGeraisAdmVariacao", e.target.value)}
              placeholder="Variação %"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="margem-var">Margem (%)</Label>
            <Input
              id="margem-var"
              type="number"
              step="0.1"
              value={simulationConfig.margemPercentVariacao}
              onChange={(e) => handleConfigChange("margemPercentVariacao", e.target.value)}
              placeholder="Variação %"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icms-var">ICMS (%)</Label>
            <Input
              id="icms-var"
              type="number"
              step="0.1"
              value={simulationConfig.icmsPercentVariacao}
              onChange={(e) => handleConfigChange("icmsPercentVariacao", e.target.value)}
              placeholder="Variação %"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pis-var">PIS (%)</Label>
            <Input
              id="pis-var"
              type="number"
              step="0.1"
              value={simulationConfig.pisPercentVariacao}
              onChange={(e) => handleConfigChange("pisPercentVariacao", e.target.value)}
              placeholder="Variação %"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cofins-var">COFINS (%)</Label>
            <Input
              id="cofins-var"
              type="number"
              step="0.1"
              value={simulationConfig.cofinsPercentVariacao}
              onChange={(e) => handleConfigChange("cofinsPercentVariacao", e.target.value)}
              placeholder="Variação %"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button onClick={calculateSimulation} className="bg-corporate hover:bg-corporate/90">
            <TrendingUp className="h-4 w-4 mr-2" />
            Calcular Simulação
          </Button>
          <Button variant="outline" onClick={resetSimulation}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        </div>

        {/* Resultados da Simulação */}
        {simulationResult && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold">Resultados da Simulação</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Custo Operacional:</span>
                  <span>R$ {simulationResult.custoOperacional.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo de Vendas:</span>
                  <span>R$ {simulationResult.custoVendas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo Administrativo:</span>
                  <span>R$ {simulationResult.custoAdministrativo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo Financeiro:</span>
                  <span>R$ {simulationResult.custoFinanceiro.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Preço Final/Kg:</span>
                  <span>R$ {simulationResult.precoFinalPorKg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço Final/Unidade:</span>
                  <span>R$ {simulationResult.precoFinalPorUnidade.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço Final/Caixa:</span>
                  <span>R$ {simulationResult.precoFinalPorCaixa.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Variação:</span>
                  <Badge variant={simulationResult.variacaoPercentual >= 0 ? "default" : "destructive"}>
                    {simulationResult.variacaoPercentual >= 0 ? "+" : ""}{simulationResult.variacaoPercentual.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Salvar Cenário */}
            {userCanEdit && (
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Nome do cenário"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => saveScenarioMutation.mutate()}
                  disabled={!scenarioName.trim() || saveScenarioMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Cenário
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Cenários Salvos */}
        {savedScenarios.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold">Cenários Salvos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {savedScenarios.map((scenario: any) => (
                <div key={scenario.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{scenario.nome}</span>
                    <Badge variant="outline">
                      R$ {scenario.precoSimulado.toFixed(2)}/kg
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(scenario.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
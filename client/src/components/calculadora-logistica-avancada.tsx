
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Truck, Package, Codepen, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalculadoraLogisticaAvancadaProps {
  productId: string;
  userCanEdit?: boolean;
}

interface ProductData {
  id: number;
  name: string;
  caixasPorPalete?: number;
  pesoLiquidoPorCaixa?: string;
  comprimentoCaixa?: string;
  larguraCaixa?: string;
  alturaCaixa?: string;
}

interface Modalidade {
  id: number;
  nome: string;
  valorFixo: number;
  tipo: string;
  cubagemMaxima?: number;
  capacidadePaletes?: number;
}

interface CalculoResultado {
  id: number;
  cubagemPorCaixa?: number;
  caixasPorVeiculo: number;
  paletesPorVeiculo?: number;
  pesoTotalPorVeiculo: string;
  numeroViagens: number;
  custoPorKg: string;
  custoTotalEstimado: string;
  quantidadeTransportada: number;
  modalidadeNome: string;
  modalidadeTipo: string;
  createdAt: string;
}

export default function CalculadoraLogisticaAvancada({ 
  productId, 
  userCanEdit = false 
}: CalculadoraLogisticaAvancadaProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedModalidade, setSelectedModalidade] = useState<string>("");
  const [quantidadeTransportada, setQuantidadeTransportada] = useState<string>("");
  const [tipoQuantidade, setTipoQuantidade] = useState<"caixas" | "paletes">("caixas");
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch modalidades de transporte
  const { data: modalidades = [], isLoading: loadingModalidades } = useQuery({
    queryKey: ["/api/modalidades-transporte"],
    queryFn: async () => {
      const response = await fetch("/api/modalidades-transporte");
      if (!response.ok) throw new Error("Failed to fetch modalidades");
      const data = await response.json();
      console.log("Modalidades carregadas:", data);
      return data;
    },
  });

  // Fetch produto para mostrar informações
  const { data: product } = useQuery<ProductData>({
    queryKey: [`/api/products/${productId}`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const data = await response.json();
      console.log("Produto carregado:", data);
      return data;
    },
  });

  // Fetch cálculos anteriores
  const { data: calculosAnteriores = [], isLoading: loadingCalculos } = useQuery<CalculoResultado[]>({
    queryKey: [`/api/products/${productId}/logistics-calculations`],
  });

  // Mutation para limpar duplicações
  const limparDuplicacoes = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/modalidades-transporte/clean-duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao limpar duplicações");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Duplicações removidas!",
        description: `${data.count} modalidades únicas mantidas.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/modalidades-transporte"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao limpar duplicações",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  // Mutation para limpar histórico de cálculos
  const limparCalculos = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/products/${productId}/logistics-calculations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao limpar cálculos");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Histórico limpo com sucesso!",
        description: `${data.deletedCount} cálculo(s) removido(s).`,
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/products/${productId}/logistics-calculations`] 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao limpar histórico",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para calcular logística
  const calcularLogistica = useMutation({
    mutationFn: async (data: {
      productId: number;
      modalidadeId: number;
      quantidadeTransportada: number;
      userId: number;
      tipoCalculo?: string;
    }) => {
      console.log("Enviando dados para cálculo:", data);

      const response = await fetch("/api/logistics/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta:", errorText);
        throw new Error(errorText || "Erro ao calcular logística");
      }

      const result = await response.json();
      console.log("Resultado do cálculo:", result);
      return result;
    },
    onSuccess: (data) => {
      setCurrentResult(data);
      toast({
        title: "Cálculo realizado com sucesso!",
        description: `Custo por kg: R$ ${parseFloat(data.custoPorKg).toFixed(4)}/kg`,
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/products/${productId}/logistics-calculations`] 
      });
      setIsCalculating(false);
    },
    onError: (error: Error) => {
      console.error("Erro no cálculo:", error);
      toast({
        title: "Erro no cálculo",
        description: error.message,
        variant: "destructive",
      });
      setIsCalculating(false);
    },
  });

  const handleCalcular = () => {
    // Validação de dados
    if (!selectedModalidade) {
      toast({
        title: "Selecione um veículo",
        description: "É necessário selecionar uma modalidade de transporte.",
        variant: "destructive",
      });
      return;
    }

    if (!quantidadeTransportada || parseFloat(quantidadeTransportada) <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "Informe uma quantidade válida para transportar.",
        variant: "destructive",
      });
      return;
    }

    // Extrair ID real da modalidade (remove prefixo cubagem- ou paletes-)
    const modalidadeId = selectedModalidade.replace(/^(cubagem|paletes)-/, "");
    const modalidade = modalidades.find((m: Modalidade) => m.id.toString() === modalidadeId);
    if (!modalidade) {
      toast({
        title: "Modalidade não encontrada",
        description: "A modalidade selecionada não foi encontrada.",
        variant: "destructive",
      });
      return;
    }

    if (!product) {
      toast({
        title: "Produto não carregado",
        description: "Aguarde o carregamento dos dados do produto.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    // Para modalidades de cubagem, sempre calculamos em caixas
    // Para modalidades de paletes, sempre calculamos em paletes
    const quantidade = parseFloat(quantidadeTransportada);

    console.log("Iniciando cálculo com:", {
      productId: parseInt(productId),
      modalidadeId: parseInt(modalidadeId),
      quantidadeTransportada: quantidade,
      modalidade: modalidade.nome,
      tipo: modalidade.tipo,
      unidadeOriginal: tipoQuantidade,
      tipoCalculo: selectedModalidade.startsWith("cubagem-") ? "cubagem" : "paletes"
    });

    calcularLogistica.mutate({
      productId: parseInt(productId),
      modalidadeId: parseInt(modalidadeId),
      quantidadeTransportada: quantidade,
      userId: 1,
      tipoCalculo: selectedModalidade.startsWith("cubagem-") ? "cubagem" : "paletes"
    });
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const formatCostPerKg = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(num) + "/kg";
  };

  const formatNumber = (value: number | string, decimals = 2) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString("pt-BR", { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  // Função para calcular capacidade máxima do veículo
  const calcularCapacidadeVeiculo = (modalidade: Modalidade) => {
    if (!product) return null;

    if (modalidade.tipo === "cubagem") {
      const comprimento = parseFloat(product.comprimentoCaixa?.toString() || "38.8") / 100; // converter para metros
      const largura = parseFloat(product.larguraCaixa?.toString() || "28.8") / 100;
      const altura = parseFloat(product.alturaCaixa?.toString() || "26.0") / 100;
      const cubagemPorCaixa = comprimento * largura * altura; // m³
      const cubagemMaxima = modalidade.cubagemMaxima || 0;

      if (cubagemPorCaixa > 0 && cubagemMaxima > 0) {
        return Math.floor(cubagemMaxima / cubagemPorCaixa);
      }
    } else if (modalidade.tipo === "paletes") {
      return modalidade.capacidadePaletes || 0;
    }

    return 0;
  };

  // Auto-select unit type based on vehicle selection
  useEffect(() => {
    if (selectedModalidade && modalidades.length > 0) {
      // Agora usamos prefixo para determinar o tipo de cálculo
      if (selectedModalidade.startsWith("cubagem-")) {
        setTipoQuantidade("caixas");
      } else if (selectedModalidade.startsWith("paletes-")) {
        setTipoQuantidade("paletes");
      }
    }
  }, [selectedModalidade, modalidades]);

  

  return (
    <div className="space-y-6">
      {/* Formulário de Cálculo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculadora de Logística
              </CardTitle>
              <CardDescription>
                Calcule custos de transporte e custo por kg com base em diferentes modalidades de veículos
              </CardDescription>
            </div>

            {modalidades.length > 0 && userCanEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => limparDuplicacoes.mutate()}
                disabled={limparDuplicacoes.isPending}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                {limparDuplicacoes.isPending ? "Limpando..." : "Limpar Duplicações"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {product && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <Label className="text-sm font-medium text-blue-700">Produto</Label>
                <p className="text-sm font-semibold">{product.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-700">Caixas/Palete</Label>
                <p className="text-sm font-semibold">{product.caixasPorPalete || 50}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-700">Peso/Caixa</Label>
                <p className="text-sm font-semibold">{formatNumber(product.pesoLiquidoPorCaixa || "5", 2)} kg</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-700">Dimensões Caixa</Label>
                <p className="text-sm font-semibold">
                  {formatNumber(product.comprimentoCaixa || "38.8", 1)} × {formatNumber(product.larguraCaixa || "28.8", 1)} × {formatNumber(product.alturaCaixa || "26", 1)} cm
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-700">Cubagem/Caixa</Label>
                <p className="text-sm font-semibold">
                  {(() => {
                    const comp = parseFloat(product.comprimentoCaixa || "38.8") / 100;
                    const larg = parseFloat(product.larguraCaixa || "28.8") / 100;
                    const alt = parseFloat(product.alturaCaixa || "26") / 100;
                    return formatNumber(comp * larg * alt, 6);
                  })()} m³
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="modalidade">Tipo de Veículo</Label>
              <Select 
                value={selectedModalidade} 
                onValueChange={setSelectedModalidade}
                disabled={loadingModalidades}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {/* Modalidades por Cubagem */}
                  {(() => {
                    const cubagemModalidades = modalidades.filter((m: Modalidade) => 
                      m.tipo === "cubagem" || (m.cubagemMaxima && m.cubagemMaxima > 0)
                    );
                    if (cubagemModalidades.length > 0) {
                      return (
                        <>
                          <div className="px-2 py-1.5 text-sm font-semibold text-gray-600">
                            📦 Por Cubagem 
                          </div>
                          {cubagemModalidades.map((modalidade: Modalidade) => (
                            <SelectItem key={`cubagem-${modalidade.id}`} value={`cubagem-${modalidade.id}`}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{modalidade.nome}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency(modalidade.valorFixo)}
                                </span>
                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                                  {modalidade.cubagemMaxima}m³
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      );
                    }
                    return null;
                  })()}

                  {/* Modalidades por Paletes */}
                  {(() => {
                    const paletesModalidades = modalidades.filter((m: Modalidade) => 
                      m.tipo === "paletes" || (m.capacidadePaletes && m.capacidadePaletes > 0)
                    );
                    if (paletesModalidades.length > 0) {
                      return (
                        <>
                          <div className="px-2 py-1.5 text-sm font-semibold text-gray-600 border-t mt-1 pt-2">
                            🚛 Por Paletes 
                          </div>
                          {paletesModalidades.map((modalidade: Modalidade) => (
                            <SelectItem key={`paletes-${modalidade.id}`} value={`paletes-${modalidade.id}`}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{modalidade.nome}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency(modalidade.valorFixo)}
                                </span>
                                <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                                  {modalidade.capacidadePaletes} paletes
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      );
                    }
                    return null;
                  })()}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unidade de Cálculo</Label>
              <div className="p-3 bg-muted/50 rounded-md border">
                <div className="flex items-center gap-2 text-sm">
                  {tipoQuantidade === "caixas" ? (
                    <>
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Caixas</span>
                      <Badge variant="secondary" className="text-xs">Selecionado automaticamente</Badge>
                    </>
                  ) : (
                    <>
                      <Codepen className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Paletes</span>
                      <Badge variant="secondary" className="text-xs">Selecionado automaticamente</Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade a Transportar</Label>
              <Input
                id="quantidade"
                type="number"
                value={quantidadeTransportada}
                onChange={(e) => setQuantidadeTransportada(e.target.value)}
                placeholder={`Informe a quantidade em ${tipoQuantidade}`}
                min="1"
                step="1"
              />

              {/* Mostrar capacidade máxima do veículo selecionado */}
              {selectedModalidade && modalidades.length > 0 && (() => {
                const modalidadeId = selectedModalidade.replace(/^(cubagem|paletes)-/, "");
                const modalidade = modalidades.find((m: Modalidade) => m.id.toString() === modalidadeId);
                if (!modalidade) return null;

                // Determinar tipo de cálculo baseado no prefixo
                const tipoCalculoEfetivo = selectedModalidade.startsWith("cubagem-") ? "cubagem" : "paletes";

                const capacidadeMaxima = tipoCalculoEfetivo === "cubagem" 
                  ? Math.floor((modalidade.cubagemMaxima || 0) / 0.02905344) // cubagem por caixa padrão
                  : modalidade.capacidadePaletes || 0;
                const quantidade = parseInt(quantidadeTransportada || "0");

                if (capacidadeMaxima && quantidade > 0) {
                  const excedeu = quantidade > capacidadeMaxima;
                  const numeroViagens = Math.ceil(quantidade / capacidadeMaxima);

                  return (
                    <div className={`p-3 rounded-md text-sm ${excedeu ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {excedeu ? (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        <span className={`font-medium ${excedeu ? 'text-yellow-800' : 'text-green-800'}`}>
                          Capacidade: {capacidadeMaxima} {tipoQuantidade} por viagem
                        </span>
                      </div>

                      {excedeu && (
                        <div className="text-yellow-700">
                          <div>⚠️ Quantidade excede capacidade</div>
                          <div className="font-medium">Serão necessárias {numeroViagens} viagens</div>
                        </div>
                      )}

                      {!excedeu && (
                        <div className="text-green-700 font-medium">
                          ✅ Quantidade pode ser transportada em 1 viagem
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          {/* Informações do Veículo Selecionado */}
          {selectedModalidade && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
              {(() => {
                const modalidadeId = selectedModalidade.replace(/^(cubagem|paletes)-/, "");
                const modalidade = modalidades.find((m: Modalidade) => m.id.toString() === modalidadeId);
                if (!modalidade) return null;

                const tipoCalculoEfetivo = selectedModalidade.startsWith("cubagem-") ? "cubagem" : "paletes";

                return (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2 text-blue-800">
                      <Truck className="h-4 w-4" />
                      Informações do Veículo: {modalidade.nome}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-blue-600">Valor por Viagem</Label>
                        <p className="font-bold text-blue-800">{formatCurrency(modalidade.valorFixo)}</p>
                      </div>
                      {tipoCalculoEfetivo === "cubagem" && modalidade.cubagemMaxima && (
                        <div>
                          <Label className="text-blue-600">Cubagem Máxima</Label>
                          <p className="font-bold text-blue-800">{formatNumber(modalidade.cubagemMaxima, 1)} m³</p>
                        </div>
                      )}
                      {tipoCalculoEfetivo === "paletes" && modalidade.capacidadePaletes && (
                        <div>
                          <Label className="text-blue-600">Capacidade</Label>
                          <p className="font-bold text-blue-800">{modalidade.capacidadePaletes} paletes</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-blue-600">Tipo de Cálculo</Label>
                        <p className="font-bold text-blue-800 capitalize">{tipoCalculoEfetivo}</p>
                      </div>
    
                      <div>
                        <Label className="text-blue-600">Capacidade Calculada</Label>
                        <p className="font-bold text-blue-800">{calcularCapacidadeVeiculo(modalidade)} {tipoQuantidade}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <Button 
            onClick={handleCalcular}
            disabled={isCalculating || !selectedModalidade || !quantidadeTransportada}
            className="w-full bg-[#e30722] hover:bg-[#c30622] text-white"
            size="lg"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {isCalculating ? "Calculando..." : "Calcular Logística"}
          </Button>

          {/* Resultado Imediato */}
          {currentResult && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
              <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5" />
                Resultado do Cálculo - Custo por Kg: {formatCostPerKg(parseFloat(currentResult.custoPorKg))}
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <Label className="text-gray-600">Quantidade Transportada</Label>
                  <p className="font-bold text-lg">{currentResult.quantidadeTransportada} {tipoQuantidade}</p>
                </div>

                <div className="bg-white p-3 rounded border">
                  <Label className="text-gray-600">Caixas por Viagem</Label>
                  <p className="font-bold text-lg">{currentResult.caixasPorVeiculo}</p>
                </div>

                <div className="bg-white p-3 rounded border">
                  <Label className="text-gray-600">Peso Total por Viagem</Label>
                  <p className="font-bold text-lg">{formatNumber(parseFloat(currentResult.pesoTotalPorVeiculo), 1)} kg</p>
                </div>

                <div className="bg-white p-3 rounded border">
                  <Label className="text-gray-600">Número de Viagens</Label>
                  <p className="font-bold text-lg text-blue-600">{currentResult.numeroViagens}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white p-4 rounded border-2 border-blue-300">
                  <Label className="text-blue-600">💰 Custo por Kg</Label>
                  <p className="font-bold text-2xl text-blue-700">{formatCostPerKg(parseFloat(currentResult.custoPorKg))}</p>
                </div>

                <div className="bg-white p-4 rounded border-2 border-green-300">
                  <Label className="text-green-600">🚚 Custo Total Estimado</Label>
                  <p className="font-bold text-2xl text-green-700">{formatCurrency(parseFloat(currentResult.custoTotalEstimado))}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Cálculos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Histórico de Cálculos
              </CardTitle>
              <CardDescription>
                Cálculos anteriores de logística para este produto
              </CardDescription>
            </div>

            {calculosAnteriores.length > 0 && userCanEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => limparCalculos.mutate()}
                disabled={limparCalculos.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {limparCalculos.isPending ? "Limpando..." : "Limpar Histórico"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingCalculos ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-corporate mx-auto mb-4"></div>
              Carregando cálculos...
            </div>
          ) : calculosAnteriores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum cálculo realizado ainda</p>
              <p className="text-sm">Os cálculos aparecerão aqui após serem realizados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {calculosAnteriores.map((calculo: any, index: number) => (
                <div key={calculo.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          <span className="font-medium">{calculo.modalidadeNome}</span>
                          <Badge variant="outline">{calculo.modalidadeTipo}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(calculo.createdAt).toLocaleDateString("pt-BR", {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCostPerKg(parseFloat(calculo.custoPorKg))}</div>
                      <div className="text-sm text-gray-600">{formatCurrency(parseFloat(calculo.custoTotalEstimado))}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <Label>Quantidade Transportada</Label>
                      <p className="font-medium">{calculo.quantidadeTransportada} {calculo.modalidadeTipo === "paletes" ? "paletes" : "caixas"}</p>
                    </div>

                    {calculo.modalidadeTipo === "cubagem" && calculo.cubagemPorCaixa && (
                      <div>
                        <Label>Cubagem por Caixa</Label>
                        <p className="font-medium">{formatNumber(parseFloat(calculo.cubagemPorCaixa), 6)} m³</p>
                      </div>
                    )}

                    <div>
                      <Label>
                        {calculo.modalidadeTipo === "paletes" ? "Paletes" : "Caixas"} por Viagem
                      </Label>
                      <p className="font-medium">
                        {calculo.modalidadeTipo === "paletes" ? calculo.paletesPorVeiculo : calculo.caixasPorVeiculo}
                      </p>
                    </div>

                    <div>
                      <Label>Peso Total por Viagem</Label>
                      <p className="font-medium">{formatNumber(parseFloat(calculo.pesoTotalPorVeiculo), 1)} kg</p>
                    </div>

                    <div>
                      <Label>Número de Viagens</Label>
                      <p className="font-medium text-blue-600">{calculo.numeroViagens}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

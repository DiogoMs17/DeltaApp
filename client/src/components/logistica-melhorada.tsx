import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Package, Plus, Calculator, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogisticaMelhoradaProps {
  productId: string;
  userCanEdit?: boolean;
}

interface Modalidade {
  id: number;
  nome: string;
  valorFixo: number;
  tipo: string;
  cubagemMaxima?: number;
  capacidadePaletes?: number;
  isActive: boolean;
}

interface NovaModalidade {
  nome: string;
  valorFixo: string;
  tipo: string;
  cubagemMaxima: string;
  capacidadePaletes: string;
}

export default function LogisticaMelhorada({ productId, userCanEdit = false }: LogisticaMelhoradaProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showNewModalidadeForm, setShowNewModalidadeForm] = useState(false);
  const [editingModalidade, setEditingModalidade] = useState<number | null>(null);
  const [selectedModalidade, setSelectedModalidade] = useState<string>("");
  const [quantidadeTransportada, setQuantidadeTransportada] = useState<string>("");
  const [resultadoCalculo, setResultadoCalculo] = useState<any>(null);
  
  const [novaModalidade, setNovaModalidade] = useState<NovaModalidade>({
    nome: "",
    valorFixo: "",
    tipo: "terrestre",
    cubagemMaxima: "",
    capacidadePaletes: "",
  });

  const { data: modalidades = [], isLoading } = useQuery({
    queryKey: ['/api/modalidades-transporte'],
    queryFn: async () => {
      const response = await fetch('/api/modalidades-transporte');
      if (!response.ok) throw new Error('Failed to fetch modalidades');
      return response.json();
    },
  });

  const { data: calculosPrevios = [] } = useQuery({
    queryKey: [`/api/products/${productId}/logistics-calculations`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/logistics-calculations`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  const criarModalidadeMutation = useMutation({
    mutationFn: async (modalidade: NovaModalidade) => {
      const response = await fetch('/api/modalidades-transporte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: modalidade.nome,
          valorFixo: parseFloat(modalidade.valorFixo),
          tipo: modalidade.tipo,
          cubagemMaxima: parseFloat(modalidade.cubagemMaxima) || undefined,
          capacidadePaletes: parseInt(modalidade.capacidadePaletes) || undefined,
        }),
      });
      if (!response.ok) throw new Error('Failed to create modalidade');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/modalidades-transporte'] });
      toast({
        title: "Modalidade criada",
        description: "Nova modalidade de transporte criada com sucesso.",
      });
      setShowNewModalidadeForm(false);
      setNovaModalidade({
        nome: "",
        valorFixo: "",
        tipo: "terrestre",
        cubagemMaxima: "",
        capacidadePaletes: "",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a modalidade.",
        variant: "destructive",
      });
    },
  });

  const calcularLogisticaMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logistics/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: parseInt(productId),
          modalidadeId: parseInt(selectedModalidade),
          quantidadeTransportada: parseFloat(quantidadeTransportada),
          userId: 1,
        }),
      });
      if (!response.ok) throw new Error('Failed to calculate logistics');
      return response.json();
    },
    onSuccess: (data) => {
      setResultadoCalculo(data);
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/logistics-calculations`] });
      toast({
        title: "Cálculo realizado",
        description: "Cálculo de logística realizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível realizar o cálculo.",
        variant: "destructive",
      });
    },
  });

  const inicializarModalidadesPadrao = useMutation({
    mutationFn: async () => {
      const modalidadesPadrao = [
        {
          nome: "Fiorino",
          valorFixo: 250.00,
          tipo: "terrestre",
          cubagemMaxima: 2.8,
          capacidadePaletes: 2,
          isActive: true
        },
        {
          nome: "Caminhão 3/4",
          valorFixo: 450.00,
          tipo: "terrestre",
          cubagemMaxima: 15.0,
          capacidadePaletes: 8,
          isActive: true
        },
        {
          nome: "Carreta",
          valorFixo: 850.00,
          tipo: "terrestre",
          cubagemMaxima: 90.0,
          capacidadePaletes: 33,
          isActive: true
        }
      ];

      const response = await fetch('/api/modalidades-transporte/padrao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modalidades: modalidadesPadrao }),
      });
      if (!response.ok) throw new Error('Failed to initialize modalidades');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/modalidades-transporte'] });
      toast({
        title: "Modalidades inicializadas",
        description: "Modalidades padrão foram criadas com sucesso.",
      });
    },
  });

  useEffect(() => {
    if (modalidades.length === 0 && !isLoading) {
      inicializarModalidadesPadrao.mutate();
    }
  }, [modalidades.length, isLoading]);

  const handleCalcular = () => {
    if (!selectedModalidade || !quantidadeTransportada) {
      toast({
        title: "Erro",
        description: "Selecione uma modalidade e informe a quantidade.",
        variant: "destructive",
      });
      return;
    }
    calcularLogisticaMutation.mutate();
  };

  const handleCriarModalidade = () => {
    if (!novaModalidade.nome || !novaModalidade.valorFixo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    criarModalidadeMutation.mutate(novaModalidade);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Logística e Transporte Avançada
        </CardTitle>
        <CardDescription>
          Gerencie modalidades de transporte e calcule custos logísticos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Modalidades Existentes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Modalidades de Transporte</h3>
            {userCanEdit && (
              <Button
                onClick={() => setShowNewModalidadeForm(!showNewModalidadeForm)}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Modalidade
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modalidades.map((modalidade: Modalidade) => (
              <Card key={modalidade.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{modalidade.nome}</h4>
                  <Badge variant={modalidade.isActive ? "default" : "secondary"}>
                    {modalidade.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Valor: R$ {modalidade.valorFixo.toFixed(2)}</div>
                  <div>Tipo: {modalidade.tipo}</div>
                  {modalidade.cubagemMaxima && (
                    <div>Cubagem: {modalidade.cubagemMaxima}m³</div>
                  )}
                  {modalidade.capacidadePaletes && (
                    <div>Paletes: {modalidade.capacidadePaletes}</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Formulário Nova Modalidade */}
        {showNewModalidadeForm && userCanEdit && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold">Nova Modalidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={novaModalidade.nome}
                  onChange={(e) => setNovaModalidade(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Fiorino, Caminhão"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorFixo">Valor Fixo (R$) *</Label>
                <Input
                  id="valorFixo"
                  type="number"
                  step="0.01"
                  value={novaModalidade.valorFixo}
                  onChange={(e) => setNovaModalidade(prev => ({ ...prev, valorFixo: e.target.value }))}
                  placeholder="250.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={novaModalidade.tipo}
                  onValueChange={(value) => setNovaModalidade(prev => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terrestre">Terrestre</SelectItem>
                    <SelectItem value="aereo">Aéreo</SelectItem>
                    <SelectItem value="maritimo">Marítimo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cubagem">Cubagem Máxima (m³)</Label>
                <Input
                  id="cubagem"
                  type="number"
                  step="0.1"
                  value={novaModalidade.cubagemMaxima}
                  onChange={(e) => setNovaModalidade(prev => ({ ...prev, cubagemMaxima: e.target.value }))}
                  placeholder="15.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paletes">Capacidade de Paletes</Label>
                <Input
                  id="paletes"
                  type="number"
                  value={novaModalidade.capacidadePaletes}
                  onChange={(e) => setNovaModalidade(prev => ({ ...prev, capacidadePaletes: e.target.value }))}
                  placeholder="8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCriarModalidade}
                disabled={criarModalidadeMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Modalidade
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNewModalidadeForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <Separator />

        {/* Calculadora de Logística */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Calculadora de Logística</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modalidade">Modalidade de Transporte</Label>
              <Select value={selectedModalidade} onValueChange={setSelectedModalidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {modalidades
                    .filter((m: Modalidade) => m.isActive)
                    .map((modalidade: Modalidade) => (
                      <SelectItem key={modalidade.id} value={modalidade.id.toString()}>
                        {modalidade.nome} - R$ {modalidade.valorFixo.toFixed(2)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade a Transportar (kg)</Label>
              <Input
                id="quantidade"
                type="number"
                step="0.1"
                value={quantidadeTransportada}
                onChange={(e) => setQuantidadeTransportada(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCalcular}
                disabled={calcularLogisticaMutation.isPending}
                className="w-full"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calcular
              </Button>
            </div>
          </div>
        </div>

        {/* Resultado do Cálculo */}
        {resultadoCalculo && (
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold">Resultado do Cálculo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Cubagem por Caixa:</span>
                  <span>{resultadoCalculo.cubagemPorCaixa?.toFixed(4)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span>Caixas por Veículo:</span>
                  <span>{resultadoCalculo.caixasPorVeiculo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peso Total por Veículo:</span>
                  <span>{resultadoCalculo.pesoTotalPorVeiculo} kg</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Número de Viagens:</span>
                  <span>{resultadoCalculo.numeroViagens}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo por Kg:</span>
                  <span>R$ {resultadoCalculo.custoPorKg?.toFixed(4)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Custo Total Estimado:</span>
                  <span>R$ {resultadoCalculo.custoTotalEstimado?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cálculos Anteriores */}
        {calculosPrevios.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold">Cálculos Anteriores</h3>
            <div className="space-y-2">
              {calculosPrevios.slice(0, 5).map((calculo: any) => (
                <div key={calculo.id} className="p-3 border rounded-lg text-sm">
                  <div className="flex justify-between items-center">
                    <span>
                      {calculo.quantidadeTransportada}kg - {calculo.numeroViagens} viagens
                    </span>
                    <Badge variant="outline">
                      R$ {calculo.custoTotalEstimado?.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(calculo.createdAt).toLocaleDateString()} - 
                    R$ {calculo.custoPorKg?.toFixed(4)}/kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Edit, Lock, Handshake, Building2, CreditCard, Truck, Receipt } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PricingConfigurationProps {
  productId: number;
  userCanEdit?: boolean;
}

interface PricingConfig {
  id?: number;
  productId: number;
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

const defaultConfig: Partial<PricingConfig> = {
  acordosContratuais: "14.250",
  contratuaisPercent: "14.250",
  tradeMarketingPercent: "0.000",
  comissoesPercent: "0.000",
  despesasGeraisAdm: "10.500",
  prazoPagamentoDias: 30,
  jurosAm: "1.00",
  encargosPercent: "2.00",
  armazenagemPercent: "0.00",
  icmsPercent: "7.000",
  pisPercent: "0.000",
  cofinsPercent: "0.000",
};

export default function PricingConfiguration({ productId, userCanEdit = false }: PricingConfigurationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pricingConfig, isLoading } = useQuery({
    queryKey: [`pricing-config-${productId}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/products/${productId}/pricing-config`);
      return response.json();
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<PricingConfig>) => {
      const response = await apiRequest("PUT", `/api/products/${productId}/pricing-config`, {
        ...newConfig,
        userId: 1, // In real app, get from user context
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Configuração de preços atualizada com sucesso",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: [`pricing-config-${productId}`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração de preços",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (pricingConfig) {
      setConfig(pricingConfig);
    } else {
      setConfig({ productId, ...defaultConfig } as PricingConfig);
    }
  }, [pricingConfig, productId]);

  const handleSave = () => {
    if (config) {
      updateConfigMutation.mutate(config);
    }
  };

  const handleInputChange = (field: keyof PricingConfig, value: string | number) => {
    if (config) {
      setConfig({ ...config, [field]: value });
    }
  };

  if (isLoading) {
    return <div>Carregando configuração...</div>;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Edit size={20} />
          Configuração de Preços
        </CardTitle>
        {userCanEdit && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={updateConfigMutation.isPending}
                  size="sm"
                >
                  <Save size={16} className="mr-2" />
                  Salvar
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                size="sm"
              >
                <Edit size={16} className="mr-2" />
                Editar
              </Button>
            )}
          </div>
        )}
        {!userCanEdit && (
          <div className="flex items-center gap-2 text-gray-500">
            <Lock size={16} />
            <span className="text-sm">Somente visualização</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {config && (
          <>
            {/* Acordos e Despesas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                <Handshake className="h-5 w-5 text-blue-600" />
                Despesas com Vendas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo único de Contratuais ocupando toda a linha */}
                <div className="md:col-span-2">
                  <Label htmlFor="acordos-contratuais">Acordos Contratuais (%)</Label>
                  <Input
                    id="acordos-contratuais"
                    type="number"
                    step="0.001"
                    value={config.acordosContratuais}
                    onChange={(e) =>
                      handleInputChange("acordosContratuais", e.target.value)
                    }
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="trade-marketing">Trade Marketing (%)</Label>
                  <Input
                    id="trade-marketing"
                    type="number"
                    step="0.001"
                    value={config.tradeMarketingPercent}
                    onChange={(e) =>
                      handleInputChange("tradeMarketingPercent", e.target.value)
                    }
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="comissoes">Comissões (%)</Label>
                  <Input
                    id="comissoes"
                    type="number"
                    step="0.001"
                    value={config.comissoesPercent}
                    onChange={(e) =>
                      handleInputChange("comissoesPercent", e.target.value)
                    }
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
              </div>
            </div>

            {/* Despesas Administrativas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Despesas Administrativas
              </h3>
              <div>
                <Label htmlFor="despesas-gerais">Despesas Gerais ADM. (%)</Label>
                <Input
                  id="despesas-gerais"
                  type="number"
                  step="0.001"
                  value={config.despesasGeraisAdm}
                  onChange={(e) => handleInputChange("despesasGeraisAdm", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            {/* Condições de Pagamento */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                 Despesas Financeiras
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="prazo-pagamento">Prazo de Pagamento (dias)</Label>
                  <Input
                    id="prazo-pagamento"
                    type="number"
                    value={config.prazoPagamentoDias}
                    onChange={(e) => handleInputChange('prazoPagamentoDias', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="juros">Juros a.m. (%)</Label>
                  <Input
                    id="juros"
                    type="number"
                    step="0.01"
                    value={config.jurosAm}
                    onChange={(e) => handleInputChange('jurosAm', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="encargos">Encargos (%)</Label>
                  <Input
                    id="encargos"
                    type="number"
                    step="0.01"
                    value={config.encargosPercent}
                    onChange={(e) => handleInputChange('encargosPercent', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
              </div>
            </div>

            {/* Logística */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-orange-600" />
                  Logística
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Obs: Transporte não incluido, configurado separadamente  
                </div>
              </h3>
              <div>
                <Label htmlFor="armazenagem">Armazenagem (%)</Label>
                <Input
                  id="armazenagem"
                  type="number"
                  step="0.01"
                  value={config.armazenagemPercent}
                  onChange={(e) => handleInputChange('armazenagemPercent', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            {/* Impostos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-red-600" />
                Impostos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="icms">ICMS (%)</Label>
                  <Input
                    id="icms"
                    type="number"
                    step="0.001"
                    value={config.icmsPercent}
                    onChange={(e) => handleInputChange('icmsPercent', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="pis">PIS (%)</Label>
                  <Input
                    id="pis"
                    type="number"
                    step="0.001"
                    value={config.pisPercent}
                    onChange={(e) => handleInputChange('pisPercent', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="cofins">COFINS (%)</Label>
                  <Input
                    id="cofins"
                    type="number"
                    step="0.001"
                    value={config.cofinsPercent}
                    onChange={(e) => handleInputChange('cofinsPercent', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
              </div>
            </div>

          </>
        )}
      </CardContent>
    </Card>
  );
}

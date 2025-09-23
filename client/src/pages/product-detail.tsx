import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calculator, Search } from "lucide-react";
import logoImage from "./image (2).png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import InputMaterialsSection from "@/components/input-materials-section";
import ConsolidatedPriceSection from "@/components/consolidated-price-section";
import FixedCostSection from "@/components/fixed-cost-section";
import InsumoComposition from "@/components/insumo-composition";
import DetailedComposition from "@/components/detailed-composition";
import FinalPriceComposition from "@/components/final-price-composition";
import OrderBreakdownSpreadsheet from "@/components/order-breakdown-spreadsheet";
import ChangeHistory from "@/components/change-history";
import PricingConfiguration from "@/components/pricing-configuration";
import SimuladorCenarioAvancado from "@/components/simulador-cenario-avancado";
import ExportData from "@/components/export-data";
import AutoFillInsumo from "@/components/auto-fill-insumo";
import CalculadoraLogisticaAvancada from "@/components/calculadora-logistica-avancada";
import ConsolidatedPriceDisplay from "@/components/consolidated-price-display";
import { useAuth } from "@/lib/auth-context";
import type {
  Product,
  ProductInsumo,
  ComposicaoDetalhada,
  ComposicaoPreco,
  LogisticaTransporte,
  LogAlteracao,
} from "@/lib/types";

// componente de perfil dinâmico
import UserProfileBadge from "@/components/user-profile-badge";

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:productId");
  const [, setLocation] = useLocation();
  const productId = params?.productId;
  const { permissions } = useAuth();
  const queryClient = useQueryClient();
  const [showSimulator, setShowSimulator] = useState(false);

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Produto não encontrado");
      return response.json();
    },
    enabled: !!productId,
  });

  const { data: insumos } = useQuery<ProductInsumo[]>({
    queryKey: [`/api/products/${productId}/compositions`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/compositions`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!productId,
  });

  const { data: composition } = useQuery<ComposicaoDetalhada[]>({
    queryKey: [`/api/products/${productId}/composition`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/composition`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!productId,
  });

  const { data: priceComposition } = useQuery<ComposicaoPreco>({
    queryKey: [`/api/products/${productId}/price-composition`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/price-composition`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!productId,
  });

  const { data: logistics } = useQuery<LogisticaTransporte>({
    queryKey: [`/api/products/${productId}/logistics`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/logistics`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!productId,
  });

  const { data: changeHistory } = useQuery<LogAlteracao[]>({
    queryKey: [`/api/products/${productId}/changes`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/changes`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!productId,
  });

  const { data: logisticsCalculations = [] } = useQuery<any[]>({
    queryKey: [`/api/products/${productId}/logistics-calculations`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/logistics-calculations`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!productId,
  });

  const { data: pricingConfig } = useQuery({
    queryKey: [`pricing-config-${productId}`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/pricing-config`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!productId,
  });

  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-corporate mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do produto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Produto não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-corporate">
                <img src={logoImage} alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Detalhamento do Produto -{" "}
                <span className="text-corporate">{product.code}</span>
              </h1>
            </div>

            {/* Aqui entra o perfil dinâmico */}
            <div className="flex items-center space-x-4">
              <UserProfileBadge />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações Básicas do Produto */}
        <Card className="mb-8 border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
            <h3 className="text-base font-semibold text-blue-700 flex items-center">
              <Search className="text-blue-500 mr-2" size={18} />
              Informações Básicas do Produto
            </h3>
          </div>

          <CardContent className="p-6 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="mr-1">Código:</span>
                  <span className="font-medium text-gray-700">{product.code}</span>
                </p>
              </div>

              {/* Status mais deslocado à direita */}
              <div className="flex items-center justify-end lg:col-span-2">
                <button
                  onClick={() => handleStatusToggle(product.id)}
                  className="focus:outline-none"
                >
                  {product.status === "approved" ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700 shadow-sm hover:shadow-md transition-all">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-600 shadow-sm hover:shadow-md transition-all">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                      Inativo
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Informações principais reformuladas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs text-gray-500 mb-1">Kg Caixa</div>
                <div className="text-lg font-semibold text-gray-900">
                  {logistics?.kgCaixa || "—"}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs text-gray-500 mb-1">Custo por Kg</div>
                <div className="text-lg font-semibold text-gray-900">
                  R$ {priceComposition?.custoConsolidado || product.costPerKg || "0,00"}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs text-gray-500 mb-1">Peso da Unidade</div>
                <div className="text-lg font-semibold text-gray-900">
                  {product.kgPerUnit} kg
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* 1. Insumos do Produto */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Insumos do Produto</h2>
            <InsumoComposition
              productId={product.id}
              onCompositionUpdated={() => {
                queryClient.invalidateQueries({
                  queryKey: [`/api/products/${productId}/compositions`],
                });
                queryClient.invalidateQueries({
                  queryKey: [`/api/products/${productId}/composition`],
                });
              }}
            />
          </div>
          <InputMaterialsSection insumos={insumos || []} productId={productId} />
        </div>

        {/* Custos Fixos */}
        <FixedCostSection />

        {/* 2. Composição Detalhada */}
        <div className="mb-12">
          <DetailedComposition
            composition={composition || []}
            productId={productId}
            userCanEdit={permissions?.canEdit || false}
          />
        </div>

        {/* 3. Configuração de Preço */}
        <div className="mb-12">
          <PricingConfiguration
            productId={parseInt(productId || "0")}
            userCanEdit={permissions?.canEdit || false}
          />

          {/* Botão do Simulador */}
          <div className="flex justify-end mt-4 mb-6">
            <Button
              variant={showSimulator ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSimulator(!showSimulator)}
              className={`
                px-4 py-2 h-9 font-medium transition-all duration-200 shadow-sm
                ${
                  showSimulator
                    ? "bg-corporate hover:bg-corporate/90 text-white border-corporate"
                    : "text-corporate border-corporate hover:bg-corporate/5 hover:text-corporate/90"
                }
              `}
            >
              <Calculator className="h-4 w-4 mr-2" />
              {showSimulator ? "Ocultar Simulador" : "Simulador de Cenários"}
            </Button>
          </div>

          {showSimulator && (
            <div className="mt-6">
              <SimuladorCenarioAvancado
                productId={productId || "0"}
                currentConfig={pricingConfig}
                userCanEdit={permissions?.canEdit || false}
              />
            </div>
          )}
        </div>

        {/* 4. Consolidado */}
        <div className="mb-12">
          <ConsolidatedPriceSection
            totalCost={
              insumos?.reduce((total, insumo) => {
                const peso = parseFloat(insumo.peso || "0");
                const preco = parseFloat(insumo.preco?.toString().replace(",", ".") || "0");
                const rendimento = parseFloat(insumo.rendimento?.toString() || "100") / 100;
                return total + peso * preco / rendimento;
              }, 0) || 15.5
            }
          />
        </div>

        {/* 5. Calculadora de Logística */}
        <div className="mb-12">
          <CalculadoraLogisticaAvancada
            productId={productId || "0"}
            userCanEdit={permissions?.canEdit || false}
          />
        </div>

        {/* 6. Histórico de Cálculos */}
        <div className="mb-12">
          <OrderBreakdownSpreadsheet
            priceComposition={priceComposition || undefined}
            logisticsCalculations={logisticsCalculations}
          />
        </div>

        <div className="mt-8">
          <ExportData productId={parseInt(productId || "0")} />
        </div>

        <div className="mt-12">
          <ChangeHistory changes={changeHistory || []} />
        </div>
      </div>
    </div>
  );
}

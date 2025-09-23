"use client";

import Navigation from "@/components/navigation";
import RealPendencias from "@/components/real-pendencias";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClockAlert, CheckCheck, LaptopMinimal, TrendingUp, BarChart3, Settings, Eye } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";

type Summary = {
  pendentes: number;
  approvalsToday: number;
  productsImpacted: number;
  averageImpactPercent: number; // ex: 14.8
  // campos extras úteis
  criticalPendentes?: number;
  totalValueAffected?: number; // em moeda
  lastUpdated?: string; // ISO
};

export default function PendenciasPage() {
  const [activeView, setActiveView] = useState<"smart" | "config">("smart");
  const { user, permissions } = useAuth();

  const [summary, setSummary] = useState<Summary>({
    pendentes: 0,
    approvalsToday: 0,
    productsImpacted: 0,
    averageImpactPercent: 0,
    criticalPendentes: 0,
    totalValueAffected: 0,
    lastUpdated: new Date().toISOString(),
  });

  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const POLL_INTERVAL_MS = 30000; // 30s - ajustar conforme necessário

  // Formatação simples
  const formatNumber = (v: number) => new Intl.NumberFormat("pt-BR").format(v);
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  const formatPercent = (v: number) => `${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;

  // Busca o resumo do backend (endpoint exemplar)
  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/pendencias/summary");
      if (!res.ok) throw new Error("Erro ao buscar resumo");
      const data = await res.json();
      // Espera receber algo compatível com Summary - adaptar conforme backend
      setSummary((prev) => ({ ...prev, ...data, lastUpdated: new Date().toISOString() }));
    } catch (err) {
      // fallback: mantém valores atuais (ou poderia usar um mock)
      console.warn("fetchSummary falhou:", err);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Polling regular
  useEffect(() => {
    fetchSummary();
    const id = setInterval(() => {
      fetchSummary();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchSummary]);

  // callback que pode ser chamado por RealPendencias para empurrar atualizações
  const handleSummaryUpdate = useCallback((partial: Partial<Summary>) => {
    setSummary((prev) => ({ ...prev, ...partial, lastUpdated: new Date().toISOString() }));
  }, []);

  // Configurável: define os cards dinamicamente a partir do summary
  const cardsConfig = useMemo(() => {
    return [
      {
        key: "pendentes",
        title: "Pendentes",
        value: summary.pendentes,
        subtitle: "Pendências aguardando análise",
        icon: ClockAlert  ,
        color: {
          border: "border-l-orange-500",
          text: "text-orange-600",
        },
        format: (v: number) => formatNumber(v),
      },
      {
        key: "approvalsToday",
        title: "Aprovações",
        value: summary.approvalsToday,
        subtitle: "Aprovações hoje",
        icon: CheckCheck,
        color: {
          border: "border-l-green-500",
          text: "text-green-600",
        },
        format: (v: number) => formatNumber(v),
      },
      {
        key: "productsImpacted",
        title: "Produtos Impactados",
        value: summary.productsImpacted,
        subtitle: "Produtos com pendências no período",
        icon: TrendingUp,
        color: {
          border: "border-l-amber-500",
          text: "text-amber-600",
        },
        format: (v: number) => formatNumber(v),
      },
      {
        key: "averageImpact",
        title: "Impacto Médio",
        value: summary.averageImpactPercent,
        subtitle: "Impacto médio das pendências",
        icon: BarChart3,
        color: {
          border: "border-l-purple-500",
          text: "text-purple-600",
        },
        format: (v: number) => formatPercent(v),
      },
    ];
  }, [summary]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Análise</h1>
            <p className="text-gray-600">Gestão de pendências e aprovações de repasse</p>
            <p className="text-xs text-gray-400 mt-1">
              Última atualização: {new Date(summary.lastUpdated || "").toLocaleString("pt-BR")}
              {loadingSummary ? " — carregando..." : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={activeView === "smart" ? "default" : "outline"}
              onClick={() => setActiveView("smart")}
              className="flex items-center gap-2"
            >
              {user?.userType === "consulta" ? <Eye className="h-4 w-4" /> : <LaptopMinimal className="h-4 w-4" />}
              {user?.userType === "consulta" ? "Consulta" : "Painel Geral"}
            </Button>

            {permissions?.canEdit && (
              <Button
                variant={activeView === "config" ? "default" : "outline"}
                onClick={() => setActiveView("config")}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
            )}
          </div>
        </div>

        {/* Smart Analytics Overview */}
        {activeView === "smart" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {cardsConfig.map((card) => {
                const Icon = card.icon;
                const borderClass = (card.color?.border as string) || "border-l-gray-300";
                const textClass = (card.color?.text as string) || "text-gray-700";

                return (
                  <Card key={card.key} className={`border-l-4 ${borderClass} hover:shadow-lg transition-shadow`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{card.title}</p>
                          <p className={`text-2xl font-bold ${textClass}`}>{card.format(card.value)}</p>
                          <p className="text-xs text-gray-500">{card.subtitle}</p>
                        </div>
                        <Icon className={`h-8 w-8 ${textClass}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Real Pendencias Component - passa callback para empurrar updates */}
            <RealPendencias userCanApprove={permissions?.canApprove || false} onSummaryChange={handleSummaryUpdate} />
          </div>
        )}

        {/* Configuration View */}
        {activeView === "config" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Automação de Aprovações */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Automação de Aprovações</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <label className="text-sm font-medium text-gray-700">Limite para Auto-Aprovação</label>
                      <p className="text-xs text-gray-500 mb-2">
                        Impacto máximo no preço final para aprovação automática
                      </p>
                      <div className="flex items-center gap-2">
                        <input type="range" min="0.1" max="5.0" step="0.1" defaultValue="0.5" className="flex-1" />
                        <span className="text-sm font-medium">0.5%</span>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <label className="text-sm font-medium text-gray-700">Peso Mínimo para Alertas</label>
                      <p className="text-xs text-gray-500 mb-2">
                        Peso mínimo do insumo na composição para gerar alertas
                      </p>
                      <div className="flex items-center gap-2">
                        <input type="range" min="1" max="20" step="1" defaultValue="5" className="flex-1" />
                        <span className="text-sm font-medium">5%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notificações Inteligentes */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notificações</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3" />
                      <span className="text-sm">Notificar aprovações automáticas</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3" />
                      <span className="text-sm">Alertas de tendências de custo</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-3" />
                      <span className="text-sm">Relatórios semanais de economia</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

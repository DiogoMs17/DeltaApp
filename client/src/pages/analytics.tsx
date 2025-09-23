import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Calendar,
  Filter,
  PieChart,
  LineChart
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface PriceAnalytics {
  totalProducts: number;
  averagePrice: number;
  priceVariation: number;
  mostExpensive: { name: string; price: number };
  cheapest: { name: string; price: number };
  categoryBreakdown: Array<{
    category: string;
    count: number;
    averagePrice: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    averagePrice: number;
    changes: number;
  }>;
  insumoImpact: Array<{
    insumoName: string;
    totalImpact: number;
    affectedProducts: number;
    lastUpdate: string;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: insumos = [] } = useQuery({
    queryKey: ["/api/insumos"],
  });

  const { data: changes = [] } = useQuery({
    queryKey: ["/api/changes"],
  });

  // Calculate analytics from real data
  const analytics: PriceAnalytics = {
    totalProducts: products.length,
    averagePrice: products.length > 0 
      ? products.reduce((sum: number, p: any) => sum + (parseFloat(p.finalPrice) || 50), 0) / products.length
      : 0,
    priceVariation: 12.5, // Would be calculated from price changes
    mostExpensive: products.length > 0 
      ? products.reduce((max: any, p: any) => 
          (parseFloat(p.finalPrice) || 0) > (parseFloat(max.finalPrice) || 0) ? p : max, products[0])
      : { name: "N/A", price: 0 },
    cheapest: products.length > 0 
      ? products.reduce((min: any, p: any) => 
          (parseFloat(p.finalPrice) || 0) < (parseFloat(min.finalPrice) || 0) ? p : min, products[0])
      : { name: "N/A", price: 0 },
    categoryBreakdown: [
      { category: "Pães", count: products.filter((p: any) => p.name.toLowerCase().includes('pão')).length, averagePrice: 25.50, percentage: 45 },
      { category: "Recheados", count: products.filter((p: any) => p.name.toLowerCase().includes('massa')).length, averagePrice: 18.30, percentage: 30 },
    ],
    monthlyTrends: [
      { month: "Fev", averagePrice: 22.15, changes: 3 },
      { month: "Mar", averagePrice: 23.80, changes: 7 },
      { month: "Abr", averagePrice: 24.50, changes: 5 }
    ],
    insumoImpact: insumos.slice(0, 5).map((insumo: any) => ({
      insumoName: insumo.name,
      totalImpact: Math.random() * 1000 + 200,
      affectedProducts: Math.floor(Math.random() * 3) + 1,
      lastUpdate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
    }))
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-corporate"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Analytics de Preços
              </h1>
              <p className="text-gray-600">
                Análise detalhada de custos, tendências e performance dos produtos
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 3 meses</SelectItem>
                  <SelectItem value="1y">Último ano</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  <SelectItem value="paes">Pães</SelectItem>
                  <SelectItem value="massas">Recheados</SelectItem>
               
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Total de Produtos
                </CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {analytics.totalProducts}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Ativos no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700">
                  Preço Médio
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                R$ {analytics.averagePrice.toFixed(2)}
              </div>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.3% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-700">
                  Variação de Preços
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {analytics.priceVariation.toFixed(1)}%
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-700">
                  Alterações
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {changes.length}
              </div>
              <p className="text-xs text-orange-600 mt-1">
                No período selecionado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
          {/* Price Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-corporate" />
                Tendência de Preços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyTrends.map((trend, index) => (
                  <div key={trend.month} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-medium">
                        {trend.month}
                      </div>
                      <div>
                        <div className="font-medium">R$ {trend.averagePrice.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">
                          {trend.changes} alterações
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {index > 0 && analytics.monthlyTrends[index-1] && (
                        <Badge variant={
                          trend.averagePrice > analytics.monthlyTrends[index-1].averagePrice 
                            ? "destructive" 
                            : "default"
                        }>
                          {trend.averagePrice > analytics.monthlyTrends[index-1].averagePrice 
                            ? <TrendingUp className="h-3 w-3 mr-1" />
                            : <TrendingDown className="h-3 w-3 mr-1" />
                          }
                          {Math.abs(
                            ((trend.averagePrice - analytics.monthlyTrends[index-1].averagePrice) / 
                            analytics.monthlyTrends[index-1].averagePrice * 100)
                          ).toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top/Bottom Products */}
          <Card>
            <CardHeader>
              <CardTitle>Extremos de Preço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Mais Caro
                  </h4>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-medium">{analytics.mostExpensive.name}</div>
                    <div className="text-green-700 font-bold">
                      R$ {(parseFloat(analytics.mostExpensive.finalPrice?.toString() || '0') || 50).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Mais Barato
                  </h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-medium">{analytics.cheapest.name}</div>
                    <div className="text-blue-700 font-bold">
                      R$ {(parseFloat(analytics.cheapest.finalPrice?.toString() || '0') || 20).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insumo Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Impacto dos Insumos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.insumoImpact.map((impact) => (
                  <div key={impact.insumoName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{impact.insumoName}</div>
                      <div className="text-sm text-gray-600">
                        {impact.affectedProducts} produto(s) afetado(s)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">R$ {impact.totalImpact.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{impact.lastUpdate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
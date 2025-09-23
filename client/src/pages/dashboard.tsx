import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import ProductSearch from "@/components/product-search";
import ProductList from "@/components/product-list";
import InsumoVariationsDashboard from "@/components/insumo-variations-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, TrendingUp, Search, History, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { Product } from "@/lib/types";
import logoImage from "./image (2).png";

interface DashboardStats {
  pendingApprovals: number;
  priceChanges24h: number;
  totalProducts: number;
  avgMargin: number;
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, permissions } = useAuth();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Erro ao buscar produtos");
      }
      return response.json();
    }
  });

  const { data: pendencias = [] } = useQuery({
    queryKey: ["/api/pendencias-repasse"],
    queryFn: async () => {
      const response = await fetch("/api/pendencias-repasse");
      if (!response.ok) return [];
      return response.json();
    }
  });

  const { data: recentChanges = [] } = useQuery({
    queryKey: ["recent-changes"],
    queryFn: async () => {
      const response = await fetch("/api/changes?limit=5");
      if (!response.ok) return [];
      return response.json();
    }
  });

  const filteredProducts = products?.filter(product => 
    product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const pendingCount = pendencias.filter((p: any) => p.status === "pendente").length;
  const todayChanges = recentChanges.filter((c: any) => {
    const changeDate = new Date(c.createdAt);
    const today = new Date();
    return changeDate.toDateString() === today.toDateString();
  }).length;

  const dashboardCards = [
    ...(user?.userType !== 'consulta' ? [{
      title: "Pendências de Repasse",
      value: pendingCount,
      description: "Aprovações pendentes",
      icon: AlertTriangle,
      color: pendingCount > 0 ? "text-red-600" : "text-green-600",
      bgColor: pendingCount > 0 ? "bg-red-50" : "bg-green-50",
      link: "/pendencias",
      urgent: pendingCount > 0
    }] : []),
    {
      title: "Alterações de Preço",
      value: todayChanges,
      description: "Mudanças hoje",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/history"
    },
    {
      title: "Gráficos de Variação",
      value: products?.length || 0,
      description: "Produtos monitorados",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/analytics"
    },
    {
      title: "Consulta de Preços",
      value: "Buscar",
      description: "Pesquisar produtos",
      icon: Search,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      link: "/search",
      isAction: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-6 mb-4">
            {/* Logo */}
            <div className="relative">
              <img 
                src={logoImage} 
                alt="Logo" 
                className="h-16 w-auto drop-shadow-lg hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Title Section */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">
                Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Sistema de Precificação e Gerenciamento de Custos
              </p>
            </div>
          </div>
          <div className="h-1 w-32 bg-gradient-to-r from-corporate to-red-600 rounded-full"></div>
        </div>

        {/* Enhanced Interactive Cards Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {dashboardCards.map((card, index) => (
            <Link key={index} href={card.link}>
              <Card className="hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 hover:bg-white">
                {card.urgent && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" />
                )}
                
                {/* Background gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bgColor.replace('bg-', 'from-')} to-transparent opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-all duration-300 shadow-md`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    {card.urgent && (
                      <Badge variant="destructive" className="text-xs animate-pulse font-medium px-2 py-1">
                        Importante
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors leading-tight">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-200">
                      {card.value}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors font-medium">
                    {card.description}
                  </p>
                  
                  {/* Subtle action hint */}
               
                </CardContent>

                {/* Enhanced hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Border glow effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-corporate/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />
              </Card>
            </Link>
          ))}
        </div>

        {/* Input Cost Variations Dashboard */}
        <InsumoVariationsDashboard />

        {/* Recent Pending Approvals Alert - Only for admin users */}
        {pendingCount > 0 && user?.userType !== 'consulta' && (
          <div className="mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-800">
                    {pendingCount} Pendência{pendingCount > 1 ? 's' : ''} de Repasse
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-red-700 mb-3">
                  Há alterações de custo aguardando sua aprovação. Revise o impacto nos preços finais.
                </p>
                <Link href="/pendencias">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Revisar Pendências
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}



        {/* Search and Product List */}
        <div id="search">
          <ProductSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          <ProductList 
            products={filteredProducts}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

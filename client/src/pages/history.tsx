import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  History, 
  Search, 
  Filter, 
  Calendar,
  User,
  Package,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  Clock,
  Download
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface HistoryItem {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  changeType: string;
  description: string;
  previousValue: string;
  newValue: string;
  createdAt: string;
  status?: string;
  approvedBy?: number;
  approverName?: string;
  rejectedBy?: number;
  rejectionReason?: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("1y");

  const { data: changes = [], isLoading } = useQuery({
    queryKey: ["/api/changes"],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Use only changes data since it already includes approval/rejection logs
  const allHistory: HistoryItem[] = changes.map((change: any) => ({
    ...change,
    userName: change.userName || "Sistema",
    type: "change"
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  // Filter history based on search and filters - only show approvals and rejections
  const filteredHistory = allHistory.filter((item) => {
    // First filter: only show approval and rejection actions
    const isApprovalOrRejection = item.changeType === "approval" || item.changeType === "rejection";
    
    if (!isApprovalOrRejection) return false;

    const matchesSearch = 
      item.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === "all" || item.changeType === filterType;
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "approved" && item.changeType === "approval") ||
      (filterStatus === "rejected" && item.changeType === "rejection") ||
      (filterStatus === "pending" && item.changeType === "pending");

    const matchesDate = (() => {
      const itemDate = new Date(item.createdAt);
      const now = new Date();
      const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
      
      switch (dateRange) {
        case "7d": return diffDays <= 7;
        case "30d": return diffDays <= 30;
        case "90d": return diffDays <= 90;
        case "1y": return diffDays <= 365;
        default: return true;
      }
    })();

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case "price_increase": return "bg-red-100 text-red-800";
      case "price_decrease": return "bg-green-100 text-green-800";
      case "product_creation": return "bg-blue-100 text-blue-800";
      case "product_update": return "bg-yellow-100 text-yellow-800";
      case "approval": return "bg-green-100 text-green-800";
      case "rejection": return "bg-red-100 text-red-800";
      case "insumo_variation_decision": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case "price_increase": return <TrendingUp className="h-4 w-4" />;
      case "price_decrease": return <TrendingDown className="h-4 w-4" />;
      case "product_creation": return <Package className="h-4 w-4" />;
      case "approval": return <Check className="h-4 w-4" />;
      case "rejection": return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (changeType?: string) => {
    switch (changeType) {
      case "approval": return <Check className="h-4 w-4 text-green-600" />;
      case "rejection": return <X className="h-4 w-4 text-red-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return null;
    }
  };

  const exportHistory = () => {
    const csvContent = [
      ["Data", "Produto", "Usuário", "Tipo", "Descrição", "Valor Anterior", "Valor Novo", "Status"].join(","),
      ...filteredHistory.map(item => [
        new Date(item.createdAt).toLocaleDateString('pt-BR'),
        item.productName || "N/A",
        item.userName || "N/A",
        item.changeType,
        item.description,
        item.previousValue || "",
        item.newValue || "",
        item.changeType || "N/A"
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `historico_alteracoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <History className="h-8 w-8 text-corporate" />
                Histórico de Alterações
              </h1>
              <p className="text-gray-600">
                Registro completo de todas as modificações do sistema
              </p>
            </div>
            
            <Button onClick={exportHistory} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por produto, usuário ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de alteração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="price_increase">Aumento de preço</SelectItem>
                  <SelectItem value="price_decrease">Redução de preço</SelectItem>
                  <SelectItem value="product_creation">Criação de produto</SelectItem>
                  <SelectItem value="product_update">Atualização de produto</SelectItem>
                  <SelectItem value="approval">Aprovação</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
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
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Registros</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredHistory.length}</p>
                </div>
                <History className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovações</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredHistory.filter(h => h.changeType === "approval").length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejeições</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredHistory.filter(h => h.changeType === "rejection").length}
                  </p>
                </div>
                <X className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hoje</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredHistory.filter(h => {
                      const today = new Date().toDateString();
                      const itemDate = new Date(h.createdAt).toDateString();
                      return today === itemDate;
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Alterações</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchQuery || filterType !== "all" || filterStatus !== "all" 
                    ? "Nenhum registro encontrado com os filtros aplicados"
                    : "Nenhum registro de alteração encontrado"
                  }
                </p>
                {(searchQuery || filterType !== "all" || filterStatus !== "all") && (
                  <p className="text-sm text-gray-400">
                    Tente ajustar os filtros para ver mais resultados
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0">
                          {getChangeTypeIcon(item.changeType)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getChangeTypeColor(item.changeType)}>
                              {item.changeType === "approval" ? "APROVADO" : 
                               item.changeType === "rejection" ? "REJEITADO" :
                               item.changeType.replace("_", " ").toUpperCase()}
                            </Badge>
                            {item.changeType && getStatusIcon(item.changeType)}
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-1">
                            {item.productName || "Sistema"}
                          </h4>
                          
                          <p className="text-gray-600 text-sm mb-2">
                            {item.description}
                          </p>
                          
                          {(item.previousValue || item.newValue) && (
                            <div className="text-sm text-gray-500 mb-2">
                              {item.previousValue && (
                                <span>Anterior: <span className="font-medium">{item.previousValue}</span></span>
                              )}
                              {item.previousValue && item.newValue && " → "}
                              {item.newValue && (
                                <span>Novo: <span className="font-medium">{item.newValue}</span></span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.userName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.createdAt).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {item.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-700">
                          <strong>Motivo da rejeição:</strong> {item.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
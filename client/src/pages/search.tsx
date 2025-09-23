import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Package, 
  DollarSign, 
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Eye,
  TrendingUp,
  Calendar,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface SearchFilters {
  category: string;
  priceRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function SearchPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<SearchFilters>({
    category: "all",
    priceRange: "all",
    sortBy: "name",
    sortOrder: 'asc'
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: insumos = [] } = useQuery({
    queryKey: ["/api/insumos"],
  });

  // Combine products and insumos for unified search
  const searchableItems = [
    ...products.map((product: any) => ({
      ...product,
      type: 'product',
      searchableText: `${product.code} ${product.name}`.toLowerCase(),
      price: parseFloat(product.finalPrice) || 0,
      category: product.category || 'produto'
    })),
    ...insumos.map((insumo: any) => ({
      ...insumo,
      type: 'insumo',
      searchableText: `${insumo.code} ${insumo.name}`.toLowerCase(),
      price: parseFloat(insumo.finalCostPerKg) || 0,
      category: insumo.category || 'insumo'
    }))
  ];

  // Apply filters and search
  const filteredItems = searchableItems.filter((item) => {
    // Text search
    const matchesSearch = !searchQuery || 
      item.searchableText.includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = filters.category === "all" || 
      item.category.toLowerCase().includes(filters.category.toLowerCase()) ||
      (filters.category === "produtos" && item.type === "product") ||
      (filters.category === "insumos" && item.type === "insumo");

    // Price range filter
    const matchesPriceRange = (() => {
      switch (filters.priceRange) {
        case "low": return item.price < 20;
        case "medium": return item.price >= 20 && item.price < 50;
        case "high": return item.price >= 50;
        default: return true;
      }
    })();

    return matchesSearch && matchesCategory && matchesPriceRange;
  });

  // Sort results
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;
    
    switch (filters.sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "code":
        comparison = a.code.localeCompare(b.code);
        break;
      case "price":
        comparison = a.price - b.price;
        break;
      case "category":
        comparison = a.category.localeCompare(b.category);
        break;
      default:
        comparison = 0;
    }

    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  // Quick search suggestions
  const suggestions = searchQuery.length >= 2 ? 
    searchableItems
      .filter(item => item.searchableText.includes(searchQuery.toLowerCase()))
      .slice(0, 5)
      .map(item => ({ text: item.name, type: item.type }))
    : [];

  // Statistics
  const stats = {
    totalProducts: products.length,
    totalInsumos: insumos.length,
    averageProductPrice: products.length > 0 
      ? products.reduce((sum: number, p: any) => sum + (parseFloat(p.finalPrice) || 0), 0) / products.length
      : 0,
    averageInsumoPrice: insumos.length > 0
      ? insumos.reduce((sum: number, i: any) => sum + (parseFloat(i.finalCostPerKg) || 0), 0) / insumos.length
      : 0
  };

  useEffect(() => {
    // Auto-focus search input on page load
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Search className="h-8 w-8 text-corporate" />
            Busca Avançada
          </h1>
          <p className="text-gray-600">
            Encontre produtos e insumos rapidamente com filtros
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Produtos</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Insumos</p>
                  <p className="text-2xl font-bold text-green-900">{stats.totalInsumos}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Preço Médio Produtos</p>
                  <p className="text-2xl font-bold text-purple-900">R$ {stats.averageProductPrice.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Preço Médio Insumos</p>
                  <p className="text-2xl font-bold text-orange-900">R$ {stats.averageInsumoPrice.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Busca e Filtros
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Main Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search-input"
                  placeholder="Buscar por código ou nome do produto/insumo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-lg"
                />
                
                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setSearchQuery(suggestion.text)}
                      >
                        {suggestion.type === 'product' ? 
                          <Package className="h-4 w-4 text-blue-500" /> : 
                          <BarChart3 className="h-4 w-4 text-green-500" />
                        }
                        {suggestion.text}
                        <Badge variant="outline" className="ml-auto">
                          {suggestion.type === 'product' ? 'Produto' : 'Insumo'}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="produtos">Produtos</SelectItem>
                    <SelectItem value="insumos">Insumos</SelectItem>
                    <SelectItem value="massa">Massa</SelectItem>
                    <SelectItem value="pesadinha">Pesadinha</SelectItem>
                    <SelectItem value="embalagem">Embalagem</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.priceRange} onValueChange={(value) => setFilters({...filters, priceRange: value})}>
                  <SelectTrigger>
                    <DollarSign className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Faixa de preço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os preços</SelectItem>
                    <SelectItem value="low">Até R$ 20</SelectItem>
                    <SelectItem value="medium">R$ 20 - R$ 50</SelectItem>
                    <SelectItem value="high">Acima de R$ 50</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="code">Código</SelectItem>
                    <SelectItem value="price">Preço</SelectItem>
                    <SelectItem value="category">Categoria</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setFilters({...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
                  className="flex items-center gap-2"
                >
                  {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  {filters.sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados ({sortedItems.length})</span>
              {searchQuery && (
                <Badge variant="outline">
                  Busca: "{searchQuery}"
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedItems.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchQuery 
                    ? `Nenhum resultado encontrado para "${searchQuery}"`
                    : "Nenhum item encontrado com os filtros aplicados"
                  }
                </p>
                <p className="text-sm text-gray-400">
                  Tente ajustar os termos de busca ou filtros
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {sortedItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className={
                    viewMode === 'grid' 
                      ? "bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
                      : "bg-white border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  }>
                    <div className={viewMode === 'grid' ? "space-y-4" : "flex items-center justify-between"}>
                      <div className={viewMode === 'grid' ? "" : "flex items-center gap-4 flex-1"}>
                        <div className="flex items-center gap-3 mb-2">
                          {item.type === 'product' ? 
                            <Package className="h-5 w-5 text-blue-500" /> : 
                            <BarChart3 className="h-5 w-5 text-green-500" />
                          }
                          <Badge variant="outline">
                            {item.type === 'product' ? 'Produto' : 'Insumo'}
                          </Badge>
                          <Badge variant="secondary">
                            {item.category}
                          </Badge>
                        </div>
                        
                        <div className={viewMode === 'list' ? "flex-1" : ""}>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.code} - {item.name}
                          </h3>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            {item.type === 'product' ? 'Preço' : 'Custo'}: 
                            <span className="font-medium ml-1">
                              R$ {item.price.toFixed(2)}
                              {item.type === 'insumo' && '/kg'}
                            </span>
                          </div>

                          {item.unit && (
                            <div className="text-xs text-gray-500">
                              Unidade: {item.unit}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className={viewMode === 'grid' ? "pt-4 border-t" : ""}>
                        {item.type === 'product' ? (
                          <Link href={`/product/${item.id}`}>
                            <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Ver Detalhes
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Consulta
                          </Button>
                        )}
                      </div>
                    </div>
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
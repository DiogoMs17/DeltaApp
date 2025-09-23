import { useState } from "react";

import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Search, Package, FileText, Building2, Leaf, BarChart3, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface Insumo {
  id: number;
  code: string;
  name: string;
  purchasePrice: string | null;
  category?: string | null;
  unit?: string | null;
  createdAt: string;
  // Technical sheet fields (simulated for demo)
  supplier?: string;
  brand?: string;
  origin?: string;
  shelfLife?: string;
  storageConditions?: string;
  nutritionalInfo?: {
    proteins?: string;
    carbohydrates?: string;
    fats?: string;
    fiber?: string;
    sodium?: string;
    calories?: string;
  };
  certifications?: string[];
}

// Mock technical data for demonstration
const getMockTechnicalData = (insumo: Insumo) => ({
  supplier: "Moinho Santa Clara",
  brand: "Premium",
  origin: "São Paulo, Brasil",
  shelfLife: "12 meses",
  storageConditions: "Local seco e arejado, temperatura ambiente",
  nutritionalInfo: {
    proteins: "11.5g",
    carbohydrates: "75.2g", 
    fats: "1.2g",
    fiber: "2.8g",
    sodium: "2mg",
    calories: "364 kcal"
  },
});

// Technical Sheet Dialog Component
function TechnicalSheetDialog({ insumo }: { insumo: Insumo }) {
  const techData = getMockTechnicalData(insumo);

  // Fetch products that use this ingredient
  const { data: relatedProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "by-insumo", insumo.id],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/products");
        const products = await response.json();

        // Filter products that use this ingredient
        const productsWithInsumo = [];
        for (const product of products) {
          try {
            const insumoResponse = await apiRequest("GET", `/api/products/${product.id}/insumos`);
            const productInsumos = await insumoResponse.json();
            if (productInsumos.some((pi: any) => pi.id === insumo.id)) {
              productsWithInsumo.push(product);
            }
          } catch (error) {
            // Skip this product if insumos can't be fetched
            continue;
          }
        }
        return productsWithInsumo;
      } catch (error) {
        console.error("Error fetching related products:", error);
        return [];
      }
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 hover:bg-blue-50"
        >
          <Eye className="h-4 w-4" />
          Ver Ficha Técnica
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Ficha Técnica - {insumo.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">Código:</span>
                  <p className="text-gray-900">{insumo.code}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Nome:</span>
                  <p className="text-gray-900">{insumo.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Categoria:</span>
                  <p className="text-gray-900">{insumo.category || 'MASSA'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Unidade:</span>
                  <p className="text-gray-900">{insumo.unit || 'kg'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Fornecedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">Empresa:</span>
                  <p className="text-gray-900">{techData.supplier}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Marca:</span>
                  <p className="text-gray-900">{techData.brand}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Origem:</span>
                  <p className="text-gray-900">{techData.origin}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Validade:</span>
                  <p className="text-gray-900">{techData.shelfLife}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nutritional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Leaf className="h-5 w-5" />
                Tabela Nutricional (por 100g)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Calorias</p>
                  <p className="font-bold text-green-700">{techData.nutritionalInfo.calories}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Proteínas</p>
                  <p className="font-bold text-blue-700">{techData.nutritionalInfo.proteins}</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Carboidratos</p>
                  <p className="font-bold text-yellow-700">{techData.nutritionalInfo.carbohydrates}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Gorduras</p>
                  <p className="font-bold text-purple-700">{techData.nutritionalInfo.fats}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Fibras</p>
                  <p className="font-bold text-orange-700">{techData.nutritionalInfo.fiber}</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Sódio</p>
                  <p className="font-bold text-red-700">{techData.nutritionalInfo.sodium}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Informações de Custo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Valor de Compra */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Valor de Compra</p>
                  <p className="text-xl font-bold text-gray-900">
                    R$ {Number(insumo.purchasePrice || 0).toFixed(2).replace(".", ",")}
                  </p>
                </div>

                {/* Última atualização (ilustrativa por enquanto) */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Data da última atualização</p>
                  <p className="text-xl font-bold text-gray-900">
                    01/09/2025
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Storage and Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Armazenamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{techData.storageConditions}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Produtos Ligados</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="flex items-center gap-2 p-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span className="text-sm text-gray-500">Verificando produtos...</span>
                  </div>
                ) : relatedProducts.length > 0 ? (
                  <div className="space-y-2">
                    {relatedProducts.map((product: any) => (
                      <div key={product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Badge variant="outline" className="font-mono text-xs">
                          {product.code}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Este insumo não está sendo usado em nenhum produto no momento.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function InsumosManagementPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: insumos = [], isLoading } = useQuery({
    queryKey: ["insumos"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/insumos");
      return response.json() as Promise<Insumo[]>;
    }
  });

  const filteredInsumos = insumos.filter(insumo =>
    insumo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    insumo.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.userType === 'consulta' ? 'Consulta de Insumos' : 'Insumos Cadastrados'}
              </h1>
              <p className="text-gray-600">
                {user?.userType === 'consulta' 
                  ? 'Visualize informações sobre materiais e insumos utilizados na produção'
                  : 'Lista de insumos sincronizados automaticamente do banco de dados'
                }
              </p>
            </div>
            {user?.userType === 'consulta' && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                <Eye className="h-3 w-3 mr-1" />
                Somente Leitura
              </Badge>
            )}
          </div>
        </div>

        {/* Busca e Ações */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por código ou nome do insumo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Insumos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Insumos Cadastrados ({filteredInsumos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-corporate mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando insumos...</p>
              </div>
            ) : filteredInsumos.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchQuery ? "Nenhum insumo encontrado" : "Nenhum insumo cadastrado"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInsumos.map((insumo) => (
                  <div
                    key={insumo.id}
                    className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            {insumo.code}
                          </Badge>
                          <h3 className="font-semibold text-gray-900">
                            {insumo.name}
                          </h3>
                        </div>
                        <TechnicalSheetDialog insumo={insumo} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Valor de Compra:</span>
                          <p className="font-medium">
                            {insumo.purchasePrice ? `R$ ${insumo.purchasePrice}` : 'Não informado'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Categoria:</span>
                          <p className="font-medium">
                            {insumo.category || 'Não informado'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Unidade:</span>
                          <p className="font-medium">{insumo.unit || 'Não informado'}</p>
                        </div>
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
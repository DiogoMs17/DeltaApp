import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import AutoFillInsumo from "@/components/auto-fill-insumo";
import ReadOnlyGuard from "@/components/read-only-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package, Eye, Database } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function InsumosPage() {
  const { user, permissions } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: insumos = [], isLoading } = useQuery({
    queryKey: ["/api/insumos"],
  });

  const filteredInsumos = insumos.filter((insumo: any) =>
    insumo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    insumo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.userType === 'consulta' ? 'Consulta de Insumos' : 'Gestão de Insumos'}
              </h1>
              <p className="text-gray-600">
                {user?.userType === 'consulta' 
                  ? 'Visualize informações sobre materiais e insumos utilizados na produção'
                  : 'Consulte informações sobre materiais e insumos utilizados na produção'
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

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-corporate" />
              Pesquisar Insumos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por código ou nome do insumo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Consultation Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-corporate" />
              Consulta de Base de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AutoFillInsumo />
            
            {user?.userType === 'consulta' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <Database className="h-4 w-4 inline mr-2" />
                  Dados sincronizados automaticamente do servidor MySQL externo.
                  As informações são atualizadas em tempo real para consulta.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insumos List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-corporate" />
                Insumos Cadastrados
              </div>
              <Badge variant="secondary">
                {filteredInsumos.length} {filteredInsumos.length === 1 ? 'item' : 'itens'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-corporate"></div>
              </div>
            ) : filteredInsumos.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchQuery ? 'Nenhum insumo encontrado' : 'Nenhum insumo cadastrado'}
                </p>
                {searchQuery && (
                  <p className="text-sm text-gray-400">
                    Tente buscar com termos diferentes
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unidade
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço Compra
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rendimento
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Custo Final/Kg
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInsumos.map((insumo: any) => (
                      <tr key={insumo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-corporate">
                          {insumo.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {insumo.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs">
                            {insumo.category || 'MASSA'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {insumo.unit || 'kg'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          R$ {parseFloat(insumo.purchaseValue || '0').toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {parseFloat(insumo.yieldPercentage || '100').toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                          R$ {parseFloat(insumo.finalCostPerKg || '0').toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Read-only restriction message for consultation users */}
            {user?.userType === 'consulta' && (
              <ReadOnlyGuard>
                <div></div>
              </ReadOnlyGuard>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
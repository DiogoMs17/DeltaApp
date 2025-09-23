import { useState } from "react";
import { PieChart, Settings, Handshake, Building, Calculator, Percent, Receipt, Edit, Save, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ComposicaoDetalhada } from "@/lib/types";

interface DetailedCompositionProps {
  composition: ComposicaoDetalhada[];
  productId?: string;
  userCanEdit?: boolean;
}

export default function DetailedComposition({ composition, productId, userCanEdit = false }: DetailedCompositionProps) {
  const [margemLiquida, setMargemLiquida] = useState("15.0");
  const [isEditingMargem, setIsEditingMargem] = useState(false);
  const [tempMargem, setTempMargem] = useState(margemLiquida);
  const groupedComposition = composition.reduce((acc, item) => {
    if (!acc[item.categoria || 'other']) {
      acc[item.categoria || 'other'] = [];
    }
    acc[item.categoria || 'other'].push(item);
    return acc;
  }, {} as Record<string, ComposicaoDetalhada[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "operational":
        return <Settings className="text-corporate mr-2 text-sm" size={16} />;
      case "sales":
        return <Handshake className="text-corporate mr-2 text-sm" size={16} />;
      case "administrative":
        return <Building className="text-corporate mr-2 text-sm" size={16} />;
      case "financial":
        return <Calculator className="text-corporate mr-2 text-sm" size={16} />;
      default:
        return null;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "operational":
        return "Custos Operacionais";
      case "sales":
        return "Despesas com Vendas";
      case "administrative":
        return "Despesas Administrativas";
      case "financial":
        return "Despesas Financeiras";
      default:
        return category;
    }
  };

  return (
    <Card className="mb-8 shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-corporate rounded-full mr-3"></div>
          <PieChart className="text-corporate mr-2" size={18} />
          Composição Detalhada
        </h3>
      </div>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(groupedComposition).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-md font-semibold text-gray-700 flex items-center">
                {getCategoryIcon(category)}
                {getCategoryTitle(category)}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Descrição</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">R$/Kg</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">R$/Un</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">R$/Cx</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-gray-900">{item.categoria || 'N/A'}</td>
                        <td className="px-3 py-2 text-right text-gray-900">R$ {item.precoKg || '0,00'}</td>
                        <td className="px-3 py-2 text-right text-gray-900">R$ {item.precoUnidade || '0,00'}</td>
                        <td className="px-3 py-2 text-right text-gray-900">R$ {item.precoCaixa || '0,00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Margins and Taxes */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <Percent className="text-corporate mr-2 text-sm" size={16} />
                Margem Líquida
              </div>
              {userCanEdit && !isEditingMargem && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditingMargem(true);
                    setTempMargem(margemLiquida);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Edit size={12} />
                </Button>
              )}
            </h4>
            {isEditingMargem ? (
              <div className="bg-corporate-light p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.001"
                    value={tempMargem}
                    onChange={(e) => setTempMargem(e.target.value)}
                    className="flex-1"
                    placeholder="Margem %"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      setMargemLiquida(tempMargem);
                      setIsEditingMargem(false);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Save size={12} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditingMargem(false);
                      setTempMargem(margemLiquida);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X size={12} />
                  </Button>
                </div>
                <div className="text-sm text-gray-600">Editando margem aplicada</div>
              </div>
            ) : (
              <div className="bg-corporate-light p-4 rounded-lg">
                <div className="text-2xl font-bold text-corporate">{margemLiquida}%</div>
                <div className="text-sm text-gray-600">Margem aplicada</div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-700 flex items-center">
              <Receipt className="text-corporate mr-2 text-sm" size={16} />
              Impostos
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 text-gray-900">ICMS</td>
                    <td className="py-2 text-right text-gray-900">R$ 2,36</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-900">PIS/COFINS</td>
                    <td className="py-2 text-right text-gray-900">R$ 0</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-900">IPI</td>
                    <td className="py-2 text-right text-gray-900">R$ 0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

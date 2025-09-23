import { Tags } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ComposicaoPreco } from "@/lib/types";

interface FinalPriceCompositionProps {
  priceComposition?: ComposicaoPreco;
}

export default function FinalPriceComposition({ priceComposition }: FinalPriceCompositionProps) {
  if (!priceComposition) {
    return (
      <Card className="mb-8 shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            Composição de preço não disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-corporate rounded-full mr-3"></div>
          <Tags className="text-corporate mr-2" size={18} />
          Composição Final do Preço
        </h3>
      </div>
      
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Descrição</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">R$/Kg</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">R$/Un</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">R$/Cx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Custo Insumos</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.inputCostPerKg}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.inputCostPerUnit}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.inputCostPerBox}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Custos Operacionais</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.operationalCostPerKg}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.operationalCostPerUnit}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.operationalCostPerBox}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Despesas Comerciais</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.commercialExpensesPerKg}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.commercialExpensesPerUnit}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.commercialExpensesPerBox}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Impostos</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.taxesPerKg}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.taxesPerUnit}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.taxesPerBox}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Margem Líquida ({priceComposition.marginPercentage}%)</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.marginPerKg}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.marginPerUnit}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">R$ {priceComposition.marginPerBox}</td>
              </tr>
              <tr className="bg-corporate-light border-t-2 border-corporate">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">Preço Final</td>
                <td className="px-6 py-4 text-right text-lg font-bold text-corporate">R$ {priceComposition.finalPricePerKg}</td>
                <td className="px-6 py-4 text-right text-lg font-bold text-corporate">R$ {priceComposition.finalPricePerUnit}</td>
                <td className="px-6 py-4 text-right text-lg font-bold text-corporate">R$ {priceComposition.finalPricePerBox}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

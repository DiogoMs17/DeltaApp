import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react"; // Ícone do Lucide

interface ConsolidatedPriceSectionProps {
  totalCost: number;
}

export default function ConsolidatedPriceSection({ totalCost }: ConsolidatedPriceSectionProps) {
  // Função para formatar valores no padrão brasileiro
  const formatBRL = (value: number, decimals: number = 2) =>
    value.toFixed(decimals).replace(".", ",");

  return (
    <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 shadow-md rounded-2xl">
      <div className="px-6 py-4 border-b border-rose-100 bg-gradient-to-r from-rose-100 to-pink-100 rounded-t-2xl">
           <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <BarChart2 className="w-6 h-6 text-[#e20922] mr-3" />
          Consolidado
        </h3>
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Preço por Kg */}
          <div className="p-5 rounded-xl bg-white border border-rose-100 shadow-sm hover:shadow-md hover:border-[#e20922]/40 transition-all duration-300">
            <div className="text-sm font-medium text-gray-500 mb-1">Preço por Kg</div>
            <div className="text-2xl font-bold text-[#e20922]">
              R$ {formatBRL(totalCost, 2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Calculado pelas informações inseridas</div>
          </div>

          {/* Preço por Unidade */}
          <div className="p-5 rounded-xl bg-white border border-rose-100 shadow-sm hover:shadow-md hover:border-[#e20922]/40 transition-all duration-300">
            <div className="text-sm font-medium text-gray-500 mb-1">Preço por Unidade</div>
            <div className="text-2xl font-bold text-[#e20922]">
              R$ {formatBRL(totalCost * 0.035, 2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Considerando o peso médio da unidade</div>
          </div>

          {/* Preço por Caixa */}
          <div className="p-5 rounded-xl bg-white border border-rose-100 shadow-sm hover:shadow-md hover:border-[#e20922]/40 transition-all duration-300">
            <div className="text-sm font-medium text-gray-500 mb-1">Preço por Caixa</div>
            <div className="text-2xl font-bold text-[#e20922]">
              R$ {formatBRL(totalCost * 1.8, 2)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Considerando o peso Líquido</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

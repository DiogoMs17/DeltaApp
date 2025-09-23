
import { DollarSign, Package, Box, Weight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ComposicaoPreco } from "@/lib/types";

interface ConsolidatedPriceDisplayProps {
  priceComposition?: ComposicaoPreco;
}

export default function ConsolidatedPriceDisplay({ priceComposition }: ConsolidatedPriceDisplayProps) {
  if (!priceComposition) {
    return null;
  }

  return (
    <Card className="mb-8 shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <DollarSign className="text-blue-600 mr-3" size={20} />
          Consolidado - Valores Finais
        </h3>
      </div>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Preço por Kg */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-r border-gray-200 p-8 hover:from-emerald-100 hover:to-emerald-150 transition-all duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500 rounded-full mb-4 shadow-lg">
                <Weight className="text-white" size={24} />
              </div>
              <div className="text-sm font-medium text-emerald-700 uppercase tracking-wide mb-2">
                Preço por Kg
              </div>
              <div className="text-3xl font-bold text-emerald-900 mb-2">
                R$ {priceComposition.precoVendaKg}
              </div>
              <div className="text-xs text-emerald-600 bg-emerald-200/50 px-3 py-1 rounded-full inline-block">
                Base de cálculo
              </div>
            </div>
          </div>

          {/* Preço por Caixa */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-r border-gray-200 md:border-r-0 p-8 hover:from-blue-100 hover:to-blue-150 transition-all duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-4 shadow-lg">
                <Box className="text-white" size={24} />
              </div>
              <div className="text-sm font-medium text-blue-700 uppercase tracking-wide mb-2">
                Preço por Caixa
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">
                R$ {priceComposition.precoVendaCaixa}
              </div>
              <div className="text-xs text-blue-600 bg-blue-200/50 px-3 py-1 rounded-full inline-block">
                Valor comercial
              </div>
            </div>
          </div>

          {/* Preço por Unidade */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 hover:from-purple-100 hover:to-purple-150 transition-all duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full mb-4 shadow-lg">
                <Package className="text-white" size={24} />
              </div>
              <div className="text-sm font-medium text-purple-700 uppercase tracking-wide mb-2">
                Preço por Unidade
              </div>
              <div className="text-3xl font-bold text-purple-900 mb-2">
                R$ {priceComposition.precoVendaUnidade}
              </div>
              <div className="text-xs text-purple-600 bg-purple-200/50 px-3 py-1 rounded-full inline-block">
                Preço unitário
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

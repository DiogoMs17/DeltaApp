import { Package, Wheat, Box, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InputMaterialsSectionProps {
  insumos: any[];
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "PESADINHA":
      return <Scale className="text-corporate mr-2" size={18} />;
    case "MASSA":
      return <Wheat className="text-corporate mr-2" size={18} />;
    case "EMBALAGEM":
      return <Box className="text-corporate mr-2" size={18} />;
    default:
      return <Package className="text-corporate mr-2" size={18} />;
  }
};

const getCategoryTitle = (category: string) => {
  switch (category) {
    case "PESADINHA":
      return "Pesadinha";
    case "MASSA":
      return "Massa";
    case "EMBALAGEM":
      return "Embalagem";
    default:
      return category;
  }
};

// helper para parsear valores numéricos que podem vir com vírgula
const parseNumber = (value: any, fallback: number = 0): number => {
  if (!value) return fallback;
  return parseFloat(value.toString().replace(",", ".")) || fallback;
};

// helper para formatar número com vírgula
const formatNumber = (value: number): string => value.toFixed(2).replace(".", ",");

export default function InputMaterialsSection({ insumos }: InputMaterialsSectionProps) {
  // Agrupar insumos por categoria
  const groupedInsumos = insumos.reduce((acc: any, insumo: any) => {
    const category = insumo.category || "MASSA";
    if (!acc[category]) acc[category] = [];
    acc[category].push(insumo);
    return acc;
  }, {} as Record<string, any[]>);

  // Ordem das categorias
  const categoryOrder = ["MASSA", "PESADINHA", "EMBALAGEM"];
  const orderedCategories = categoryOrder.filter((cat) => groupedInsumos[cat]);

  return (
    <div className="space-y-8">
      {insumos.length === 0 ? (
        <Card className="mb-8 shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="text-center py-8 text-gray-500">
              Nenhum insumo cadastrado para este produto
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {orderedCategories.map((category) => {
            const categoryInsumos = groupedInsumos[category];
            const totalPesoCategoria = categoryInsumos.reduce(
              (sum, i) => sum + parseNumber(i.pesoUsado),
              0
            );
            const totalCustoCategoria = categoryInsumos.reduce((sum, i) => {
              const peso = parseNumber(i.pesoUsado);
              const rendimento = parseNumber(i.rendimentoPercent, 100) / 100;
              const valorCompra = parseNumber(i.purchasePrice);
              const custo = totalPesoCategoria > 0 ? ((peso / rendimento) * valorCompra) / totalPesoCategoria : 0;
              return sum + custo;
            }, 0);

            return (
              <Card key={category} className="mb-8 shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <div className="w-1 h-6 bg-corporate rounded-full mr-3"></div>
                    {getCategoryIcon(category)}
                    {getCategoryTitle(category)}
                  </h3>
                </div>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kg/Un</th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Peso %</th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rend %</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Compra</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Calc.</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {categoryInsumos.map((insumo: any) => {
                          const peso = parseNumber(insumo.pesoUsado);
                          const valorCompra = parseNumber(insumo.purchasePrice);
                          const rendimento = parseNumber(insumo.rendimentoPercent, 100) / 100;
                          const custoCalculado = totalPesoCategoria > 0 ? ((peso / rendimento) * valorCompra) / totalPesoCategoria : 0;
                          const percentualPeso = totalPesoCategoria > 0 ? (peso / totalPesoCategoria) * 100 : 0;

                          return (
                            <tr
                              key={insumo.id}
                              className={`
                                transition-all duration-200
                                hover:bg-red-37
                                hover:shadow-sm
                                cursor-pointer
                                ${parseNumber(insumo.rendimentoPercent, 100) < 70 ? "border-l-4 border-red-400" : ""}
                              `}
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-corporate">{insumo.code}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{insumo.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{formatNumber(peso)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center text-blue-600">{formatNumber(percentualPeso)}%</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-center ${parseNumber(insumo.rendimentoPercent, 100) < 70 ? "text-red-600" : "text-gray-900"}`}>{insumo.rendimentoPercent || "100%"}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">R$ {formatNumber(valorCompra)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">R$ {formatNumber(custoCalculado)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-red-50 text-red-700 font-semibold text-base">
                          <td colSpan={2} className="px-6 py-3 text-left">Total</td>
                          <td className="px-6 py-3 text-center">{formatNumber(totalPesoCategoria)}</td>
                          <td className="px-6 py-3 text-center">100%</td>
                          <td className="px-6 py-3 text-center"></td>
                          <td className="px-6 py-3 text-right"></td>
                          <td className="px-6 py-3 text-right">R$ {formatNumber(totalCustoCategoria)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
}

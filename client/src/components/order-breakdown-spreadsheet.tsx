import { Calculator, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ComposicaoPreco } from "@/lib/types";

interface CalculoLogistica {
  id: number;
  custoPorKg: string;
  modalidadeNome: string;
  createdAt: string;
}

interface OrderBreakdownSpreadsheetProps {
  priceComposition?: ComposicaoPreco;
  logisticsCalculations?: CalculoLogistica[];
}

export default function OrderBreakdownSpreadsheet({
  priceComposition,
  logisticsCalculations = []
}: OrderBreakdownSpreadsheetProps) {
  if (!priceComposition) {
    return null;
  }

  // Cálculo dos valores baseados na composição existente
  const custosMaginais = parseFloat(priceComposition.custoMateriaPrima || "0");
  const custosFixos = parseFloat(priceComposition.percentualOperacional || "0") * parseFloat(priceComposition.precoVendaKg || "0") / 100;
  const totalCustos = custosMaginais + custosFixos;

  const despesas = (parseFloat(priceComposition.percentualVendas || "0") + parseFloat(priceComposition.percentualAdministrativo || "0")) * parseFloat(priceComposition.precoVendaKg || "0") / 100;
  const impostos = parseFloat(priceComposition.percentualFinanceiro || "0") * parseFloat(priceComposition.precoVendaKg || "0") / 100;

  // Usar o cálculo de logística mais recente ou valor padrão
  const ultimoCalculo = logisticsCalculations[0]; // Array vem ordenado por data mais recente
  const logistica = ultimoCalculo ? parseFloat(ultimoCalculo.custoPorKg) : 0.85;
  const margem = parseFloat(priceComposition.margemContribuicao || "0") / 100;

  const precoFinal = parseFloat(priceComposition.precoVendaKg || "0");

  const sections = [
    {
      title: "CUSTOS",
      color: "bg-blue-50 border-blue-200",
      rows: [
        {
          category: "Custos Marginais",
          items: [
            { subcategoria: "Matéria-prima", valor: (custosMaginais * 0.75).toFixed(2) },
            { subcategoria: "Embalagem", valor: (custosMaginais * 0.25).toFixed(2) }
          ]
        },
        {
          category: "Custos Fixos",
          items: [
            { subcategoria: "Mão de obra direta", valor: (custosFixos * 0.35).toFixed(2) },
            { subcategoria: "Energia", valor: (custosFixos * 0.20).toFixed(2) },
            { subcategoria: "Gás", valor: (custosFixos * 0.15).toFixed(2) },
            { subcategoria: "Depreciação", valor: (custosFixos * 0.12).toFixed(2) },
            { subcategoria: "Manutenção", valor: (custosFixos * 0.08).toFixed(2) },
            { subcategoria: "Limpeza", valor: (custosFixos * 0.06).toFixed(2) },
            { subcategoria: "Laboratório", valor: (custosFixos * 0.04).toFixed(2) }
          ]
        }
      ],
      total: totalCustos.toFixed(2)
    },
    {
      title: "DESPESAS",
      color: "bg-amber-50 border-amber-200",
      rows: [
        {
          category: "Gerais Administrativas",
          items: [
            { subcategoria: "Administração geral", valor: (despesas * 0.40).toFixed(2) }
          ]
        },
        {
          category: "Vendas",
          items: [
            { subcategoria: "Contratuais", valor: (despesas * 0.25).toFixed(2) },
            { subcategoria: "Trade Marketing", valor: (despesas * 0.20).toFixed(2) },
            { subcategoria: "Comissões", valor: (despesas * 0.15).toFixed(2) }
          ]
        }
      ],
      total: despesas.toFixed(2)
    },
    {
      title: "LOGÍSTICA",
      color: "bg-green-50 border-green-200",
      rows: [
        {
          category: "Transporte e Armazenagem",
          items: [
            {
              subcategoria: ultimoCalculo ? `${ultimoCalculo.modalidadeNome} (${new Date(ultimoCalculo.createdAt).toLocaleDateString("pt-BR")})` : "Armazenagem",
              valor: logistica.toFixed(4)
            }
          ]
        }
      ],
      total: logistica.toFixed(2)
    },
    {
      title: "IMPOSTOS",
      color: "bg-red-50 border-red-200",
      rows: [
        {
          category: "Tributos",
          items: [
            { subcategoria: "ICMS", valor: (impostos * 0.55).toFixed(2) },
            { subcategoria: "PIS", valor: (impostos * 0.25).toFixed(2) },
            { subcategoria: "COFINS", valor: (impostos * 0.20).toFixed(2) }
          ]
        }
      ],
      total: impostos.toFixed(2)
    }
  ];

  return (
    <Card className="mb-8 shadow-sm border border-gray-300">
      <div className="px-6 py-4 border-b border-gray-300 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calculator className="text-gray-700 mr-3" size={20} />
          Detalhamento do Pedido - Planilha de Custos
        </h3>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-300">
                  Subcategoria
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                  Valor (R$/Kg)
                </th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section, sectionIndex) => (
                <>
                  {section.rows.map((row, rowIndex) => (
                    <>
                      {row.items.map((item, itemIndex) => (
                        <tr
                          key={`${sectionIndex}-${rowIndex}-${itemIndex}`}
                          className={`border-b border-gray-200 hover:bg-gray-50 ${section.color}`}
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-300">
                            {itemIndex === 0 ? row.category : ""}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-300">
                            {item.subcategoria}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-mono">
                            R$ {item.valor}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                  <tr className={`border-b-2 border-gray-400 font-semibold ${section.color}`}>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 border-r border-gray-300" colSpan={2}>
                      Consolidado {section.title}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right font-mono">
                      R$ {section.total}
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fórmula Explícita */}
        <div className="px-6 py-6 bg-slate-50 border-t border-gray-300">
          <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="text-gray-700 mr-2" size={16} />
            Fórmula de Cálculo do Preço Final
          </h4>

          <div className="bg-white p-4 rounded-lg border border-gray-300 font-mono text-sm">
            <div className="text-center mb-3">
              <div className="inline-block">
                <div className="border-b-2 border-gray-900 pb-2 mb-2">
                  (Custos Fixos + Custos Marginais)
                </div>
                <div>
                  1 - (Despesas + Impostos + Margem + Logística)
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-gray-600 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="font-semibold">Custos Totais</div>
                  <div>R$ {totalCustos.toFixed(2)}</div>
                </div>
                <div>
                  <div className="font-semibold">Despesas</div>
                  <div>{((despesas/precoFinal)*100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="font-semibold">Impostos</div>
                  <div>{((impostos/precoFinal)*100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="font-semibold">Logística</div>
                  <div>{((logistica/precoFinal)*100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="font-semibold">Margem</div>
                  <div>{priceComposition.margemContribuicao}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </CardContent>
    </Card>
  );
}
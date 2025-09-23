import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Database, AlertCircle } from "lucide-react";
import { findInsumoByCode } from "@shared/insumos-database";

interface AutoFillInsumoProps {
  onInsumoViewed?: (insumo: any) => void;
}

interface InsumoForm {
  codigo: string;
  descricao: string;
  unidade: string;
  valorCompra: string;
  rendimento: string;
  custoFinalKg: string;
}

export default function AutoFillInsumo({
  onInsumoViewed,
}: AutoFillInsumoProps) {
  const [form, setForm] = useState<InsumoForm>({
    codigo: "",
    descricao: "",
    unidade: "",
    valorCompra: "",
    rendimento: "",
    custoFinalKg: "",
  });

  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const handleCodigoChange = (codigo: string) => {
    setForm((prev) => ({ ...prev, codigo }));

    if (codigo.length >= 4) {
      const insumoFound = findInsumoByCode(codigo);
      if (insumoFound) {
        setForm((prev) => ({
          ...prev,
          descricao: insumoFound.descricao,
          unidade: insumoFound.unidade,
          valorCompra: insumoFound.valor_compra.toFixed(2),
          rendimento: (insumoFound.rendimento_padrao || 100).toString(),
        }));
        setIsAutoFilled(true);
        calculateCustoFinal(
          insumoFound.valor_compra,
          insumoFound.rendimento_padrao || 100,
        );

        if (onInsumoViewed) {
          onInsumoViewed({
            code: codigo,
            name: insumoFound.descricao,
            purchaseValue: insumoFound.valor_compra,
            yieldPercentage: insumoFound.rendimento_padrao || 100,
            finalCostPerKg:
              (insumoFound.valor_compra * 100) /
              (insumoFound.rendimento_padrao || 100),
          });
        }
      } else {
        setIsAutoFilled(false);
        setForm((prev) => ({
          ...prev,
          descricao: "",
          unidade: "",
          valorCompra: "",
          rendimento: "",
          custoFinalKg: "",
        }));
      }
    }
  };

  const calculateCustoFinal = (valorCompra: number, rendimento: number) => {
    const custoFinal = (valorCompra * 100) / rendimento;
    setForm((prev) => ({ ...prev, custoFinalKg: custoFinal.toFixed(2) }));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Consultar Insumos do Servidor MySQL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Consulta apenas
            </span>
          </div>
          <p className="text-sm text-blue-700">
            Os insumos são carregados automaticamente do servidor MySQL. Digite
            o código para visualizar os dados atuais.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="codigo">Código</Label>
              <div className="relative">
                <Input
                  id="codigo"
                  value={form.codigo}
                  onChange={(e) => handleCodigoChange(e.target.value)}
                  placeholder="Ex: 10000"
                  className="pr-10"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              {isAutoFilled && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Dados carregados do servidor
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={form.descricao}
                readOnly
                placeholder="Nome do insumo"
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="unidade">Unidade</Label>
              <Input
                id="unidade"
                value={form.unidade}
                readOnly
                placeholder="kg, litro, dúzia"
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="valorCompra">Valor de Compra (R$)</Label>
              <Input
                id="valorCompra"
                value={form.valorCompra}
                readOnly
                placeholder="0.00"
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="rendimento">Rendimento (%)</Label>
              <Input
                id="rendimento"
                value={form.rendimento}
                readOnly
                placeholder="100"
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="custoFinalKg">Custo Final por Kg (R$)</Label>
              <Input
                id="custoFinalKg"
                value={form.custoFinalKg}
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Calculado automaticamente
              </p>
            </div>

            <div className="flex items-end">
              <div className="w-full p-3 bg-gray-100 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  Dados sincronizados com MySQL
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

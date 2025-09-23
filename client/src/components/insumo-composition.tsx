import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Save, Trash2, Calculator, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface InsumoComposition {
  id?: number;
  insumoId: number;
  code: string;
  name: string;
  pesoUsado: string;
  rendimentoPercent: string;
  valorCompra: number;
  custoCalculado: number;
  isNew?: boolean;
}

interface InsumoCompositionProps {
  productId: number;
  onCompositionUpdated?: () => void;
}

export default function InsumoComposition({
  productId,
  onCompositionUpdated,
}: InsumoCompositionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [compositions, setCompositions] = useState<InsumoComposition[]>([]);
  const [newInsumo, setNewInsumo] = useState({
    code: "",
    pesoUsado: "",
    rendimentoPercent: "100",
  });
  const [foundInsumo, setFoundInsumo] = useState<any>(null);
  const [isSaving, setSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar composições existentes
  const { data: existingCompositions = [], isLoading } = useQuery({
    queryKey: ["product-compositions", productId],
    queryFn: async () => {
      try {
        const response = await apiRequest(
          "GET",
          `/api/products/${productId}/compositions`
        );
        if (response.ok) {
          return await response.json();
        }
        return [];
      } catch (error) {
        console.error("Erro ao buscar composições:", error);
        return [];
      }
    },
    enabled: isDialogOpen,
  });

  // Carregar composições existentes
  useEffect(() => {
    if (existingCompositions.length > 0) {
      const mappedCompositions = existingCompositions.map((comp: any) => ({
        id: comp.id,
        insumoId: comp.insumoId,
        code: comp.code,
        name: comp.name,
        pesoUsado: comp.pesoUsado || "0",
        rendimentoPercent: comp.rendimentoPercent || "100",
        valorCompra: comp.purchasePrice
          ? parseFloat(comp.purchasePrice.replace(",", "."))
          : 0,
        custoCalculado: 0,
        isNew: false,
      }));
      setCompositions(mappedCompositions);
    }
  }, [existingCompositions]);

  // Recalcular custos sempre que composições mudarem
  useEffect(() => {
    calculateAllCosts();
  }, [compositions]);

  const calculateAllCosts = () => {
    const totalPeso = compositions.reduce(
      (sum, comp) => sum + parseNumberBR(comp.pesoUsado || "0"),
      0
    );
    if (totalPeso === 0) return;

    const updatedCompositions = compositions.map((comp) => {
      const peso = parseNumberBR(comp.pesoUsado || "0");
      const rendimento = parseNumberBR(comp.rendimentoPercent || "100") / 100;
      const valorCompra = comp.valorCompra || 0;

      // Fórmula: Custo_kg = (Peso_Usado / Rendimento) * Valor_Compra / Somatório_Peso_Insumos
      const custoCalculado =
        totalPeso > 0
          ? Number((((peso / rendimento) * valorCompra) / totalPeso).toFixed(2))
          : 0;

      return {
        ...comp,
        custoCalculado,
      };
    });

    setCompositions(updatedCompositions);
  };

  const searchInsumo = async (code: string) => {
    if (code.length < 3) {
      setFoundInsumo(null);
      return;
    }

    try {
      const response = await apiRequest(
        "GET",
        `/api/insumos/search?code=${code}`
      );
      if (response.ok) {
        const insumo = await response.json();
        setFoundInsumo(insumo);
      } else {
        setFoundInsumo(null);
      }
    } catch (error) {
      console.error("Erro ao buscar insumo:", error);
      setFoundInsumo(null);
    }
  };

  const addInsumo = () => {
    if (!foundInsumo || !newInsumo.pesoUsado) {
      toast({
        title: "Dados incompletos",
        description: "Informe o código do insumo e o peso usado.",
        variant: "destructive",
      });
      return;
    }

    const exists = compositions.find(
      (comp) => comp.insumoId === foundInsumo.id
    );
    if (exists) {
      toast({
        title: "Insumo já adicionado",
        description: "Este insumo já está na composição do produto.",
        variant: "destructive",
      });
      return;
    }

    const newComposition: InsumoComposition = {
      insumoId: foundInsumo.id,
      code: foundInsumo.code,
      name: foundInsumo.name,
      pesoUsado: newInsumo.pesoUsado.replace(",", "."),
      rendimentoPercent: newInsumo.rendimentoPercent.replace(",", "."),
      valorCompra: foundInsumo.purchasePrice
        ? parseFloat(foundInsumo.purchasePrice.replace(",", "."))
        : 0,
      custoCalculado: 0,
      isNew: true,
    };

    setCompositions((prev) => [...prev, newComposition]);

    setNewInsumo({
      code: "",
      pesoUsado: "",
      rendimentoPercent: "100",
    });
    setFoundInsumo(null);
  };

  const updateComposition = (
    index: number,
    field: keyof InsumoComposition,
    value: string
  ) => {
    setCompositions((prev) =>
      prev.map((comp, i) => (i === index ? { ...comp, [field]: value } : comp))
    );
  };

  const removeComposition = (index: number) => {
    setCompositions((prev) => prev.filter((_, i) => i !== index));
  };

  const saveCompositions = async () => {
    if (compositions.length === 0) {
      toast({
        title: "Nenhuma composição",
        description: "Adicione pelo menos um insumo à composição.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const compositionData = compositions.map((comp) => ({
        insumoId: comp.insumoId,
        pesoUsado: parseNumberBR(comp.pesoUsado.toString()),
        rendimentoPercent: parseNumberBR(comp.rendimentoPercent.toString()),
      }));

      const response = await apiRequest(
        "POST",
        `/api/products/${productId}/compositions`,
        { compositions: compositionData }
      );

      if (response.ok) {
        toast({
          title: "Composição salva com sucesso!",
          description: "A composição do produto foi atualizada.",
        });

        queryClient.invalidateQueries({
          queryKey: ["product-compositions", productId],
        });
        queryClient.invalidateQueries({
          queryKey: ["products", productId, "insumos"],
        });

        if (onCompositionUpdated) {
          onCompositionUpdated();
        }

        setIsDialogOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao salvar composição");
      }
    } catch (error) {
      console.error("Erro ao salvar composição:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a composição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number | string) => {
    if (typeof value === "string") return `R$ ${value}`;
    const formatted = value.toString().replace(".", ",");
    return `R$ ${formatted}`;
  };

  const formatNumber = (value: number) => Number(value).toFixed(2).replace(".", ",");

  const parseNumberBR = (value: string) => parseFloat(value.replace(",", "."));

  const totalCusto = compositions.reduce(
    (sum, comp) => sum + comp.custoCalculado,
    0
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Adicionar Insumo
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-6 w-6" />
            Composição de Insumos - Cálculo Automático
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[calc(90vh-120px)]">
          {/* Form de Adição */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Adicionar Novo Insumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Código do Insumo *</label>
                  <Input
                    value={newInsumo.code}
                    onChange={(e) => {
                      setNewInsumo((prev) => ({ ...prev, code: e.target.value }));
                      searchInsumo(e.target.value);
                    }}
                    placeholder="Ex: F001"
                    className="mt-1"
                  />
                  {foundInsumo && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-sm text-green-700 font-medium">
                        ✓ Insumo encontrado:
                      </p>
                      <p className="text-sm text-green-600">
                        <strong>{foundInsumo.name}</strong>
                      </p>
                      <p className="text-sm text-green-600">
                        Valor de compra: {formatCurrency(foundInsumo.purchasePrice || "0")}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Peso Usado (kg) *</label>
                  <Input
                    type="text"
                    value={newInsumo.pesoUsado}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9,]/g, "");
                      setNewInsumo((prev) => ({ ...prev, pesoUsado: value }));
                    }}
                    placeholder="Ex: 1,5"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Rendimento (%)</label>
                  <Input
                    type="text"
                    value={newInsumo.rendimentoPercent}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9,]/g, "");
                      setNewInsumo((prev) => ({ ...prev, rendimentoPercent: value }));
                    }}
                    placeholder="100"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={addInsumo}
                    disabled={!foundInsumo || !newInsumo.pesoUsado}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Composições */}
          <div className="flex-1 overflow-auto">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" /> Insumos na Composição ({compositions.length})
                  </CardTitle>
                  <Badge variant="outline" className="text-lg font-bold">
                    Total: {formatCurrency(totalCusto)}/kg
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando composições...</p>
                  </div>
                ) : compositions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum insumo adicionado à composição
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="grid grid-cols-8 gap-2 text-sm font-medium text-gray-700 border-b pb-2">
                      <div>Código</div>
                      <div className="col-span-2">Nome</div>
                      <div>Kg/Un</div>
                      <div>Rend. (%)</div>
                      <div>Val. Compra</div>
                      <div>Custo Calc.</div>
                      <div>Ações</div>
                    </div>

                    {/* Rows */}
                    {compositions.map((comp, index) => (
                      <div
                        key={`${comp.insumoId}-${index}`}
                        className="grid grid-cols-8 gap-2 py-2 border-b hover:bg-gray-50"
                      >
                        <div className="text-sm font-mono">{comp.code}</div>
                        <div className="col-span-2 text-sm">{comp.name}</div>
                        <div>
                          <Input
                            type="text"
                            value={comp.pesoUsado.toString().replace(".", ",")}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9,]/g, "");
                              updateComposition(index, "pesoUsado", value.replace(",", "."));
                            }}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Input
                            type="text"
                            value={comp.rendimentoPercent.toString().replace(".", ",")}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9,]/g, "");
                              updateComposition(index, "rendimentoPercent", value.replace(",", "."));
                            }}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="text-sm text-right py-2">
                          {formatCurrency(comp.valorCompra)}
                        </div>
                        <div className="text-sm text-right font-medium py-2">
                          {formatCurrency(comp.custoCalculado)}
                        </div>
                        <div>
                          <Button
                            onClick={() => removeComposition(index)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <strong>Fórmula:</strong> Custo = ((Peso ÷ Rendimento) × Valor Compra) ÷ Total Peso
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={saveCompositions}
                disabled={isSaving || compositions.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? "Salvando..." : "Salvar Composição"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

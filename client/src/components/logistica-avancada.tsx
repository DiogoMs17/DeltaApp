import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Truck, Save, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ModalidadeTransporte {
  id: number;
  nome: string;
  cubagem: string;
  custoBasePorKm?: string;
  isActive: boolean;
}

interface NovaModalidade {
  nome: string;
  cubagem: string;
  custoBasePorKm: string;
}

export default function LogisticaAvancada() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNovaModalidade, setShowNovaModalidade] = useState(false);
  const [novaModalidade, setNovaModalidade] = useState<NovaModalidade>({
    nome: "",
    cubagem: "",
    custoBasePorKm: ""
  });

  const { data: modalidades = [] } = useQuery({
    queryKey: ["modalidades-transporte"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/modalidades-transporte");
      return res.json() as Promise<ModalidadeTransporte[]>;
    }
  });

  const criarModalidadeMutation = useMutation({
    mutationFn: async (modalidade: NovaModalidade) => {
      const res = await apiRequest("POST", "/api/modalidades-transporte", modalidade);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Modalidade criada com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["modalidades-transporte"] });
      setNovaModalidade({ nome: "", cubagem: "", custoBasePorKm: "" });
      // ATENÇÃO: não fecha o formulário!
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao criar modalidade", variant: "destructive" });
    }
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Truck className="h-5 w-5" /> Logística e Transporte
          </span>
          {!showNovaModalidade && (
            <Button size="sm" variant="outline" onClick={() => setShowNovaModalidade(true)}>
              Criar Modalidade
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Formulário nova modalidade */}
        {showNovaModalidade && (
          <div className="border rounded-lg p-4 bg-gray-50 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => setShowNovaModalidade(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h4 className="font-medium mb-4">Nova Modalidade</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label>Nome</Label>
                <Input
                  value={novaModalidade.nome}
                  onChange={(e) =>
                    setNovaModalidade(prev => ({ ...prev, nome: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Cubagem (m³)</Label>
                <Input
                  type="number"
                  value={novaModalidade.cubagem}
                  onChange={(e) =>
                    setNovaModalidade(prev => ({ ...prev, cubagem: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Custo Base por Km (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novaModalidade.custoBasePorKm}
                  onChange={(e) =>
                    setNovaModalidade(prev => ({ ...prev, custoBasePorKm: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => criarModalidadeMutation.mutate(novaModalidade)}
                  disabled={
                    !novaModalidade.nome ||
                    !novaModalidade.cubagem ||
                    !novaModalidade.custoBasePorKm
                  }
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" /> Salvar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de modalidades existentes */}
        <div>
          <h4 className="font-medium mb-2">Modalidades Criadas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {modalidades.filter(m => m.isActive).map(modalidade => (
              <div
                key={modalidade.id}
                className="p-3 border rounded-md flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{modalidade.nome}</div>
                  <div className="text-sm text-gray-600">
                    {modalidade.cubagem} m³ | R$ {modalidade.custoBasePorKm}/km
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

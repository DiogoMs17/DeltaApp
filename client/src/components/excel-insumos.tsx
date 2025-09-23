import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, Trash2, Download, Upload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface InsumoRow {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  purchasePrice: string;
  quantity: string;
  isNew: boolean;
  hasErrors: boolean;
}

interface ExcelInsumosProps {
  onInsumosAdded?: () => void;
}

const CATEGORIES = [
  { value: "MASSA", label: "Massa" },
  { value: "PESADINHA", label: "Pesadinha" },
  { value: "EMBALAGEM", label: "Embalagem" },
];

const UNITS = [
  { value: "kg", label: "Quilogramas (kg)" },
  { value: "g", label: "Gramas (g)" },
  { value: "l", label: "Litros (l)" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "un", label: "Unidades (un)" },
  { value: "cx", label: "Caixas (cx)" }
];

export default function ExcelInsumos({ onInsumosAdded }: ExcelInsumosProps) {
  const [rows, setRows] = useState<InsumoRow[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const { toast } = useToast();
  const tableRef = useRef<HTMLDivElement>(null);

  // Inicializar com algumas linhas vazias
  useEffect(() => {
    if (rows.length === 0) {
      addNewRows(5);
    }
  }, []);

  const generateId = () => `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addNewRows = (count: number = 1) => {
    const newRows: InsumoRow[] = [];
    for (let i = 0; i < count; i++) {
      newRows.push({
        id: generateId(),
        code: "",
        name: "",
        category: "MASSA",
        unit: "kg",
        purchasePrice: "",
        quantity: "",
        isNew: true,
        hasErrors: false
      });
    }
    setRows(prev => [...prev, ...newRows]);
  };

  const updateRow = (id: string, field: keyof InsumoRow, value: string) => {
    setRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        // Validar se a linha tem dados obrigatórios
        const hasRequiredData = updatedRow.code.trim() && updatedRow.name.trim() && updatedRow.purchasePrice.trim();
        updatedRow.hasErrors = updatedRow.code.trim() !== '' && !hasRequiredData;
        
        return updatedRow;
      }
      return row;
    }));
  };

  const deleteRow = (id: string) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  const validateRows = () => {
    const filledRows = rows.filter(row => 
      row.code.trim() || row.name.trim() || row.purchasePrice.trim() || row.quantity.trim()
    );

    const invalidRows = filledRows.filter(row => 
      !row.code.trim() || !row.name.trim() || !row.purchasePrice.trim() || isNaN(Number(row.purchasePrice))
    );

    if (invalidRows.length > 0) {
      toast({
        title: "Dados incompletos",
        description: `${invalidRows.length} linha(s) com dados obrigatórios em falta ou inválidos.`,
        variant: "destructive"
      });
      return false;
    }

    if (filledRows.length === 0) {
      toast({
        title: "Nenhum dado preenchido",
        description: "Preencha ao menos um insumo para salvar.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const saveInsumos = async () => {
    if (!validateRows()) return;

    setSaving(true);
    
    try {
      const filledRows = rows.filter(row => 
        row.code.trim() && row.name.trim() && row.purchasePrice.trim()
      );

      let savedCount = 0;
      let errorCount = 0;

      for (const row of filledRows) {
        try {
          const insumoData = {
            code: row.code.trim(),
            name: row.name.trim(),
            category: row.category,
            unit: row.unit,
            purchasePrice: row.purchasePrice.trim()
          };

          const response = await apiRequest("POST", "/api/insumos", insumoData);
          
          if (response.ok) {
            savedCount++;
          } else {
            errorCount++;
            console.error(`Erro ao salvar insumo ${row.code}:`, await response.text());
          }
        } catch (error) {
          errorCount++;
          console.error(`Erro ao salvar insumo ${row.code}:`, error);
        }
      }

      if (savedCount > 0) {
        toast({
          title: "Insumos salvos com sucesso!",
          description: `${savedCount} insumo(s) adicionado(s) ao sistema.`,
        });

        // Limpar linhas salvas e adicionar novas linhas vazias
        setRows([]);
        setTimeout(() => addNewRows(5), 100);

        if (onInsumosAdded) {
          onInsumosAdded();
        }
      }

      if (errorCount > 0) {
        toast({
          title: "Alguns insumos não foram salvos",
          description: `${errorCount} insumo(s) tiveram erro ao salvar.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error("Erro geral ao salvar insumos:", error);
      toast({
        title: "Erro ao salvar insumos",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    const filledRows = rows.filter(row => 
      row.code.trim() || row.name.trim() || row.purchasePrice.trim() || row.quantity.trim()
    );

    if (filledRows.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Preencha alguns insumos primeiro.",
        variant: "destructive"
      });
      return;
    }

    const headers = "Código,Nome,Categoria,Unidade,Preço de Compra,Quantidade\n";
    const csvContent = filledRows.map(row => 
      `"${row.code}","${row.name}","${row.category}","${row.unit}","${row.purchasePrice}","${row.quantity}"`
    ).join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `insumos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowId: string, field: keyof InsumoRow) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      
      const currentIndex = rows.findIndex(row => row.id === rowId);
      const fields: (keyof InsumoRow)[] = ['code', 'name', 'category', 'unit', 'purchasePrice', 'quantity'];
      const currentFieldIndex = fields.indexOf(field);
      
      let nextRowIndex = currentIndex;
      let nextFieldIndex = currentFieldIndex + 1;
      
      if (nextFieldIndex >= fields.length) {
        nextRowIndex = currentIndex + 1;
        nextFieldIndex = 0;
        
        // Se chegou na última linha, adicionar nova linha
        if (nextRowIndex >= rows.length) {
          addNewRows(1);
        }
      }
      
      // Focar no próximo campo
      setTimeout(() => {
        const nextField = fields[nextFieldIndex];
        const nextInput = document.querySelector(`[data-row="${rows[nextRowIndex]?.id}"][data-field="${nextField}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 50);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4" />
          Inserir Insumos (Excel)
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-6 w-6" />
            Inserção de Insumos - Estilo Planilha
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full max-h-[calc(90vh-120px)]">
          {/* Toolbar */}
          <div className="flex items-center gap-2 pb-4 border-b">
            <Button 
              onClick={() => addNewRows(5)} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar 5 Linhas
            </Button>
            
            <Button 
              onClick={exportToCSV} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            
            <div className="flex-1" />
            
            <Badge variant="outline" className="text-sm">
              {rows.filter(row => row.code.trim() || row.name.trim()).length} linha(s) preenchida(s)
            </Badge>
            
            <Button 
              onClick={saveInsumos} 
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Salvando..." : "Salvar Todos"}
            </Button>
          </div>
          
          {/* Table */}
          <div className="flex-1 overflow-auto" ref={tableRef}>
            <div className="min-w-full">
              {/* Header */}
              <div className="grid grid-cols-7 gap-2 p-2 bg-gray-50 border-b font-medium text-sm text-gray-700 sticky top-0">
                <div className="text-center">#</div>
                <div>Código *</div>
                <div>Nome *</div>
                <div>Categoria</div>
                <div>Unidade</div>
                <div>Preço Compra *</div>
                <div>Quantidade</div>
              </div>
              
              {/* Rows */}
              <div className="space-y-1 p-2">
                {rows.map((row, index) => (
                  <div 
                    key={row.id} 
                    className={`grid grid-cols-7 gap-2 p-2 rounded ${
                      row.hasErrors ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Row Number + Delete */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{index + 1}</span>
                      {rows.length > 1 && (
                        <Button
                          onClick={() => deleteRow(row.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Code */}
                    <Input
                      data-row={row.id}
                      data-field="code"
                      value={row.code}
                      onChange={(e) => updateRow(row.id, 'code', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row.id, 'code')}
                      placeholder="Ex: F001"
                      className="h-8 text-sm"
                    />
                    
                    {/* Name */}
                    <Input
                      data-row={row.id}
                      data-field="name"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row.id, 'name')}
                      placeholder="Ex: Farinha de Trigo"
                      className="h-8 text-sm"
                    />
                    
                    {/* Category */}
                    <Select value={row.category} onValueChange={(value) => updateRow(row.id, 'category', value)}>
                      <SelectTrigger className="h-8 text-sm" data-row={row.id} data-field="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Unit */}
                    <Select value={row.unit} onValueChange={(value) => updateRow(row.id, 'unit', value)}>
                      <SelectTrigger className="h-8 text-sm" data-row={row.id} data-field="unit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Purchase Price */}
                    <Input
                      data-row={row.id}
                      data-field="purchasePrice"
                      value={row.purchasePrice}
                      onChange={(e) => updateRow(row.id, 'purchasePrice', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row.id, 'purchasePrice')}
                      placeholder="Ex: 1.50"
                      type="number"
                      step="0.01"
                      className="h-8 text-sm"
                    />
                    
                    {/* Quantity */}
                    <Input
                      data-row={row.id}
                      data-field="quantity"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row.id, 'quantity')}
                      placeholder="Ex: 25"
                      type="number"
                      step="0.01"
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="pt-4 border-t text-sm text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Dicas:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Use Tab ou Enter para navegar entre os campos</li>
                  <li>Campos marcados com * são obrigatórios</li>
                  <li>Preço deve ser em formato decimal (ex: 1.50)</li>
                </ul>
              </div>
              <div>
                <strong>Atalhos:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Tab/Enter: Próximo campo</li>
                  <li>Ctrl+S: Salvar (em breve)</li>
                  <li>Ctrl+E: Exportar CSV (em breve)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
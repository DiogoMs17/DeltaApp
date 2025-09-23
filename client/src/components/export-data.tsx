import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Database, Filter, DatabaseBackup } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportDataProps {
  productId?: number;
  currentFilters?: any;
}

interface ExportOptions {
  format: "csv" | "json" | "excel";
  tables: {
    products: boolean;
    insumos: boolean;
    pendencias: boolean;
    historico: boolean;
    configuracoes: boolean;
    logistica: boolean;
  };
  includeFiltered: boolean;
}

export default function ExportData({ productId, currentFilters }: ExportDataProps) {
  const { toast } = useToast();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "csv",
    tables: {
      products: true,
      insumos: true,
      pendencias: false,
      historico: false,
      configuracoes: false,
      logistica: false,
    },
    includeFiltered: false,
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleTableToggle = (table: keyof ExportOptions["tables"], checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      tables: { ...prev.tables, [table]: checked }
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const selectedTables = Object.entries(exportOptions.tables)
        .filter(([_, selected]) => selected)
        .map(([table]) => table);

      if (selectedTables.length === 0) {
        toast({
          title: "Erro",
          description: "Selecione pelo menos uma tabela para exportar",
          variant: "destructive",
        });
        return;
      }

      const exportParams = new URLSearchParams({
        format: exportOptions.format,
        tables: selectedTables.join(","),
        includeFiltered: exportOptions.includeFiltered.toString(),
        ...(productId && { productId: productId.toString() }),
        ...(currentFilters && { filters: JSON.stringify(currentFilters) }),
      });

      // Criar download via fetch
      const response = await fetch(`/api/export?${exportParams}`);
      
      if (!response.ok) {
        throw new Error("Erro ao exportar dados");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[:]/g, "-");
      const extension = exportOptions.format === "excel" ? "xlsx" : exportOptions.format;
      a.download = `dados-sistema-${timestamp}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso",
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar dados",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch(`/api/reports/structured?productId=${productId || ""}`);
      
      if (!response.ok) {
        throw new Error("Erro ao gerar relatório");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[:]/g, "-");
      a.download = `relatorio-estruturado-${timestamp}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Sucesso",
        description: "Relatório gerado com sucesso",
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportação de Dados
        </CardTitle>
        <p className="text-sm text-gray-600">
          Exporte dados do sistema para análise externa ou backup.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formato de Exportação */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Formato</label>
          <Select
            value={exportOptions.format}
            onValueChange={(value: "csv" | "json" | "excel") => 
              setExportOptions(prev => ({ ...prev, format: value }))
            }
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV (Excel compatível)</SelectItem>
              <SelectItem value="json">JSON (Programadores)</SelectItem>
              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Seleção de Tabelas */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Dados para Exportar</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries({
              products: "Produtos",
              insumos: "Insumos",
              pendencias: "Pendências de Repasse",
              historico: "Histórico de Alterações",
              configuracoes: "Configurações de Preço",
              logistica: "Dados Logísticos",
            }).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={exportOptions.tables[key as keyof ExportOptions["tables"]]}
                  onCheckedChange={(checked) => 
                    handleTableToggle(key as keyof ExportOptions["tables"], checked as boolean)
                  }
                />
                <label htmlFor={key} className="text-sm">{label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Opções Avançadas */}
        {currentFilters && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeFiltered"
                checked={exportOptions.includeFiltered}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeFiltered: checked as boolean }))
                }
              />
              <label htmlFor="includeFiltered" className="text-sm">
                <Filter className="h-4 w-4 inline mr-1" />
                Exportar apenas dados filtrados na tela
              </label>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-corporate hover:bg-corporate/90 flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exportando..." : "Exportar Dados"}
          </Button>

          <Button
            onClick={handleGenerateReport}
            disabled={isExporting}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <FileText className="h-4 w-4 mr-2" />
            Relatório Estruturado
          </Button>

          <Button
            onClick={() => {
              const data = {
                timestamp: new Date().toISOString(),
                productId,
                filters: currentFilters,
                exportOptions
              };
              
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `backup-configuracao-${new Date().toISOString().slice(0, 10)}.json`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);

              toast({
                title: "Sucesso",
                description: "Configuração de backup salva",
              });
            }}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <DatabaseBackup className="h-4 w-4 mr-2" />
            Backup Config
          </Button>
        </div>

        {/* Informações Adicionais */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• CSV: Ideal para Excel e análise de dados</p>
          <p>• JSON: Formato técnico para desenvolvedores</p>
          <p>• Excel: Planilhas formatadas com múltiplas abas</p>
          <p>• Relatório Estruturado: Dashboards prontos para Power BI</p>
        </div>
      </CardContent>
    </Card>
  );
}
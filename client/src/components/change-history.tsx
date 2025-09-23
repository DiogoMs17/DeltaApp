import { History, Edit, AlertTriangle, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LogAlteracao } from "@/lib/types";

interface ChangeHistoryProps {
  changes: LogAlteracao[];
}

export default function ChangeHistory({ changes }: ChangeHistoryProps) {
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "price_change":
      case "yield_change":
        return (
          <div className="w-10 h-10 bg-corporate rounded-full flex items-center justify-center">
            <Edit className="text-white text-sm" size={16} />
          </div>
        );
      case "approval":
        return (
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="text-white text-sm" size={16} />
          </div>
        );
      case "rejection":
        return (
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-white text-sm" size={16} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-white text-sm" size={16} />
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-corporate rounded-full mr-3"></div>
          <History className="text-corporate mr-2" size={18} />
          Histórico de Alterações
        </h3>
      </div>
      
      <CardContent className="p-6">
        {changes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma alteração registrada
          </div>
        ) : (
          <div className="space-y-6">
            {changes.map((change) => (
              <div key={change.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getChangeIcon(change.changeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {change.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {change.createdAt ? formatDate(change.createdAt.toString()) : ''}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {change.previousValue && change.newValue && (
                      <>
                        <span className="font-medium">Valor anterior:</span> {change.previousValue} →
                        <span className="font-medium text-corporate"> Valor atual:</span> {change.newValue}
                        <br />
                      </>
                    )}
                    <span className="font-medium">Usuário:</span> ID {change.userId}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

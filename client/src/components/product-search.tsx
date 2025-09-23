import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface ProductSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ProductSearch({ searchQuery, onSearchChange }: ProductSearchProps) {
  return (
    <Card className="mb-8 shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="w-1 h-6 bg-corporate rounded-full mr-3"></div>
          Buscar Produtos
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Digite o código ou nome do produto..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate focus:border-corporate transition-colors"
            />
          </div>
          <Button className="bg-corporate hover:bg-corporate-dark text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
            <Search className="mr-2" size={16} />
            Buscar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
            <Plus className="mr-2" size={16} />
            Novo Produto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { DollarSign, Zap, Wrench, HardHat } from "lucide-react";

interface CustoFixoSimples {
  nome: string;
  valor: string;
  icone: JSX.Element;
  cor: string;
}

const initialCustos: CustoFixoSimples[] = [
  { nome: "Mão de Obra Direta", valor: "1,01", icone: <HardHat size={18} />, cor: "text-green-500" },
  { nome: "Energia Elétrica", valor: "0,88", icone: <Zap size={18} />, cor: "text-yellow-500" },
  { nome: "Depreciação", valor: "0,22", icone: <DollarSign size={18} />, cor: "text-gray-400" },
  { nome: "Manut., Limpeza, Laboratório", valor: "0,66", icone: <Wrench size={18} />, cor: "text-orange-400" },
];

interface Props {
  userRole: "admin" | "consulta";
}

export default function FixedCostSectionLinesEditable({ userRole }: Props) {
  const [custosFixos, setCustosFixos] = useState<CustoFixoSimples[]>(initialCustos);
  const [isEditing, setIsEditing] = useState(false);
  const userCanEdit = userRole === "admin";

  const handleChange = (index: number, newValue: string) => {
    if (!userCanEdit || !isEditing) return;
    const updated = [...custosFixos];
    updated[index].valor = newValue;
    setCustosFixos(updated);
  };

  const handleCancel = () => {
    setCustosFixos(initialCustos);
    setIsEditing(false);
  };

  const handleSave = () => {
    // Lógica para salvar os dados, se necessário
    setIsEditing(false);
  };

  const totalCustos = custosFixos.reduce(
    (sum, c) => sum + (parseFloat(c.valor.replace(/\./g, "").replace(",", ".")) || 0),
    0
  );

  return (
    <div className="mb-8 bg-white border border-gray-200 rounded-md p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-1 h-6 bg-corporate rounded-full mr-3"></div>
          <DollarSign className="text-corporate mr-2" size={20} />
          Custos Fixos
        </h3>
        {userCanEdit && (
          <button onClick={() => setIsEditing(!isEditing)} className="text-blue-500">
            {isEditing ? "Cancelar" : "Editar"}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {custosFixos.map((custo, i) => (
          <div key={custo.nome} className="flex justify-between items-center text-gray-700 hover:bg-gray-50 transition-colors rounded-sm px-2 py-1">
            <div className="flex items-center gap-2">
              <span className={`${custo.cor} flex-shrink-0`}>{custo.icone}</span>
              <span>{custo.nome}</span>
            </div>
            {userCanEdit && isEditing ? (
              <input
                type="text"
                value={custo.valor}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-20 text-right font-medium text-gray-900 bg-transparent px-1 focus:outline-none"
              />
            ) : (
              <span className="w-20 text-right font-medium text-gray-500">{custo.valor}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-2 border-t border-gray-200 flex justify-between items-center">
        <span className="font-semibold text-base text-gray-700">Total de Custos Fixos</span>
        <span className="font-bold text-gray-900">
          R$ {totalCustos.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
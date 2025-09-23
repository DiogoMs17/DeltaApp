// Database de insumos para preenchimento automático
export interface InsumoDatabase {
  codigo: string;
  descricao: string;
  unidade: string;
  valor_compra: number;
  rendimento_padrao?: number;
}

export const insumosDatabase: InsumoDatabase[] = [
  {
    codigo: "10000",
    descricao: "Farinha de Trigo Especial",
    unidade: "kg",
    valor_compra: 2.70,
    rendimento_padrao: 95
  },
  {
    codigo: "10001",
    descricao: "Farinha de Trigo Comum",
    unidade: "kg",
    valor_compra: 2.45,
    rendimento_padrao: 95
  },
  {
    codigo: "20000",
    descricao: "Fermento Biológico Fresco",
    unidade: "kg",
    valor_compra: 8.20,
    rendimento_padrao: 100
  },
  {
    codigo: "20001",
    descricao: "Fermento Seco Instantâneo",
    unidade: "kg",
    valor_compra: 12.50,
    rendimento_padrao: 100
  },
  {
    codigo: "30000",
    descricao: "Sal Refinado",
    unidade: "kg",
    valor_compra: 2.10,
    rendimento_padrao: 100
  },
  {
    codigo: "40000",
    descricao: "Açúcar Cristal",
    unidade: "kg",
    valor_compra: 4.80,
    rendimento_padrao: 100
  },
  {
    codigo: "40001",
    descricao: "Açúcar Refinado",
    unidade: "kg",
    valor_compra: 5.20,
    rendimento_padrao: 100
  },
  {
    codigo: "50000",
    descricao: "Óleo de Soja",
    unidade: "litro",
    valor_compra: 6.40,
    rendimento_padrao: 100
  },
  {
    codigo: "50001",
    descricao: "Margarina",
    unidade: "kg",
    valor_compra: 8.90,
    rendimento_padrao: 98
  },
  {
    codigo: "60000",
    descricao: "Leite em Pó",
    unidade: "kg",
    valor_compra: 18.50,
    rendimento_padrao: 100
  },
  {
    codigo: "60001",
    descricao: "Ovos",
    unidade: "dúzia",
    valor_compra: 9.20,
    rendimento_padrao: 95
  },
  {
    codigo: "70000",
    descricao: "Melhorador de Farinha",
    unidade: "kg",
    valor_compra: 15.80,
    rendimento_padrao: 100
  }
];

export function findInsumoByCode(codigo: string): InsumoDatabase | undefined {
  return insumosDatabase.find(insumo => insumo.codigo === codigo);
}
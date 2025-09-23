// Re-export types from shared schema
export type {
  Administrator,
  InsertAdministrator,
  Product,
  InsertProduct,
  Insumo,
  InsertInsumo,
  ComposicaoDetalhada,
  ComposicaoPreco,
  LogisticaTransporte,
  LogAlteracao,
} from "@shared/schema";

// Additional frontend-specific types
export interface ProductInsumo {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  purchaseValue: string;
  yieldPercentage: string;
  finalCostPerKg: string;
  createdAt: Date;
  productId?: number;
}

export interface LoginResponse {
  success: boolean;
  administrator?: any;
  message?: string;
}

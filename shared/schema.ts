import { z } from "zod";
import { pgTable, serial, varchar, text, decimal, boolean, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// PostgreSQL Drizzle Tables
export const administrators = pgTable("administrators", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  accessCode: varchar("access_code", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true),
  userType: varchar("user_type", { length: 50 }).default("editor"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  kgPerUnit: decimal("kg_per_unit", { precision: 10, scale: 3 }),
  costPerKg: decimal("cost_per_kg", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("approved"),
  caixasPorPalete: integer("caixas_por_palete").default(0),
  pesoLiquidoPorCaixa: decimal("peso_liquido_por_caixa", { precision: 10, scale: 3 }),
  comprimentoCaixa: decimal("comprimento_caixa", { precision: 10, scale: 2 }),
  larguraCaixa: decimal("largura_caixa", { precision: 10, scale: 2 }),
  alturaCaixa: decimal("altura_caixa", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insumos = pgTable("insumos", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  unit: varchar("unit", { length: 20 }),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productInsumos = pgTable("product_insumos", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  insumoId: integer("insumo_id").references(() => insumos.id),
  quantity: decimal("quantity", { precision: 10, scale: 4 }),
  pesoUsado: decimal("peso_usado", { precision: 10, scale: 4 }),
  rendimentoPercent: decimal("rendimento_percent", { precision: 5, scale: 2 }).default("100.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const composicaoDetalhada = pgTable("composicao_detalhada", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  categoria: varchar("categoria", { length: 100 }),
  custoOperacional: decimal("custo_operacional", { precision: 10, scale: 2 }),
  custoVendas: decimal("custo_vendas", { precision: 10, scale: 2 }),
  custoAdministrativo: decimal("custo_administrativo", { precision: 10, scale: 2 }),
  custoFinanceiro: decimal("custo_financeiro", { precision: 10, scale: 2 }),
  totalCustos: decimal("total_custos", { precision: 10, scale: 2 }),
  precoKg: decimal("preco_kg", { precision: 10, scale: 2 }),
  precoUnidade: decimal("preco_unidade", { precision: 10, scale: 2 }),
  precoCaixa: decimal("preco_caixa", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const composicaoPreco = pgTable("composicao_preco", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  custoMateriaPrima: decimal("custo_materia_prima", { precision: 10, scale: 2 }),
  percentualOperacional: decimal("percentual_operacional", { precision: 5, scale: 2 }),
  percentualVendas: decimal("percentual_vendas", { precision: 5, scale: 2 }),
  percentualAdministrativo: decimal("percentual_administrativo", { precision: 5, scale: 2 }),
  percentualFinanceiro: decimal("percentual_financeiro", { precision: 5, scale: 2 }),
  margemContribuicao: decimal("margem_contribuicao", { precision: 5, scale: 2 }),
  precoVendaKg: decimal("preco_venda_kg", { precision: 10, scale: 2 }),
  precoVendaUnidade: decimal("preco_venda_unidade", { precision: 10, scale: 2 }),
  precoVendaCaixa: decimal("preco_venda_caixa", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const logisticaTransporte = pgTable("logistica_transporte", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  tipoTransporte: varchar("tipo_transporte", { length: 100 }),
  valorTransporte: decimal("valor_transporte", { precision: 10, scale: 2 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const logAlteracoes = pgTable("log_alteracoes", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  userId: integer("user_id").references(() => administrators.id),
  changeType: varchar("change_type", { length: 100 }),
  description: text("description"),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  insumoId: integer("insumo_id").references(() => insumos.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pendenciasRepasse = pgTable("pendencias_repasse", {
  id: serial("id").primaryKey(),
  insumoId: integer("insumo_id").references(() => insumos.id),
  productId: integer("product_id").references(() => products.id),
  valorAnterior: decimal("valor_anterior", { precision: 10, scale: 2 }),
  valorNovo: decimal("valor_novo", { precision: 10, scale: 2 }),
  percentualVariacao: decimal("percentual_variacao", { precision: 5, scale: 2 }),
  impactoNoPreco: decimal("impacto_no_preco", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("pendente"),
  userId: integer("user_id").references(() => administrators.id),
  approvedBy: integer("approved_by").references(() => administrators.id),
  rejectedBy: integer("rejected_by").references(() => administrators.id),
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
});

export const logisticaModalidades = pgTable("logistica_modalidades", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  valorFixo: decimal("valor_fixo", { precision: 10, scale: 2 }),
  tipo: varchar("tipo", { length: 50 }),
  cubagemMaxima: decimal("cubagem_maxima", { precision: 10, scale: 3 }),
  capacidadePaletes: integer("capacidade_paletes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => administrators.id),
  canApprove: boolean("can_approve").default(false),
  canEdit: boolean("can_edit").default(false),
  canView: boolean("can_view").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pricingConfiguration = pgTable("pricing_configuration", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  margemMinimaPermitida: decimal("margem_minima_permitida", { precision: 5, scale: 2 }),
  autoApprovalThreshold: decimal("auto_approval_threshold", { precision: 5, scale: 2 }),
  requiresApprovalAbove: decimal("requires_approval_above", { precision: 5, scale: 2 }),
  updatedBy: integer("updated_by").references(() => administrators.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const simulacoesCenario = pgTable("simulacoes_cenario", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  nome: varchar("nome", { length: 255 }),
  configuracao: json("configuracao"),
  precoSimulado: decimal("preco_simulado", { precision: 10, scale: 2 }),
  userId: integer("user_id").references(() => administrators.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calculosLogistica = pgTable("calculos_logistica", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  modalidadeId: integer("modalidade_id").references(() => logisticaModalidades.id),
  quantidadeTransportada: decimal("quantidade_transportada", { precision: 10, scale: 2 }),
  custoLogistica: decimal("custo_logistica", { precision: 10, scale: 2 }),
  userId: integer("user_id").references(() => administrators.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insumoVariacoes = pgTable("insumo_variacoes", {
  id: serial("id").primaryKey(),
  insumoId: integer("insumo_id").references(() => insumos.id),
  valorAnterior: decimal("valor_anterior", { precision: 10, scale: 2 }),
  valorNovo: decimal("valor_novo", { precision: 10, scale: 2 }),
  percentualVariacao: decimal("percentual_variacao", { precision: 5, scale: 2 }),
  impactoNoPreco: decimal("impacto_no_preco", { precision: 10, scale: 2 }),
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedBy: integer("acknowledged_by").references(() => administrators.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const custosFixos = pgTable("custos_fixos", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  tipo: text("tipo").notNull(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type definitions (inferring from table schemas)
export type Administrator = typeof administrators.$inferSelect;
export type ProductBase = typeof products.$inferSelect;
export type Insumo = typeof insumos.$inferSelect;

// Product estendido com campos calculados
export interface Product extends ProductBase {
  cubagemCaixa?: number;  // Cubagem calculada em m³
  tipo?: string;          // Tipo baseado na cubagem (pequeno/médio/grande)
  isActive?: boolean;     // Status ativo baseado em status = "approved"
}
export type ProductInsumo = typeof productInsumos.$inferSelect;
export type ComposicaoDetalhada = typeof composicaoDetalhada.$inferSelect;
export type ComposicaoPreco = typeof composicaoPreco.$inferSelect;
export type LogisticaTransporte = typeof logisticaTransporte.$inferSelect;
export type LogAlteracao = typeof logAlteracoes.$inferSelect;
export type PendenciaRepasse = typeof pendenciasRepasse.$inferSelect;
export type LogisticaModalidade = typeof logisticaModalidades.$inferSelect;
export type UserPermission = typeof userPermissions.$inferSelect;
export type PricingConfiguration = typeof pricingConfiguration.$inferSelect;
export type SimulacaoCenario = typeof simulacoesCenario.$inferSelect;
export type CalculoLogistica = typeof calculosLogistica.$inferSelect;
export type InsumoVariacao = typeof insumoVariacoes.$inferSelect;
export type CustoFixo = typeof custosFixos.$inferSelect;

// Insert schemas using drizzle-zod
export const insertAdministratorSchema = createInsertSchema(administrators);
export const insertProductSchema = createInsertSchema(products);
export const insertInsumoSchema = createInsertSchema(insumos);
export const insertPendenciaRepasseSchema = createInsertSchema(pendenciasRepasse);
export const insertLogisticaModalidadeSchema = createInsertSchema(logisticaModalidades);

// Type inference
export type InsertAdministrator = typeof administrators.$inferInsert;
export type InsertProduct = typeof products.$inferInsert;
export type InsertInsumo = typeof insumos.$inferInsert;
export type InsertPendenciaRepasse = typeof pendenciasRepasse.$inferInsert;
export type InsertLogisticaModalidade = typeof logisticaModalidades.$inferInsert;

// Legacy type definitions for compatibility
export interface AdministratorLegacy {
  id: number;
  name: string;
  accessCode: string;
  isActive: boolean;
  userType: string;
  createdAt: Date;
}

export interface ProductLegacy {
  id: number;
  code: string;
  name: string;
  category: string;
  kgPerUnit: string;
  yieldPercentage: string;
  purchaseValue: string;
  costPerKg: string;
  status: string;
  caixasPorPalete: number;
  pesoLiquidoPorCaixa: string;
  comprimentoCaixa: string;
  larguraCaixa: string;
  alturaCaixa: string;
  createdAt: Date;
}

export interface InsumoLegacy {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  purchaseValue: string;
  yieldPercentage: string;
  finalCostPerKg: string;
  createdAt: Date;
}
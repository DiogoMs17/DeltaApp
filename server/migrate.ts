import { db } from './db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import {
  administrators,
  products,
  insumos,
  productInsumos,
  composicaoDetalhada,
  composicaoPreco,
  logisticaTransporte,
  logAlteracoes,
  pendenciasRepasse,
  logisticaModalidades,
  userPermissions,
  pricingConfiguration,
  simulacoesCenario,
  calculosLogistica,
  insumoVariacoes
} from '@shared/schema';

interface DatabaseData {
  administrators: any[];
  products: any[];
  insumos: any[];
  productInsumos: any[];
  composicaoDetalhada: any[];
  composicaoPreco: any[];
  logisticaTransporte: any[];
  logAlteracoes: any[];
  pendenciasRepasse: any[];
  logisticaModalidades: any[];
  simulacoesCenario: any[];
  calculosLogistica: any[];
  pedidos: any[];
  statusAprovacaoMargem: any[];
  userPermissions: any[];
  pricingConfiguration: any[];
  insumoVariacoes: any[];
}

export async function createTables() {
  console.log('Creating tables...');
  
  try {
    // Create tables using Drizzle - this is safe and handles existing tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "administrators" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "access_code" varchar(100) NOT NULL,
        "is_active" boolean DEFAULT true,
        "user_type" varchar(50) DEFAULT 'editor',
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" serial PRIMARY KEY NOT NULL,
        "code" varchar(50) NOT NULL,
        "name" varchar(255) NOT NULL,
        "category" varchar(100),
        "kg_per_unit" decimal(10,4),
        "yield_percentage" decimal(5,2),
        "purchase_value" decimal(10,2),
        "cost_per_kg" decimal(10,2),
        "status" varchar(20) DEFAULT 'approved',
        "caixas_por_palete" integer DEFAULT 0,
        "peso_liquido_por_caixa" decimal(10,3),
        "comprimento_caixa" decimal(10,2),
        "largura_caixa" decimal(10,2),
        "altura_caixa" decimal(10,2),
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "insumos" (
        "id" serial PRIMARY KEY NOT NULL,
        "code" varchar(50) NOT NULL,
        "name" varchar(255) NOT NULL,
        "category" varchar(100) DEFAULT 'MASSA',
        "unit" varchar(20) DEFAULT 'kg',
        "purchase_price" decimal(10,4),
        "yield_percentage" decimal(5,2),
        "final_cost_per_kg" decimal(10,4),
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "product_insumos" (
        "id" serial PRIMARY KEY NOT NULL,
        "product_id" integer REFERENCES "products"("id"),
        "insumo_id" integer REFERENCES "insumos"("id"),
        "quantity" decimal(10,4),
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "composicao_detalhada" (
        "id" serial PRIMARY KEY NOT NULL,
        "product_id" integer REFERENCES "products"("id"),
        "categoria" varchar(100),
        "custo_operacional" decimal(10,2),
        "custo_vendas" decimal(10,2),
        "custo_administrativo" decimal(10,2),
        "custo_financeiro" decimal(10,2),
        "total_custos" decimal(10,2),
        "preco_kg" decimal(10,2),
        "preco_unidade" decimal(10,2),
        "preco_caixa" decimal(10,2),
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "composicao_preco" (
        "id" serial PRIMARY KEY NOT NULL,
        "product_id" integer REFERENCES "products"("id"),
        "custo_materia_prima" decimal(10,2),
        "percentual_operacional" decimal(5,2),
        "percentual_vendas" decimal(5,2),
        "percentual_administrativo" decimal(5,2),
        "percentual_financeiro" decimal(5,2),
        "margem_contribuicao" decimal(5,2),
        "preco_venda_kg" decimal(10,2),
        "preco_venda_unidade" decimal(10,2),
        "preco_venda_caixa" decimal(10,2),
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "logistica_transporte" (
        "id" serial PRIMARY KEY NOT NULL,
        "product_id" integer REFERENCES "products"("id"),
        "tipo_transporte" varchar(100),
        "valor_transporte" decimal(10,2),
        "observacoes" text,
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "log_alteracoes" (
        "id" serial PRIMARY KEY NOT NULL,
        "product_id" integer REFERENCES "products"("id"),
        "user_id" integer REFERENCES "administrators"("id"),
        "change_type" varchar(100),
        "description" text,
        "previous_value" text,
        "new_value" text,
        "insumo_id" integer REFERENCES "insumos"("id"),
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "pendencias_repasse" (
        "id" serial PRIMARY KEY NOT NULL,
        "insumo_id" integer REFERENCES "insumos"("id"),
        "product_id" integer REFERENCES "products"("id"),
        "valor_anterior" decimal(10,2),
        "valor_novo" decimal(10,2),
        "percentual_variacao" decimal(5,2),
        "impacto_no_preco" decimal(10,2),
        "status" varchar(20) DEFAULT 'pendente',
        "user_id" integer REFERENCES "administrators"("id"),
        "approved_by" integer REFERENCES "administrators"("id"),
        "rejected_by" integer REFERENCES "administrators"("id"),
        "created_at" timestamp DEFAULT now(),
        "approved_at" timestamp,
        "rejected_at" timestamp
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "logistica_modalidades" (
        "id" serial PRIMARY KEY NOT NULL,
        "nome" varchar(100) NOT NULL,
        "valor_fixo" decimal(10,2),
        "tipo" varchar(50),
        "cubagem_maxima" decimal(10,3),
        "capacidade_paletes" integer,
        "ativo" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user_permissions" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer REFERENCES "administrators"("id"),
        "can_approve" boolean DEFAULT false,
        "can_edit" boolean DEFAULT false,
        "can_view" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "pricing_configuration" (
        "id" serial PRIMARY KEY NOT NULL,
        "product_id" integer REFERENCES "products"("id"),
        "margem_minima_permitida" decimal(5,2),
        "auto_approval_threshold" decimal(5,2),
        "requires_approval_above" decimal(5,2),
        "updated_by" integer REFERENCES "administrators"("id"),
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "simulacoes_cenario" (
        "id" serial PRIMARY KEY NOT NULL,
        "product_id" integer REFERENCES "products"("id"),
        "nome" varchar(255),
        "configuracao" json,
        "preco_simulado" decimal(10,2),
        "user_id" integer REFERENCES "administrators"("id"),
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "calculos_logistica" (
        "id" serial PRIMARY KEY NOT NULL,
        "product_id" integer REFERENCES "products"("id"),
        "modalidade_id" integer REFERENCES "logistica_modalidades"("id"),
        "quantidade_transportada" decimal(10,2),
        "custo_logistica" decimal(10,2),
        "user_id" integer REFERENCES "administrators"("id"),
        "created_at" timestamp DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "insumo_variacoes" (
        "id" serial PRIMARY KEY NOT NULL,
        "insumo_id" integer REFERENCES "insumos"("id"),
        "valor_anterior" decimal(10,2),
        "valor_novo" decimal(10,2),
        "percentual_variacao" decimal(5,2),
        "impacto_no_preco" decimal(10,2),
        "acknowledged" boolean DEFAULT false,
        "acknowledged_by" integer REFERENCES "administrators"("id"),
        "acknowledged_at" timestamp,
        "created_at" timestamp DEFAULT now()
      );
    `);

    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

export async function migrateJsonData() {
  console.log('🔄 Starting JSON data migration...');
  
  try {
    const dataPath = path.join(process.cwd(), 'database-export.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const jsonData: DatabaseData = JSON.parse(fileContent);

    // Helper function to convert string numbers to actual numbers
    const parseNumber = (val: any) => {
      if (val === null || val === undefined || val === '') return null;
      const num = parseFloat(val.toString());
      return isNaN(num) ? null : num;
    };

    // Helper function to convert string booleans to actual booleans
    const parseBool = (val: any) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true' || val === '1' || val === 1) return true;
      if (val === 'false' || val === '0' || val === 0) return false;
      return val;
    };

    // 1. Migrate Administrators
    console.log('Migrating administrators...');
    for (const admin of jsonData.administrators) {
      try {
        await db.insert(administrators).values({
          name: admin.name.trim(), // Remove newlines
          accessCode: admin.accessCode,
          isActive: parseBool(admin.isActive),
          userType: admin.userType || 'editor',
        }).onConflictDoNothing();
      } catch (error) {
        console.warn(`Skipping admin ${admin.name}:`, error);
      }
    }

    // 2. Migrate Products  
    console.log('Migrating products...');
    for (const product of jsonData.products) {
      await db.insert(products).values({
        code: product.code,
        name: product.name,
        category: product.category,
        kgPerUnit: parseNumber(product.kgPerUnit)?.toString(),
        yieldPercentage: parseNumber(product.yieldPercentage)?.toString(),
        purchaseValue: parseNumber(product.purchaseValue)?.toString(),
        costPerKg: parseNumber(product.costPerKg)?.toString(),
        status: product.status || 'approved',
        caixasPorPalete: product.caixasPorPalete || 0,
        pesoLiquidoPorCaixa: parseNumber(product.pesoLiquidoPorCaixa)?.toString(),
        comprimentoCaixa: parseNumber(product.comprimentoCaixa)?.toString(),
        larguraCaixa: parseNumber(product.larguraCaixa)?.toString(),
        alturaCaixa: parseNumber(product.alturaCaixa)?.toString(),
        createdAt: new Date(product.createdAt)
      }).onConflictDoNothing();
    }

    // 3. Migrate Insumos
    console.log('Migrating insumos...');
    for (const insumo of jsonData.insumos) {
      await db.insert(insumos).values({
        code: insumo.code,
        name: insumo.name,
        category: insumo.category || 'MASSA',
        unit: insumo.unit || 'kg',
        purchasePrice: parseNumber(insumo.purchasePrice || insumo.purchaseValue)?.toString(),
        yieldPercentage: parseNumber(insumo.yieldPercentage)?.toString(),
        finalCostPerKg: parseNumber(insumo.finalCostPerKg)?.toString(),
        createdAt: new Date(insumo.createdAt)
      }).onConflictDoNothing();
    }

    // 4. Migrate Product-Insumo associations
    console.log('Migrating product-insumo associations...');
    for (const assoc of jsonData.productInsumos || []) {
      await db.insert(productInsumos).values({
        productId: assoc.productId,
        insumoId: assoc.insumoId,
        quantity: parseNumber(assoc.quantity)?.toString(),
        createdAt: new Date(assoc.createdAt)
      }).onConflictDoNothing();
    }

    // 5. Migrate Pendências
    console.log('Migrating pendências...');
    for (const pendencia of jsonData.pendenciasRepasse || []) {
      await db.insert(pendenciasRepasse).values({
        insumoId: pendencia.insumoId,
        productId: pendencia.productId,
        valorAnterior: parseNumber(pendencia.valorAnterior)?.toString(),
        valorNovo: parseNumber(pendencia.valorNovo)?.toString(),
        percentualVariacao: parseNumber(pendencia.percentualVariacao)?.toString(),
        impactoNoPreco: parseNumber(pendencia.impactoNoPreco)?.toString(),
        status: pendencia.status || 'pendente',
        userId: pendencia.userId,
        approvedBy: pendencia.approvedBy,
        rejectedBy: pendencia.rejectedBy,
        createdAt: new Date(pendencia.createdAt),
        approvedAt: pendencia.approvedAt ? new Date(pendencia.approvedAt) : null,
        rejectedAt: pendencia.rejectedAt ? new Date(pendencia.rejectedAt) : null
      }).onConflictDoNothing();
    }

    // 6. Migrate Log Alterações
    console.log('Migrating log alterações...');
    for (const log of jsonData.logAlteracoes || []) {
      await db.insert(logAlteracoes).values({
        productId: log.productId,
        userId: log.userId,
        changeType: log.changeType,
        description: log.description,
        previousValue: log.previousValue,
        newValue: log.newValue,
        insumoId: log.insumoId,
        createdAt: new Date(log.createdAt)
      }).onConflictDoNothing();
    }

    // 7. Migrate Logística Modalidades
    console.log('Migrating logística modalidades...');
    for (const modalidade of jsonData.logisticaModalidades || []) {
      await db.insert(logisticaModalidades).values({
        nome: modalidade.nome,
        valorFixo: parseNumber(modalidade.valorFixo)?.toString(),
        tipo: modalidade.tipo,
        cubagemMaxima: parseNumber(modalidade.cubagemMaxima)?.toString(),
        capacidadePaletes: modalidade.capacidadePaletes,
        ativo: parseBool(modalidade.ativo),
        createdAt: new Date(modalidade.createdAt)
      }).onConflictDoNothing();
    }

    // 8. Migrate Insumo Variações
    console.log('Migrating insumo variações...');
    for (const variacao of jsonData.insumoVariacoes || []) {
      await db.insert(insumoVariacoes).values({
        insumoId: variacao.insumoId,
        valorAnterior: parseNumber(variacao.valorAnterior)?.toString(),
        valorNovo: parseNumber(variacao.valorNovo)?.toString(),
        percentualVariacao: parseNumber(variacao.percentualVariacao)?.toString(),
        impactoNoPreco: parseNumber(variacao.impactoNoPreco)?.toString(),
        acknowledged: parseBool(variacao.acknowledged),
        acknowledgedBy: variacao.acknowledgedBy,
        acknowledgedAt: variacao.acknowledgedAt ? new Date(variacao.acknowledgedAt) : null,
        createdAt: new Date(variacao.createdAt)
      }).onConflictDoNothing();
    }

    console.log('✅ JSON data migration completed successfully');
  } catch (error) {
    console.error('❌ Error migrating JSON data:', error);
    throw error;
  }
}

export async function runMigration() {
  try {
    await createTables();
    await migrateJsonData();
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}
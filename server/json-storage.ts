import fs from 'fs';
import path from 'path';
import { IStorage } from './storage.js';
import {
  type Administrator,
  type InsertAdministrator,
  type Product,
  type InsertProduct,
  type Insumo,
  type InsertInsumo,
  type ComposicaoDetalhada,
  type ComposicaoPreco,
  type LogisticaTransporte,
  type LogAlteracao,
  type UserPermission,
  type PricingConfiguration,
} from "@shared/schema";

interface DatabaseData {
  administrators: Administrator[];
  products: Product[];
  insumos: Insumo[];
  productInsumos: any[];
  composicaoDetalhada: ComposicaoDetalhada[];
  composicaoPreco: ComposicaoPreco[];
  logisticaTransporte: LogisticaTransporte[];
  logAlteracoes: LogAlteracao[];
  pendenciasRepasse: any[];
  logisticaModalidades: any[];
  simulacoesCenario: any[];
  calculosLogistica: any[];
  pedidos: any[];
  statusAprovacaoMargem: any[];
  userPermissions: UserPermission[];
  pricingConfiguration: PricingConfiguration[];
  insumoVariacoes?: any[];
}

export class JsonStorage implements IStorage {
  private dataPath: string;
  private data: DatabaseData = {
    administrators: [],
    products: [],
    insumos: [],
    productInsumos: [],
    composicaoDetalhada: [],
    composicaoPreco: [],
    logisticaTransporte: [],
    logAlteracoes: [],
    pendenciasRepasse: [],
    logisticaModalidades: [],
    simulacoesCenario: [],
    calculosLogistica: [],
    pedidos: [],
    statusAprovacaoMargem: [],
    userPermissions: [],
    pricingConfiguration: [],
    insumoVariacoes: [],
  };

  constructor() {
    this.dataPath = path.join(process.cwd(), 'database-export.json');
    this.loadData();
  }

  private loadData(): void {
    try {
      const fileContent = fs.readFileSync(this.dataPath, 'utf-8');
      this.data = JSON.parse(fileContent);

      // Update existing insumos with category and unit if they don't have them
      this.data.insumos = this.data.insumos.map((insumo: any) => ({
        ...insumo,
        category: insumo.category || 'MASSA',
        unit: insumo.unit || 'kg'
      }));

      this.saveData();
    } catch (error) {
      console.error('Error loading JSON data:', error);
      this.data = {
        administrators: [],
        products: [],
        insumos: [],
        productInsumos: [],
        composicaoDetalhada: [],
        composicaoPreco: [],
        logisticaTransporte: [],
        logAlteracoes: [],
        pendenciasRepasse: [],
        logisticaModalidades: [],
        simulacoesCenario: [],
        calculosLogistica: [],
        pedidos: [],
        statusAprovacaoMargem: [],
        userPermissions: [],
        pricingConfiguration: [],
      };
    }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving JSON data:', error);
    }
  }

  private getNextId(table: string): number {
    const records = this.data[table as keyof DatabaseData] as any[];
    return records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
  }

  // Administrator methods
  async getAdministratorByAccessCode(accessCode: string): Promise<Administrator | undefined> {
    return this.data.administrators.find(admin => admin.accessCode === accessCode);
  }

  async createAdministrator(admin: InsertAdministrator): Promise<Administrator> {
    const newAdmin: Administrator = {
      id: this.getNextId('administrators'),
      name: admin.name,
      accessCode: admin.accessCode,
      isActive: admin.isActive ?? true,
      userType: 'viewer',
      createdAt: new Date(),
    };
    this.data.administrators.push(newAdmin);
    this.saveData();
    return newAdmin;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return this.data.products;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.data.products.find(product => product.id === id);
  }

  async getProductByCode(code: string): Promise<Product | undefined> {
    return this.data.products.find(product => product.code === code);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: this.getNextId('products'),
      code: product.code,
      name: product.name,
      category: product.category || '',
      kgPerUnit: product.kgPerUnit || '0',
      yieldPercentage: product.yieldPercentage || '0',
      purchaseValue: product.purchaseValue || '0',
      costPerKg: product.costPerKg || '0',
      status: product.status || 'pending',
      caixasPorPalete: 0,
      pesoLiquidoPorCaixa: '0',
      comprimentoCaixa: '0',
      larguraCaixa: '0',
      alturaCaixa: '0',
      createdAt: new Date(),
    };
    this.data.products.push(newProduct);
    this.saveData();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const productIndex = this.data.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new Error(`Product with id ${id} not found`);
    }

    this.data.products[productIndex] = { ...this.data.products[productIndex], ...updates };
    this.saveData();
    return this.data.products[productIndex];
  }

  // Insumo methods
  async getAllInsumos(): Promise<Insumo[]> {
    return this.data.insumos;
  }

  async getInsumoById(id: number): Promise<Insumo | undefined> {
    return this.data.insumos.find(insumo => insumo.id === id);
  }

  async getInsumosByProductId(productId: number): Promise<Insumo[]> {
    const productInsumos = this.data.productInsumos.filter(pi => pi.productId === productId);
    return productInsumos.map(pi => 
      this.data.insumos.find(insumo => insumo.id === pi.insumoId)
    ).filter(Boolean) as Insumo[];
  }

  async createInsumo(insumo: InsertInsumo): Promise<Insumo> {
    const newInsumo: Insumo = {
      id: this.getNextId('insumos'),
      code: insumo.code,
      name: insumo.name,
      category: insumo.category || 'MASSA',
      unit: insumo.unit || 'kg',
      purchaseValue: insumo.purchaseValue,
      yieldPercentage: insumo.yieldPercentage,
      finalCostPerKg: insumo.finalCostPerKg,
      createdAt: new Date(),
    };
    this.data.insumos.push(newInsumo);
    this.saveData();
    return newInsumo;
  }

  async updateInsumo(id: number, updates: Partial<Insumo>): Promise<Insumo> {
    const insumoIndex = this.data.insumos.findIndex(i => i.id === id);
    if (insumoIndex === -1) {
      throw new Error(`Insumo with id ${id} not found`);
    }

    // Create change log entry
    const changeLog = {
      id: this.getNextId('logAlteracoes'),
      productId: 0, // Will be updated based on product-insumo relationship
      userId: 1, // Default user
      changeType: 'insumo_update',
      description: `Insumo ${this.data.insumos[insumoIndex].name} atualizado`,
      previousValue: JSON.stringify(this.data.insumos[insumoIndex]),
      newValue: JSON.stringify({ ...this.data.insumos[insumoIndex], ...updates }),
      insumoId: id,
      createdAt: new Date(),
    };

    this.data.logAlteracoes.push(changeLog);
    this.data.insumos[insumoIndex] = { ...this.data.insumos[insumoIndex], ...updates };
    this.saveData();
    return this.data.insumos[insumoIndex];
  }

  async associateInsumoToProduct(productId: number, insumoId: number, quantity: number): Promise<any> {
    const association = {
      id: this.getNextId('productInsumos'),
      productId,
      insumoId,
      quantity: quantity.toString(),
      createdAt: new Date(),
    };
    this.data.productInsumos.push(association);
    this.saveData();
    return association;
  }

  // Composition methods
  async getCompositionByProductId(productId: number): Promise<ComposicaoDetalhada[]> {
    return this.data.composicaoDetalhada.filter(comp => comp.productId === productId);
  }

  async getPriceCompositionByProductId(productId: number): Promise<ComposicaoPreco | undefined> {
    return this.data.composicaoPreco.find(comp => comp.productId === productId);
  }

  // Logistics methods
  async getLogisticsByProductId(productId: number): Promise<LogisticaTransporte | undefined> {
    return this.data.logisticaTransporte.find(log => log.productId === productId);
  }

  // Change log methods
  async getChangesByProductId(productId: number): Promise<LogAlteracao[]> {
    return this.data.logAlteracoes.filter(log => log.productId === productId);
  }

  async createChangeLog(log: Omit<LogAlteracao, 'id' | 'createdAt'>): Promise<LogAlteracao> {
    const newLog: LogAlteracao = {
      id: this.getNextId('logAlteracoes'),
      ...log,
      createdAt: new Date(),
    };
    this.data.logAlteracoes.push(newLog);
    this.saveData();
    return newLog;
  }

  // User Permissions
  async getUserPermissions(userId: number): Promise<UserPermission | undefined> {
    return this.data.userPermissions.find(perm => perm.userId === userId);
  }

  // Pricing Configuration
  async getPricingConfiguration(productId: number): Promise<PricingConfiguration | undefined> {
    return this.data.pricingConfiguration.find(config => config.productId === productId);
  }

  async updatePricingConfiguration(
    productId: number,
    config: Partial<PricingConfiguration>,
    userId: number
  ): Promise<PricingConfiguration> {
    const configIndex = this.data.pricingConfiguration.findIndex(c => c.productId === productId);

    if (configIndex === -1) {
      const newConfig: PricingConfiguration = {
        id: this.getNextId('pricingConfiguration'),
        productId,
        updatedBy: userId,
        ...config,
      } as PricingConfiguration;
      this.data.pricingConfiguration.push(newConfig);
      this.saveData();
      return newConfig;
    }

    this.data.pricingConfiguration[configIndex] = {
      ...this.data.pricingConfiguration[configIndex],
      ...config,
      updatedBy: userId,
    };
    this.saveData();
    return this.data.pricingConfiguration[configIndex];
  }

  // Pendências de Repasse
  async createPendenciaRepasse(pendencia: {
    insumoId: number;
    productId: number;
    valorAnterior: number;
    valorNovo: number;
    userId: number;
  }) {
    const newPendencia = {
      id: this.getNextId('pendenciasRepasse'),
      ...pendencia,
      status: 'aguardando',
      createdAt: new Date(),
    };
    this.data.pendenciasRepasse.push(newPendencia);
    this.saveData();
    return newPendencia;
  }

  async getPendenciasRepasse(productId?: number) {
    if (productId) {
      return this.data.pendenciasRepasse.filter(p => p.productId === productId);
    }
    return this.data.pendenciasRepasse;
  }

  async approvePendenciaRepasse(id: number, userId: number) {
    const pendenciaIndex = this.data.pendenciasRepasse.findIndex(p => p.id === id);
    if (pendenciaIndex !== -1) {
      this.data.pendenciasRepasse[pendenciaIndex].status = 'aprovado';
      this.data.pendenciasRepasse[pendenciaIndex].approvedBy = userId;
      this.data.pendenciasRepasse[pendenciaIndex].approvedAt = new Date();
      this.saveData();
    }
    return this.data.pendenciasRepasse[pendenciaIndex];
  }

  async rejectPendenciaRepasse(id: number, userId: number) {
    const pendenciaIndex = this.data.pendenciasRepasse.findIndex(p => p.id === id);
    if (pendenciaIndex !== -1) {
      this.data.pendenciasRepasse[pendenciaIndex].status = 'rejeitado';
      this.data.pendenciasRepasse[pendenciaIndex].approvedBy = userId;
      this.data.pendenciasRepasse[pendenciaIndex].approvedAt = new Date();
      this.saveData();
    }
    return this.data.pendenciasRepasse[pendenciaIndex];
  }

  // Modalidades de Transporte
  async getModalidadesTransporte() {
    return this.data.logisticaModalidades;
  }

  async createModalidadeTransporte(modalidade: {
    nome: string;
    valorFixo: number;
    tipo: string;
    cubagemMaxima?: number;
    capacidadePaletes?: number;
  }) {
    const newModalidade = {
      id: this.getNextId('logisticaModalidades'),
      nome: modalidade.nome,
      valorFixo: modalidade.valorFixo.toString(),
      tipo: modalidade.tipo,
      cubagemMaxima: modalidade.cubagemMaxima?.toString() || null,
      capacidadePaletes: modalidade.capacidadePaletes || null,
      isActive: true,
      createdAt: new Date(),
    };
    this.data.logisticaModalidades.push(newModalidade);
    this.saveData();
    return newModalidade;
  }

  async activateAllModalidades() {
    this.data.logisticaModalidades.forEach(modalidade => {
      modalidade.isActive = true;
    });
    this.saveData();
    return this.data.logisticaModalidades;
  }

  async initializeModalidadesPadrao(modalidades: any[]) {
    modalidades.forEach(modalidade => {
      if (!this.data.logisticaModalidades.find(m => m.nome === modalidade.nome && m.tipo === modalidade.tipo)) {
        this.data.logisticaModalidades.push({
          ...modalidade,
          id: this.getNextId('logisticaModalidades'),
          valorFixo: modalidade.valorFixo.toString(),
          cubagemMaxima: modalidade.cubagemMaxima?.toString() || null,
          isActive: true,
          createdAt: new Date(),
        });
      }
    });
    this.saveData();
    return this.data.logisticaModalidades;
  }

  async cleanDuplicateModalidades() {
    const seen = new Set();
    const uniqueModalidades = [];

    for (const modalidade of this.data.logisticaModalidades) {
      const key = `${modalidade.nome}-${modalidade.tipo}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueModalidades.push(modalidade);
      }
    }

    this.data.logisticaModalidades = uniqueModalidades;
    this.saveData();
    return this.data.logisticaModalidades;
  }

  // Simulações de Cenário
  async saveSimulacao(
    productId: number,
    nome: string,
    configuracao: any,
    precoSimulado: number,
    userId: number
  ) {
    const newSimulacao = {
      id: this.getNextId('simulacoesCenario'),
      productId,
      nome,
      configuracao: JSON.stringify(configuracao),
      precoSimulado,
      userId,
      createdAt: new Date(),
    };
    this.data.simulacoesCenario.push(newSimulacao);
    this.saveData();
    return newSimulacao;
  }

  async getSimulacoesByProduct(productId: number) {
    return this.data.simulacoesCenario.filter(s => s.productId === productId);
  }

  // Cálculos de Logística
  async calculateLogistics(productId: number, modalidadeId: number, quantidadeTransportada: number, userId: number) {
    const product = await this.getProductById(productId);
    const modalidade = this.data.logisticaModalidades.find(m => m.id === modalidadeId && m.isActive);

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    if (!modalidade) {
      throw new Error('Modalidade de transporte não encontrada ou inativa');
    }

    console.log('Calculando logística:', {
      product: product.name,
      modalidade: modalidade.nome,
      tipo: modalidade.tipo,
      quantidade: quantidadeTransportada
    });

    let resultado: any = {};

    if (modalidade.tipo === "cubagem") {
      // Cálculo por cubagem
      const comprimento = parseFloat(product.comprimentoCaixa || '38.8') / 100; // converter para metros
      const largura = parseFloat(product.larguraCaixa || '28.8') / 100;
      const altura = parseFloat(product.alturaCaixa || '26.0') / 100;
      const cubagemPorCaixa = comprimento * largura * altura; // m³
      const cubagemMaxima = parseFloat(modalidade.cubagemMaxima?.toString() || '0');

      if (cubagemPorCaixa <= 0 || cubagemMaxima <= 0) {
        throw new Error('Dados de cubagem inválidos');
      }

      const caixasPorVeiculo = Math.floor(cubagemMaxima / cubagemPorCaixa);
      const pesoLiquidoPorCaixa = parseFloat(product.pesoLiquidoPorCaixa || '5');
      const pesoTotalPorVeiculo = caixasPorVeiculo * pesoLiquidoPorCaixa;
      const numeroViagens = Math.ceil(quantidadeTransportada / caixasPorVeiculo);

      // Calcular custo por kg
      const pesoTotalTransportado = quantidadeTransportada * pesoLiquidoPorCaixa;
      const custoTotalEstimado = numeroViagens * modalidade.valorFixo;
      const custoPorKg = custoTotalEstimado / pesoTotalTransportado;

      resultado = {
        cubagemPorCaixa,
        caixasPorVeiculo,
        paletesPorVeiculo: null,
        pesoTotalPorVeiculo: pesoTotalPorVeiculo.toString(),
        numeroViagens,
        custoPorKg: custoPorKg.toString(),
        custoTotalEstimado: custoTotalEstimado.toString(),
        quantidadeTransportada
      };

    } else if (modalidade.tipo === "paletes") {
      // Cálculo por paletes
      const capacidadePaletes = modalidade.capacidadePaletes || 26;
      const caixasPorPalete = parseFloat(product.caixasPorPalete?.toString() || '50');
      const pesoLiquidoPorCaixa = parseFloat(product.pesoLiquidoPorCaixa || '5');

      const paletesPorVeiculo = capacidadePaletes;
      const caixasPorVeiculo = paletesPorVeiculo * caixasPorPalete;
      const pesoTotalPorVeiculo = caixasPorVeiculo * pesoLiquidoPorCaixa;
      const numeroViagens = Math.ceil(quantidadeTransportada / paletesPorVeiculo);

      // Calcular custo por kg
      const pesoTotalTransportado = quantidadeTransportada * caixasPorPalete * pesoLiquidoPorCaixa;
      const custoTotalEstimado = numeroViagens * modalidade.valorFixo;
      const custoPorKg = custoTotalEstimado / pesoTotalTransportado;

      resultado = {
        cubagemPorCaixa: null,
        caixasPorVeiculo,
        paletesPorVeiculo,
        pesoTotalPorVeiculo: pesoTotalPorVeiculo.toString(),
        numeroViagens,
        custoPorKg: custoPorKg.toString(),
        custoTotalEstimado: custoTotalEstimado.toString(),
        quantidadeTransportada
      };
    } else {
      throw new Error('Tipo de modalidade não suportado');
    }

    const newCalculo = {
      id: this.getNextId('calculosLogistica'),
      productId,
      modalidadeId,
      ...resultado,
      userId,
      createdAt: new Date(),
    };

    this.data.calculosLogistica.push(newCalculo);
    this.saveData();

    console.log('Cálculo salvo:', newCalculo);
    return newCalculo;
  }

  async getLogisticsCalculations(productId: number) {
    const calculos = this.data.calculosLogistica.filter(c => c.productId === productId);

    // Enrichir com informações da modalidade
    return calculos.map(calculo => {
      const modalidade = this.data.logisticaModalidades.find(m => m.id === calculo.modalidadeId);
      return {
        ...calculo,
        modalidadeNome: modalidade?.nome || 'N/A',
        modalidadeTipo: modalidade?.tipo || 'N/A'
      };
    });
  }

  // Histórico de Aprovações
  async getApprovalHistory() {
    return this.data.pendenciasRepasse
      .filter(p => p.status === "aprovado" || p.status === "rejeitado")
      .map(p => {
        const insumo = this.data.insumos.find(i => i.id === p.insumoId);
        const product = this.data.products.find(pr => pr.id === p.productId);
        const approver = this.data.administrators.find(a => a.id === p.approvedBy || a.id === p.rejectedBy);

        return {
          ...p,
          insumoName: insumo?.name || 'N/A',
          productName: product?.name || 'N/A',
          approverName: approver?.name || 'N/A',
        };
      })
      .sort((a, b) => new Date(b.approvedAt || b.rejectedAt || 0).getTime() - new Date(a.approvedAt || a.rejectedAt || 0).getTime());
  }

  // Variações de Insumos (simulated)
  async checkInsumoVariations() {
    // Para JsonStorage, simular algumas variações
    if (!this.data.insumoVariacoes) {
      this.data.insumoVariacoes = [];
    }

    return this.data.insumoVariacoes.filter(v => !v.acknowledged).map(v => {
      const insumo = this.data.insumos.find(i => i.id === v.insumoId);
      return {
        ...v,
        insumoName: insumo?.name || 'N/A',
        insumoCode: insumo?.code || 'N/A',
      };
    });
  }

  async createInsumoVariation(variation: { insumoId: number; valorAnterior: number; valorNovo: number; percentualVariacao: number; impactoNoPreco: number }) {
    if (!this.data.insumoVariacoes) {
      this.data.insumoVariacoes = [];
    }

    const newVariation = {
      id: this.getNextId('insumoVariacoes'),
      ...variation,
      detectadoEm: new Date(),
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
    };

    this.data.insumoVariacoes.push(newVariation);
    this.saveData();
    return newVariation;
  }

  async acknowledgeVariation(id: number, userId: number) {
    if (!this.data.insumoVariacoes) {
      this.data.insumoVariacoes = [];
    }

    const variation = this.data.insumoVariacoes.find(v => v.id === id);
    if (variation) {
      variation.acknowledged = true;
      variation.acknowledgedBy = userId;
      variation.acknowledgedAt = new Date();
      this.saveData();
    }
    return variation;
  }
}
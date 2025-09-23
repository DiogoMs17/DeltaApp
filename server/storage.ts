import fs from 'fs';
import path from 'path';
import { PostgresStorage } from './postgres-storage';
import { runMigration } from './migrate';
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
  type CustoFixo,
} from '@shared/schema';

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

export interface IStorage {
  getAdministratorByAccessCode(accessCode: string): Promise<Administrator | undefined>;
  getAdministratorById(id: number): Promise<Administrator | undefined>;
  createAdministrator(admin: InsertAdministrator): Promise<Administrator>;
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductByCode(code: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product>;
  getAllInsumos(): Promise<Insumo[]>;
  getInsumoById(id: number): Promise<Insumo | undefined>;
  getInsumosByProductId(productId: number): Promise<Insumo[]>;
  createInsumo(insumo: InsertInsumo): Promise<Insumo>;
  updateInsumo(id: number, updates: Partial<Insumo>): Promise<Insumo>;
  associateInsumoToProduct(productId: number, insumoId: number, quantity: number): Promise<any>;
  getCompositionByProductId(productId: number): Promise<ComposicaoDetalhada[]>;
  getPriceCompositionByProductId(productId: number): Promise<ComposicaoPreco | undefined>;
  getLogisticsByProductId(productId: number): Promise<LogisticaTransporte | undefined>;
  getChangesByProductId(productId: number): Promise<LogAlteracao[]>;
  createChangeLog(log: Omit<LogAlteracao, 'id' | 'createdAt'>): Promise<LogAlteracao>;
  getUserPermissions(userId: number): Promise<UserPermission | undefined>;
  getPricingConfiguration(productId: number): Promise<PricingConfiguration | undefined>;
  updatePricingConfiguration(productId: number, config: Partial<PricingConfiguration>, userId: number): Promise<PricingConfiguration>;
  createPendenciaRepasse(pendencia: any): Promise<any>;
  getPendenciasRepasse(): Promise<any[]>;
  approvePendenciaRepasse(id: number, userId: number): Promise<any>;
  rejectPendenciaRepasse(id: number, userId: number): Promise<any>;
  getModalidadesTransporte(): Promise<any[]>;
  createModalidadeTransporte(modalidade: any): Promise<any>;
  activateAllModalidades(): Promise<any[]>;
  initializeModalidadesPadrao(modalidades: any[]): Promise<any[]>;
  cleanDuplicateModalidades(): Promise<any[]>;
  saveSimulacao(productId: number, nome: string, configuracao: any, precoSimulado: number, userId: number): Promise<any>;
  getSimulacoesByProduct(productId: number): Promise<any[]>;
  calculateLogistics(productId: number, modalidadeId: number, quantidadeTransportada: number, userId: number): Promise<any>;
  getLogisticsCalculations(productId: number): Promise<any[]>;
  clearLogisticsCalculations(productId: number): Promise<any>;
  getApprovalHistory(): Promise<any[]>;
  checkInsumoVariations(): Promise<any[]>;
  createInsumoVariation(variation: any): Promise<any>;
  acknowledgeVariation(id: number, userId: number): Promise<any>;
  getAllChanges(): Promise<LogAlteracao[]>;
  getInsumoByCode(code: string): Promise<Insumo | undefined>;
  getProductCompositions(productId: number): Promise<any[]>;
  saveProductCompositions(productId: number, compositions: any[]): Promise<any>;
  getCustosFixos(): Promise<CustoFixo[]>;
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
      
      console.log('Database loaded from JSON file successfully');
    } catch (error) {
      console.log('Database file not found, starting with empty data');
      this.saveData();
    }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving data to JSON file:', error);
    }
  }

  private getNextId(table: string): number {
    const tableData = this.data[table as keyof DatabaseData] as any[];
    return tableData.length > 0 ? Math.max(...tableData.map(item => item.id)) + 1 : 1;
  }

  async getAdministratorByAccessCode(accessCode: string): Promise<Administrator | undefined> {
    return this.data.administrators.find(admin => admin.accessCode === accessCode);
  }

  async getAdministratorById(id: number): Promise<Administrator | undefined> {
    return this.data.administrators.find(admin => admin.id === id);
  }

  async createAdministrator(admin: InsertAdministrator): Promise<Administrator> {
    const newAdmin: Administrator = {
      id: this.getNextId('administrators'),
      name: admin.name,
      accessCode: admin.accessCode,
      isActive: admin.isActive ?? true,
      userType: admin.userType || 'editor',
      createdAt: new Date(),
    };
    this.data.administrators.push(newAdmin);
    this.saveData();
    return newAdmin;
  }

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
      purchasePrice: insumo.purchasePrice || '0',
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

  async getCompositionByProductId(productId: number): Promise<ComposicaoDetalhada[]> {
    return this.data.composicaoDetalhada.filter(comp => comp.productId === productId);
  }

  async getPriceCompositionByProductId(productId: number): Promise<ComposicaoPreco | undefined> {
    return this.data.composicaoPreco.find(comp => comp.productId === productId);
  }

  async getLogisticsByProductId(productId: number): Promise<LogisticaTransporte | undefined> {
    return this.data.logisticaTransporte.find(log => log.productId === productId);
  }

  async getChangesByProductId(productId: number): Promise<LogAlteracao[]> {
    return this.data.logAlteracoes.filter(log => log.productId === productId);
  }

  async getAllChanges(): Promise<LogAlteracao[]> {
    return this.data.logAlteracoes || [];
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

  async getUserPermissions(userId: number): Promise<UserPermission | undefined> {
    return this.data.userPermissions.find(perm => perm.userId === userId);
  }

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

  async createPendenciaRepasse(pendencia: { insumoId: number; productId: number; valorAnterior: number; valorNovo: number; userId: number }) {
    const novaPendencia = {
      id: this.getNextId('pendenciasRepasse'),
      ...pendencia,
      status: 'pendente',
      createdAt: new Date(),
    };
    this.data.pendenciasRepasse.push(novaPendencia);
    this.saveData();
    return novaPendencia;
  }

  async getPendenciasRepasse() {
    return this.data.pendenciasRepasse.filter(p => p.status === 'pendente');
  }

  async approvePendenciaRepasse(id: number, userId: number) {
    const pendenciaIndex = this.data.pendenciasRepasse.findIndex(p => p.id === id);
    if (pendenciaIndex === -1) {
      throw new Error('Pendência não encontrada');
    }
    
    const pendencia = this.data.pendenciasRepasse[pendenciaIndex];
    const insumo = await this.getInsumoById(pendencia.insumoId);
    const product = await this.getProductById(pendencia.productId);
    
    this.data.pendenciasRepasse[pendenciaIndex].status = 'aprovado';
    this.data.pendenciasRepasse[pendenciaIndex].approvedBy = userId;
    this.data.pendenciasRepasse[pendenciaIndex].approvedAt = new Date();
    
    // Criar log de alteração
    const newLog = {
      id: this.getNextId('logAlteracoes'),
      productId: pendencia.productId,
      userId: userId,
      changeType: 'approval',
      description: `Aprovada alteração de custo: ${insumo?.name || 'Insumo'} de R$ ${pendencia.valorAnterior.toFixed(2)} para R$ ${pendencia.valorNovo.toFixed(2)}`,
      previousValue: `R$ ${pendencia.valorAnterior.toFixed(2)}`,
      newValue: `R$ ${pendencia.valorNovo.toFixed(2)}`,
      insumoId: pendencia.insumoId,
      createdAt: new Date(),
    };
    
    if (!this.data.logAlteracoes) {
      this.data.logAlteracoes = [];
    }
    
    this.data.logAlteracoes.push(newLog);
    this.saveData();
    return this.data.pendenciasRepasse[pendenciaIndex];
  }

  async rejectPendenciaRepasse(id: number, userId: number) {
    const pendenciaIndex = this.data.pendenciasRepasse.findIndex(p => p.id === id);
    if (pendenciaIndex === -1) {
      throw new Error('Pendência não encontrada');
    }
    
    const pendencia = this.data.pendenciasRepasse[pendenciaIndex];
    const insumo = await this.getInsumoById(pendencia.insumoId);
    const product = await this.getProductById(pendencia.productId);
    
    this.data.pendenciasRepasse[pendenciaIndex].status = 'rejeitado';
    this.data.pendenciasRepasse[pendenciaIndex].rejectedBy = userId;
    this.data.pendenciasRepasse[pendenciaIndex].rejectedAt = new Date();
    
    // Criar log de alteração
    const newLog = {
      id: this.getNextId('logAlteracoes'),
      productId: pendencia.productId,
      userId: userId,
      changeType: 'rejection',
      description: `Rejeitada alteração de custo: ${insumo?.name || 'Insumo'} de R$ ${pendencia.valorAnterior.toFixed(2)} para R$ ${pendencia.valorNovo.toFixed(2)}`,
      previousValue: `R$ ${pendencia.valorAnterior.toFixed(2)}`,
      newValue: `R$ ${pendencia.valorNovo.toFixed(2)}`,
      insumoId: pendencia.insumoId,
      createdAt: new Date(),
    };
    
    if (!this.data.logAlteracoes) {
      this.data.logAlteracoes = [];
    }
    
    this.data.logAlteracoes.push(newLog);
    this.saveData();
    return this.data.pendenciasRepasse[pendenciaIndex];
  }

  async getModalidadesTransporte() {
    return this.data.logisticaModalidades || [];
  }

  async createModalidadeTransporte(modalidade: { nome: string; valorFixo: number; tipo: string; cubagemMaxima?: number; capacidadePaletes?: number }) {
    const novaModalidade = {
      id: this.getNextId('logisticaModalidades'),
      ...modalidade,
      ativo: true,
      createdAt: new Date(),
    };
    
    if (!this.data.logisticaModalidades) {
      this.data.logisticaModalidades = [];
    }
    
    this.data.logisticaModalidades.push(novaModalidade);
    this.saveData();
    return novaModalidade;
  }

  async initializeModalidadesPadrao(modalidades: any[]) {
    if (!this.data.logisticaModalidades) {
      this.data.logisticaModalidades = [];
    }
    
    for (const modalidade of modalidades) {
      const exists = this.data.logisticaModalidades.find(m => m.nome === modalidade.nome);
      if (!exists) {
        await this.createModalidadeTransporte(modalidade);
      }
    }
    
    return this.data.logisticaModalidades;
  }

  async activateAllModalidades() {
    if (!this.data.logisticaModalidades) {
      this.data.logisticaModalidades = [];
      return [];
    }
    
    this.data.logisticaModalidades = this.data.logisticaModalidades.map(m => ({ ...m, ativo: true }));
    this.saveData();
    return this.data.logisticaModalidades;
  }

  async cleanDuplicateModalidades() {
    if (!this.data.logisticaModalidades) {
      return [];
    }
    
    const uniqueModalidades = this.data.logisticaModalidades.reduce((acc: any[], current) => {
      const x = acc.find(item => item.nome === current.nome);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    
    this.data.logisticaModalidades = uniqueModalidades;
    this.saveData();
    return this.data.logisticaModalidades;
  }

  async saveSimulacao(productId: number, nome: string, configuracao: any, precoSimulado: number, userId: number) {
    const novaSimulacao = {
      id: this.getNextId('simulacoesCenario'),
      productId,
      nome,
      configuracao: JSON.stringify(configuracao),
      precoSimulado,
      userId,
      createdAt: new Date(),
    };
    
    if (!this.data.simulacoesCenario) {
      this.data.simulacoesCenario = [];
    }
    
    this.data.simulacoesCenario.push(novaSimulacao);
    this.saveData();
    return novaSimulacao;
  }

  async getSimulacoesByProduct(productId: number) {
    if (!this.data.simulacoesCenario) {
      return [];
    }
    return this.data.simulacoesCenario.filter(s => s.productId === productId);
  }

  async calculateLogistics(productId: number, modalidadeId: number, quantidadeTransportada: number, userId: number) {
    const modalidade = this.data.logisticaModalidades?.find(m => m.id === modalidadeId);
    if (!modalidade) {
      throw new Error('Modalidade não encontrada');
    }
    
    const product = this.data.products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    let calculoResultado: any = {
      id: this.getNextId('calculosLogistica'),
      productId,
      modalidadeId,
      quantidadeTransportada,
      modalidadeNome: modalidade.nome,
      modalidadeTipo: modalidade.tipo,
      createdAt: new Date().toISOString(),
    };

    // Calcula dimensões da caixa em metros
    const comprimentoCaixa = parseFloat(product.comprimentoCaixa || '0') / 100; // cm para m
    const larguraCaixa = parseFloat(product.larguraCaixa || '0') / 100; // cm para m
    const alturaCaixa = parseFloat(product.alturaCaixa || '0') / 100; // cm para m
    const cubagemPorCaixa = comprimentoCaixa * larguraCaixa * alturaCaixa;
    
    const pesoLiquidoPorCaixa = parseFloat(product.pesoLiquidoPorCaixa || '0');
    const caixasPorPalete = product.caixasPorPalete || 1;

    if (modalidade.tipo === 'cubagem') {
      // Cálculo por cubagem
      const cubagemMaxima = modalidade.cubagemMaxima || 1;
      const caixasPorVeiculo = Math.floor(cubagemMaxima / cubagemPorCaixa);
      const numeroViagens = Math.ceil(quantidadeTransportada / caixasPorVeiculo);
      const pesoTotalPorVeiculo = caixasPorVeiculo * pesoLiquidoPorCaixa;
      const custoTotalEstimado = numeroViagens * parseFloat(modalidade.valorFixo.toString());
      const pesoTotalTransportado = quantidadeTransportada * pesoLiquidoPorCaixa;
      const custoPorKg = pesoTotalTransportado > 0 ? custoTotalEstimado / pesoTotalTransportado : 0;

      calculoResultado = {
        ...calculoResultado,
        cubagemPorCaixa,
        caixasPorVeiculo,
        pesoTotalPorVeiculo: pesoTotalPorVeiculo.toFixed(2),
        numeroViagens,
        custoPorKg: custoPorKg.toFixed(4),
        custoTotalEstimado: custoTotalEstimado.toFixed(2),
        custoLogistica: custoTotalEstimado,
        userId,
      };
    } else if (modalidade.tipo === 'paletes') {
      // Cálculo por paletes
      const capacidadePaletes = modalidade.capacidadePaletes || 1;
      const paletesPorVeiculo = capacidadePaletes;
      const caixasPorVeiculo = paletesPorVeiculo * caixasPorPalete;
      const numeroViagens = Math.ceil(quantidadeTransportada / caixasPorVeiculo);
      const pesoTotalPorVeiculo = caixasPorVeiculo * pesoLiquidoPorCaixa;
      const custoTotalEstimado = numeroViagens * parseFloat(modalidade.valorFixo.toString());
      const pesoTotalTransportado = quantidadeTransportada * pesoLiquidoPorCaixa;
      const custoPorKg = pesoTotalTransportado > 0 ? custoTotalEstimado / pesoTotalTransportado : 0;

      calculoResultado = {
        ...calculoResultado,
        cubagemPorCaixa,
        caixasPorVeiculo,
        paletesPorVeiculo,
        pesoTotalPorVeiculo: pesoTotalPorVeiculo.toFixed(2),
        numeroViagens,
        custoPorKg: custoPorKg.toFixed(4),
        custoTotalEstimado: custoTotalEstimado.toFixed(2),
        custoLogistica: custoTotalEstimado,
        userId,
      };
    } else {
      throw new Error('Tipo de modalidade não reconhecido');
    }
    
    if (!this.data.calculosLogistica) {
      this.data.calculosLogistica = [];
    }
    
    this.data.calculosLogistica.push(calculoResultado);
    this.saveData();
    return calculoResultado;
  }

  async getLogisticsCalculations(productId: number) {
    if (!this.data.calculosLogistica) {
      return [];
    }
    return this.data.calculosLogistica.filter(c => c.productId === productId);
  }

  async clearLogisticsCalculations(productId: number) {
    if (!this.data.calculosLogistica) {
      return { deletedCount: 0 };
    }
    
    const initialCount = this.data.calculosLogistica.length;
    this.data.calculosLogistica = this.data.calculosLogistica.filter(c => c.productId !== productId);
    const deletedCount = initialCount - this.data.calculosLogistica.length;
    
    this.saveData();
    return { deletedCount };
  }

  async getApprovalHistory() {
    return this.data.pendenciasRepasse.filter(p => p.status === 'aprovado' || p.status === 'rejeitado') || [];
  }

  async checkInsumoVariations() {
    if (!this.data.insumoVariacoes) {
      return [];
    }
    return this.data.insumoVariacoes.filter(v => !v.acknowledged);
  }

  async createInsumoVariation(variation: { insumoId: number; valorAnterior: number; valorNovo: number; percentualVariacao: number; impactoNoPreco: number }) {
    const novaVariacao = {
      id: this.getNextId('insumoVariacoes'),
      ...variation,
      acknowledged: false,
      createdAt: new Date(),
    };
    
    if (!this.data.insumoVariacoes) {
      this.data.insumoVariacoes = [];
    }
    
    this.data.insumoVariacoes.push(novaVariacao);
    this.saveData();
    return novaVariacao;
  }

  async acknowledgeVariation(id: number, userId: number) {
    if (!this.data.insumoVariacoes) {
      throw new Error('Variação não encontrada');
    }
    
    const variacaoIndex = this.data.insumoVariacoes.findIndex(v => v.id === id);
    if (variacaoIndex === -1) {
      throw new Error('Variação não encontrada');
    }
    
    this.data.insumoVariacoes[variacaoIndex].acknowledged = true;
    this.data.insumoVariacoes[variacaoIndex].acknowledgedBy = userId;
    this.data.insumoVariacoes[variacaoIndex].acknowledgedAt = new Date();
    this.saveData();
    return this.data.insumoVariacoes[variacaoIndex];
  }

  async getInsumoByCode(code: string): Promise<Insumo | undefined> {
    return this.data.insumos.find(insumo => insumo.code.toLowerCase() === code.toLowerCase());
  }

  async getProductCompositions(productId: number): Promise<any[]> {
    const productInsumos = this.data.productInsumos.filter(pi => pi.productId === productId);
    
    return productInsumos.map(pi => {
      const insumo = this.data.insumos.find(i => i.id === pi.insumoId);
      return {
        id: pi.id,
        insumoId: pi.insumoId,
        code: insumo?.code || '',
        name: insumo?.name || '',
        pesoUsado: pi.pesoUsado || '0',
        rendimentoPercent: pi.rendimentoPercent || '100',
        purchasePrice: insumo?.purchasePrice || '0'
      };
    });
  }

  async saveProductCompositions(productId: number, compositions: any[]): Promise<any> {
    // Remove composições existentes
    this.data.productInsumos = this.data.productInsumos.filter(pi => pi.productId !== productId);
    
    // Adicionar novas composições
    for (const comp of compositions) {
      const newComposition = {
        id: this.getNextId('productInsumos'),
        productId,
        insumoId: comp.insumoId,
        quantity: comp.pesoUsado || 0,
        pesoUsado: comp.pesoUsado || 0,
        rendimentoPercent: comp.rendimentoPercent || 100,
        createdAt: new Date()
      };
      this.data.productInsumos.push(newComposition);
    }
    
    this.saveData();
    return { success: true, count: compositions.length };
  }
}

// Storage initialization - Use PostgreSQL instead of JSON
let storageInstance: IStorage;

async function initializeStorage(): Promise<IStorage> {
  try {
    console.log('🔄 Initializing PostgreSQL storage...');
    
    // Try to create PostgreSQL storage instance first
    storageInstance = new PostgresStorage();
    
    // Test the connection by trying a simple query
    await storageInstance.getAllProducts();
    
    console.log('✅ PostgreSQL storage initialized successfully');
    return storageInstance;
  } catch (error) {
    console.warn('⚠️ PostgreSQL initialization failed, falling back to JSON storage:', error);
    // Fallback to JSON storage if PostgreSQL fails
    storageInstance = new JsonStorage();
    return storageInstance;
  }
}

// Initialize storage immediately
const storagePromise = initializeStorage();

// Export storage - this will be PostgreSQL when ready, or JSON as fallback
export const getStorage = async (): Promise<IStorage> => {
  return await storagePromise;
};

// For backward compatibility - initialize with PostgreSQL storage when available
let storageInstanceSync: IStorage = new JsonStorage(); // temporary fallback

// Update the sync storage when PostgreSQL is ready
storagePromise.then((postgres) => {
  storageInstanceSync = postgres;
  console.log('🔄 Switched to PostgreSQL storage for synchronous calls');
}).catch(() => {
  console.log('📄 Using JSON storage for synchronous calls');
});

export const storage = new Proxy({} as IStorage, {
  get(target, prop) {
    return (storageInstanceSync as any)[prop];
  }
});
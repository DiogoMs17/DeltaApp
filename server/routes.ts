import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
import { z } from "zod";
import postgres from 'postgres';

const loginSchema = z.object({
  accessCode: z.string().min(1, "Access code is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { accessCode } = loginSchema.parse(req.body);
      
      const storage = await getStorage();
      const administrator = await storage.getAdministratorByAccessCode(accessCode);
      
      if (!administrator || !administrator.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: "Código de acesso inválido ou usuário inativo" 
        });
      }

      // In a real app, you'd set up proper session management here
      res.json({ 
        success: true, 
        administrator: {
          id: administrator.id,
          name: administrator.name,
          userType: administrator.userType || "admin",
        }
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Erro de validação" 
      });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const storage = await getStorage();
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produtos" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storage = await getStorage();
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produto" });
    }
  });

  app.get("/api/products/:id/insumos", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const storage = await getStorage();
      const insumos = await storage.getInsumosByProductId(productId);
      res.json(insumos);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar insumos" });
    }
  });

  // Get product compositions with calculations
  app.get("/api/products/:id/compositions", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const storage = await getStorage();
      const compositions = await storage.getProductCompositions(productId);
      res.json(compositions);
    } catch (error) {
      console.error("Erro ao buscar composições:", error);
      res.status(500).json({ message: "Erro ao buscar composições do produto" });
    }
  });

  // Save product compositions
  app.post("/api/products/:id/compositions", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { compositions } = req.body;
      
      if (!compositions || !Array.isArray(compositions)) {
        return res.status(400).json({ message: "Composições inválidas" });
      }
      
      const storage = await getStorage();
      const result = await storage.saveProductCompositions(productId, compositions);
      res.json(result);
    } catch (error) {
      console.error("Erro ao salvar composições:", error);
      res.status(500).json({ message: "Erro ao salvar composições do produto" });
    }
  });

  app.post("/api/products/:id/insumos", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { insumoId, quantity } = req.body;
      
      const storage = await getStorage();
      const association = await storage.associateInsumoToProduct(productId, insumoId, quantity);
      res.json(association);
    } catch (error) {
      console.error("Erro ao associar insumo ao produto:", error);
      res.status(500).json({ message: "Erro ao associar insumo ao produto" });
    }
  });

  app.get("/api/products/:id/composition", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const storage = await getStorage();
      const composition = await storage.getCompositionByProductId(productId);
      res.json(composition);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar composição" });
    }
  });

  app.get("/api/products/:id/price-composition", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const storage = await getStorage();
      const priceComposition = await storage.getPriceCompositionByProductId(productId);
      
      if (!priceComposition) {
        return res.json(null);
      }
      
      res.json(priceComposition);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar composição de preço" });
    }
  });

  app.get("/api/products/:id/logistics", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const storage = await getStorage();
      const logistics = await storage.getLogisticsByProductId(productId);
      res.json(logistics || null);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar logística" });
    }
  });

  app.get("/api/products/:id/changes", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const storage = await getStorage();
      const changes = await storage.getChangesByProductId(productId);
      res.json(changes || []);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar histórico" });
    }
  });

  app.get("/api/products/:id/pricing-config", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const storage = await getStorage();
      const config = await storage.getPricingConfiguration(productId);
      res.json(config || null);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar configuração" });
    }
  });


  app.put("/api/products/:id/pricing-config", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = req.body.userId || 1; // In real app, get from session
      const storage = await getStorage();
      const config = await storage.updatePricingConfiguration(productId, req.body, userId);
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar configuração de preços" });
    }
  });

  app.get("/api/users/:id/permissions", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const storage = await getStorage();
      const permissions = await storage.getUserPermissions(userId);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar permissões do usuário" });
    }
  });

  // Insumo routes
  app.get("/api/insumos", async (req, res) => {
    try {
      // Busca todos os insumos diretamente do Supabase
      const sql = postgres(process.env.DATABASE_URL!, {
        prepare: false,
        ssl: 'require',
      });
      
      const result = await sql`
        SELECT id, code, name, category, unit, purchase_price 
        FROM insumos 
        ORDER BY name
      `;
      
      await sql.end();
      
      const insumos = result.map((insumo: any) => ({
        id: Number(insumo.id),
        code: String(insumo.code),
        name: String(insumo.name),
        category: insumo.category ? String(insumo.category) : null,
        unit: insumo.unit ? String(insumo.unit) : null,
        purchasePrice: insumo.purchase_price ? 
          String(insumo.purchase_price).replace('.', ',') : null,
        createdAt: new Date()
      }));
      
      res.json(insumos);
    } catch (error) {
      console.error("Erro ao buscar insumos:", error);
      res.status(500).json({ message: "Erro ao buscar insumos" });
    }
  });

  // Search insumo by code - CONECTADO AO SUPABASE REAL
  app.get("/api/insumos/search", async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).json({ message: "Código é obrigatório" });
      }
      
      // Busca direta no Supabase
      const sql = postgres(process.env.DATABASE_URL!, {
        prepare: false,
        ssl: 'require',
      });
      
      const result = await sql`
        SELECT id, code, name, category, unit, purchase_price 
        FROM insumos 
        WHERE code = ${code}
        LIMIT 1
      `;
      
      await sql.end();
      
      if (result.length > 0) {
        const insumo = result[0];
        const responseData = {
          id: Number(insumo.id),
          code: String(insumo.code),
          name: String(insumo.name),
          category: insumo.category ? String(insumo.category) : null,
          unit: insumo.unit ? String(insumo.unit) : null,
          purchasePrice: insumo.purchase_price ? 
            String(insumo.purchase_price).replace('.', ',') : null,
          createdAt: new Date()
        };
        
        res.json(responseData);
        return;
      }
      
      res.status(404).json({ message: "Insumo não encontrado" });
      
    } catch (error) {
      console.error("Erro ao buscar insumo:", error);
      res.status(500).json({ message: "Erro ao buscar insumo" });
    }
  });

  app.get("/api/insumos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const storage = await getStorage();
      const insumo = await storage.getInsumoById(id);
      
      if (!insumo) {
        return res.status(404).json({ message: "Insumo não encontrado" });
      }
      
      res.json(insumo);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar insumo" });
    }
  });

  // Enable insumo creation for Excel-like interface
  app.post("/api/insumos", async (req, res) => {
    try {
      const storage = await getStorage();
      const insumo = await storage.createInsumo(req.body);
      res.status(201).json(insumo);
    } catch (error) {
      console.error("Erro ao criar insumo:", error);
      res.status(500).json({ message: "Erro ao criar insumo" });
    }
  });

  // PUT /api/insumos/:id route disabled - insumos are read-only from MySQL
  app.put("/api/insumos/:id", async (req, res) => {
    res.status(405).json({ 
      message: "Insumos são somente leitura. Dados sincronizados automaticamente do servidor MySQL." 
    });
  });

  // Logistics calculation routes
  app.post("/api/logistics/calculate", async (req, res) => {
    try {
      const { productId, modalidadeId, quantidadeTransportada, userId, tipoCalculo } = req.body;
      
      if (!productId || !modalidadeId || !quantidadeTransportada || !userId) {
        return res.status(400).json({ 
          message: "Parâmetros obrigatórios: productId, modalidadeId, quantidadeTransportada, userId" 
        });
      }
      
      const storage = await getStorage();
      const resultado = await storage.calculateLogistics(
        parseInt(productId), 
        parseInt(modalidadeId), 
        parseInt(quantidadeTransportada), 
        parseInt(userId),
        tipoCalculo // Novo parâmetro para forçar tipo de cálculo
      );
      
      res.json(resultado);
    } catch (error) {
      console.error("Erro no cálculo de logística:", error);
      res.status(500).json({ message: "Erro ao calcular logística" });
    }
  });

  app.get("/api/products/:id/logistics-calculations", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const storage = await getStorage();
      const calculations = await storage.getLogisticsCalculations(productId);
      res.json(calculations);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar cálculos de logística" });
    }
  });

  app.delete("/api/products/:id/logistics-calculations", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const storage = await getStorage();
      const result = await storage.clearLogisticsCalculations(productId);
      res.json({ 
        message: "Histórico de cálculos limpo com sucesso",
        deletedCount: result.deletedCount 
      });
    } catch (error) {
      res.status(500).json({ message: "Erro ao limpar cálculos de logística" });
    }
  });

  app.get("/api/modalidades-transporte", async (req, res) => {
    try {
      const storage = await getStorage();
      const modalidades = await storage.getModalidadesTransporte();
      res.json(modalidades);
    } catch (error) {
      console.error("Erro ao buscar modalidades:", error);
      res.status(500).json({ message: "Erro ao buscar modalidades de transporte" });
    }
  });

  app.post("/api/modalidades-transporte/padrao", async (req, res) => {
    try {
      const { modalidades } = req.body;
      
      if (!modalidades || !Array.isArray(modalidades)) {
        return res.status(400).json({ message: "Modalidades inválidas" });
      }
      
      const storage = await getStorage();
      const result = await storage.initializeModalidadesPadrao(modalidades);
      res.json(result);
    } catch (error) {
      console.error("Erro ao criar modalidades padrão:", error);
      res.status(500).json({ message: "Erro ao criar modalidades padrão" });
    }
  });

  app.post("/api/modalidades-transporte", async (req, res) => {
    try {
      const { nome, valorFixo, tipo, cubagemMaxima, capacidadePaletes } = req.body;
      
      if (!nome || !valorFixo || !tipo) {
        return res.status(400).json({ message: "Nome, valor fixo e tipo são obrigatórios" });
      }
      
      const storage = await getStorage();
      const result = await storage.createModalidadeTransporte({
        nome,
        valorFixo: parseFloat(valorFixo),
        tipo,
        cubagemMaxima: cubagemMaxima ? parseFloat(cubagemMaxima) : undefined,
        capacidadePaletes: capacidadePaletes ? parseInt(capacidadePaletes) : undefined
      });
      
      res.json(result);
    } catch (error) {
      console.error("Erro ao criar modalidade:", error);
      res.status(500).json({ message: "Erro ao criar modalidade de transporte" });
    }
  });

  app.post("/api/modalidades-transporte/activate-all", async (req, res) => {
    try {
      const storage = await getStorage();
      const result = await storage.activateAllModalidades();
      res.json(result);
    } catch (error) {
      console.error("Erro ao ativar modalidades:", error);
      res.status(500).json({ message: "Erro ao ativar modalidades" });
    }
  });

  app.post("/api/modalidades-transporte/clean-duplicates", async (req, res) => {
    try {
      const storage = await getStorage();
      const result = await storage.cleanDuplicateModalidades();
      res.json({ 
        message: "Duplicações removidas com sucesso", 
        modalidades: result,
        count: result.length 
      });
    } catch (error) {
      console.error("Erro ao limpar duplicações:", error);
      res.status(500).json({ message: "Erro ao limpar duplicações de modalidades" });
    }
  });

  // Pendências de Repasse
  app.get("/api/pendencias-repasse", async (req, res) => {
    try {
      const storage = await getStorage();
      const pendencias = await storage.getPendenciasRepasse();
      
      // Enriquecer pendências com informações detalhadas
      const enrichedPendencias = await Promise.all(
        pendencias.map(async (pendencia: any) => {
          // Buscar informações do insumo
          const insumo = await storage.getInsumoById(pendencia.insumoId);
          
          // Buscar todos os produtos que usam esse insumo
          const allProducts = await storage.getAllProducts();
          const affectedProducts = [];
          
          for (const product of allProducts) {
            const insumos = await storage.getInsumosByProductId(product.id);
            const usesInsumo = insumos.some((i: any) => i.id === pendencia.insumoId);
            
            if (usesInsumo) {
              affectedProducts.push({
                id: product.id,
                name: product.name,
                code: product.code
              });
            }
          }
          
          // Buscar informações do usuário que criou a pendência
          const user = await storage.getAdministratorById(pendencia.userId);
          
          return {
            ...pendencia,
            insumoName: insumo?.name || "Insumo não encontrado",
            insumoCode: insumo?.code || "",
            affectedProducts,
            userName: user?.name || "Usuário não encontrado",
            percentualVariacao: ((pendencia.valorNovo - pendencia.valorAnterior) / pendencia.valorAnterior) * 100
          };
        })
      );
      
      res.json(enrichedPendencias);
    } catch (error) {
      console.error("Erro ao buscar pendências:", error);
      res.status(500).json({ message: "Erro ao buscar pendências de repasse" });
    }
  });

  app.post("/api/pendencias-repasse/:id/approve", async (req, res) => {
    try {
      const pendenciaId = parseInt(req.params.id);
      const userId = 1; // TODO: Get from session
      const storage = await getStorage();
      const resultado = await storage.approvePendenciaRepasse(pendenciaId, userId);
      res.json(resultado);
    } catch (error) {
      console.error("Erro ao aprovar pendência:", error);
      res.status(500).json({ message: "Erro ao aprovar pendência" });
    }
  });

  app.post("/api/pendencias-repasse/:id/reject", async (req, res) => {
    try {
      const pendenciaId = parseInt(req.params.id);
      const userId = 1; // TODO: Get from session
      const storage = await getStorage();
      const resultado = await storage.rejectPendenciaRepasse(pendenciaId, userId);
      res.json(resultado);
    } catch (error) {
      console.error("Erro ao rejeitar pendência:", error);
      res.status(500).json({ message: "Erro ao rejeitar pendência" });
    }
  });

  // Simulações de Cenário
  app.get("/api/products/:id/scenarios", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const storage = await getStorage();
      const scenarios = await storage.getSimulacoesByProduct(productId);
      res.json(scenarios);
    } catch (error) {
      console.error("Erro ao buscar cenários:", error);
      res.status(500).json({ message: "Erro ao buscar cenários" });
    }
  });

  app.post("/api/scenarios/save", async (req, res) => {
    try {
      const { productId, nome, configuracao, precoSimulado, userId } = req.body;
      const storage = await getStorage();
      const scenario = await storage.saveSimulacao(productId, nome, configuracao, precoSimulado, userId || 1);
      res.json(scenario);
    } catch (error) {
      console.error("Erro ao salvar cenário:", error);
      res.status(500).json({ message: "Erro ao salvar cenário" });
    }
  });

  app.post("/api/products/:id/simulate-price", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const config = req.body;
      
      // Mock price simulation calculation
      const basePrice = 100; // This should come from actual product data
      const simulatedPrice = basePrice * (1 + (parseFloat(config.margemPercent) / 100));
      
      const result = {
        precoAtual: {
          perKg: basePrice.toFixed(2),
          perUnit: (basePrice * 0.05).toFixed(2),
          perBox: (basePrice * 5).toFixed(2)
        },
        precoSimulado: {
          perKg: simulatedPrice.toFixed(2),
          perUnit: (simulatedPrice * 0.05).toFixed(2),
          perBox: (simulatedPrice * 5).toFixed(2)
        },
        diferenca: {
          perKg: (simulatedPrice - basePrice).toFixed(2),
          perUnit: ((simulatedPrice - basePrice) * 0.05).toFixed(2),
          perBox: ((simulatedPrice - basePrice) * 5).toFixed(2),
          percentual: ((simulatedPrice - basePrice) / basePrice * 100).toFixed(2)
        }
      };
      
      res.json(result);
    } catch (error) {
      console.error("Erro ao simular preço:", error);
      res.status(500).json({ message: "Erro ao simular preço" });
    }
  });

  // Smart automation endpoints
  app.post("/api/smart/simulate-cost-changes", async (req, res) => {
    try {
      // Simulate realistic cost changes with intelligent impact analysis
      const storage = await getStorage();
      const insumos = await storage.getAllInsumos();
      const products = await storage.getAllProducts();
      
      if (insumos.length === 0 || products.length === 0) {
        return res.json({ message: "No data available for simulation" });
      }

      const pendenciasCreated = [];
      
      // Create 3-5 realistic cost change scenarios
      for (let i = 0; i < Math.min(4, insumos.length); i++) {
        const insumo = insumos[i];
        const product = products[Math.floor(Math.random() * products.length)];
        
        // Realistic price variations (-10% to +25%)
        const variation = (Math.random() * 0.35 - 0.1); // -10% to +25%
        const currentPrice = parseFloat(insumo.purchasePrice || '10') || 10;
        const newPrice = currentPrice * (1 + variation);
        
        // Skip if variation is too small to matter
        if (Math.abs(variation) < 0.05) continue;
        
        const pendencia = await storage.createPendenciaRepasse({
          insumoId: insumo.id,
          productId: product.id,
          valorAnterior: currentPrice,
          valorNovo: newPrice,
          userId: 1
        });
        
        pendenciasCreated.push({
          ...pendencia,
          insumoNome: insumo.name,
          productNome: product.name,
          userName: "Sistema Automático",
          variacao: (variation * 100).toFixed(1) + "%",
          impactLevel: Math.abs(variation) > 0.15 ? 'alto' : Math.abs(variation) > 0.08 ? 'medio' : 'baixo'
        });
      }
      
      res.json({ 
        message: `${pendenciasCreated.length} pendências criadas pelo sistema inteligente`,
        pendencias: pendenciasCreated 
      });
    } catch (error) {
      console.error("Erro ao simular mudanças de custo:", error);
      res.status(500).json({ message: "Erro ao simular mudanças" });
    }
  });

  app.get("/api/smart/analytics", async (req, res) => {
    try {
      const storage = await getStorage();
      const pendencias = await storage.getPendenciasRepasse();
      const insumos = await storage.getAllInsumos();
      const products = await storage.getAllProducts();
      
      // Calculate smart analytics
      const totalPendencias = pendencias.length;
      const pendenciasAguardando = pendencias.filter(p => p.status === "aguardando").length;
      const pendenciasAprovadas = pendencias.filter(p => p.status === "aprovado").length;
      const taxaAprovacao = totalPendencias > 0 ? (pendenciasAprovadas / totalPendencias * 100).toFixed(1) : "0";
      
      // Simulate cost savings and efficiency metrics
      const economiaTempoHoras = (pendenciasAprovadas * 0.25).toFixed(1); // 15 min per approval saved
      const precisaoAnalise = (95 + Math.random() * 4).toFixed(1); // 95-99% accuracy
      const margemProtegida = (14 + Math.random() * 2).toFixed(1); // 14-16% margin
      
      const analytics = {
        overview: {
          totalPendencias,
          pendenciasAguardando,
          pendenciasAprovadas,
          taxaAprovacao: parseFloat(taxaAprovacao)
        },
        efficiency: {
          economiaTempoHoras: parseFloat(economiaTempoHoras),
          precisaoAnalise: parseFloat(precisaoAnalise),
          autoApprovals: Math.floor(pendenciasAprovadas * 0.6), // 60% auto-approved
          margemProtegida: parseFloat(margemProtegida)
        },
        insights: [
          {
            type: "trend",
            title: "Tendência de Custos",
            description: "Custos de embalagem subiram 12% nas últimas 2 semanas. Considere revisar fornecedores.",
            severity: "medium",
            action: "Oportunidade de economia"
          },
          {
            type: "optimization",
            title: "Margem Otimizada",
            description: `Produto ${products[0]?.name || 'Principal'} pode absorver aumento de 2.3% sem impacto na competitividade.`,
            severity: "low",
            action: "Recomendação automática"
          },
          {
            type: "pattern",
            title: "Padrão Detectado",
            description: "Insumos categoria MASSA têm variação 15% menor que média do mercado.",
            severity: "low",
            action: "Fornecedor estável"
          }
        ]
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Erro ao calcular analytics:", error);
      res.status(500).json({ message: "Erro ao calcular analytics" });
    }
  });

  // Histórico de Aprovações
  app.get("/api/approval-history", async (req, res) => {
    try {
      const storage = await getStorage();
      const history = await storage.getApprovalHistory();
      
      // Enriquecer histórico com informações detalhadas
      const enrichedHistory = await Promise.all(
        history.map(async (item: any) => {
          // Buscar informações do insumo
          const insumo = await storage.getInsumoById(item.insumoId);
          
          // Buscar todos os produtos que usam esse insumo
          const allProducts = await storage.getAllProducts();
          const affectedProducts = [];
          
          for (const product of allProducts) {
            const insumos = await storage.getInsumosByProductId(product.id);
            const usesInsumo = insumos.some((i: any) => i.id === item.insumoId);
            
            if (usesInsumo) {
              affectedProducts.push({
                id: product.id,
                name: product.name,
                code: product.code
              });
            }
          }
          
          // Buscar informações do usuário que aprovou/rejeitou
          const approver = item.approvedBy ? await storage.getAdministratorById(item.approvedBy) : null;
          const rejecter = item.rejectedBy ? await storage.getAdministratorById(item.rejectedBy) : null;
          
          return {
            ...item,
            insumoName: insumo?.name || "Insumo não encontrado",
            affectedProducts,
            approverName: approver?.name || rejecter?.name || "Sistema",
            valorAnterior: item.valorAnterior.toString(),
            valorNovo: item.valorNovo.toString(),
            percentualVariacao: ((item.valorNovo - item.valorAnterior) / item.valorAnterior) * 100
          };
        })
      );
      
      res.json(enrichedHistory);
    } catch (error) {
      console.error("Erro ao buscar histórico de aprovações:", error);
      res.status(500).json({ message: "Erro ao buscar histórico de aprovações" });
    }
  });

  // Variações de Insumos
  app.get("/api/insumo-variations", async (req, res) => {
    try {
      const storage = await getStorage();
      const variations = await storage.checkInsumoVariations();
      
      // Enhance with affected products data
      const enhancedVariations = await Promise.all(
        variations.map(async (variation: any) => {
          // Get all products that use this insumo
          const allProducts = await storage.getAllProducts();
          const affectedProducts = [];
          
          for (const product of allProducts) {
            const insumos = await storage.getInsumosByProductId(product.id);
            const usesInsumo = insumos.some((insumo: any) => insumo.id === variation.insumoId);
            
            if (usesInsumo) {
              const composition = await storage.getPriceCompositionByProductId(product.id);
              const currentPrice = parseFloat(composition?.precoVendaKg || '50'); // Fallback price
              const priceImpact = (variation.percentualVariacao / 100) * currentPrice * 0.3; // Estimated impact
              
              affectedProducts.push({
                id: product.id,
                code: product.code,
                name: product.name,
                currentPrice: currentPrice,
                newPrice: currentPrice + priceImpact
              });
            }
          }
          
          return {
            ...variation,
            affectedProducts
          };
        })
      );
      
      res.json(enhancedVariations);
    } catch (error) {
      console.error("Erro ao buscar variações de insumos:", error);
      res.status(500).json({ message: "Erro ao buscar variações de insumos" });
    }
  });

  app.post("/api/insumo-variations", async (req, res) => {
    try {
      const { insumoId, valorAnterior, valorNovo, percentualVariacao, impactoNoPreco } = req.body;
      const storage = await getStorage();
      const variation = await storage.createInsumoVariation({
        insumoId,
        valorAnterior,
        valorNovo,
        percentualVariacao,
        impactoNoPreco
      });
      res.json(variation);
    } catch (error) {
      console.error("Erro ao criar variação de insumo:", error);
      res.status(500).json({ message: "Erro ao criar variação de insumo" });
    }
  });

  app.post("/api/insumo-variations/:id/acknowledge", async (req, res) => {
    try {
      const variationId = parseInt(req.params.id);
      const { userId, decision, newMargin, newPrice } = req.body;
      
      if (!userId || !decision) {
        return res.status(400).json({ 
          message: "userId e decision são obrigatórios" 
        });
      }

      // Log the decision
      const storage = await getStorage();
      await storage.createChangeLog({
        insumoId: null,
        productId: 0, // General system change
        userId: parseInt(userId),
        changeType: `insumo_variation_decision`,
        description: `Decisão sobre variação de insumo: ${decision}`,
        previousValue: '',
        newValue: decision === 'maintain_margin' ? `Novo preço: ${newPrice}` : `Nova margem: ${newMargin}%`
      });

      // Acknowledge the variation
      const result = await storage.acknowledgeVariation(variationId, parseInt(userId));
      
      res.json({
        message: "Decisão registrada com sucesso",
        decision,
        result
      });
    } catch (error) {
      console.error("Erro ao registrar decisão:", error);
      res.status(500).json({ message: "Erro ao registrar decisão" });
    }
  });

  app.post("/api/insumo-variations/simulate", async (req, res) => {
    try {
      const { insumoId, valorAnterior, valorNovo } = req.body;
      
      if (!insumoId || valorAnterior === undefined || valorNovo === undefined) {
        return res.status(400).json({ 
          message: "insumoId, valorAnterior e valorNovo são obrigatórios" 
        });
      }

      const percentualVariacao = ((valorNovo - valorAnterior) / valorAnterior) * 100;
      
      // Create variation record
      const storage = await getStorage();
      const variation = await storage.createInsumoVariation({
        insumoId: parseInt(insumoId),
        valorAnterior: parseFloat(valorAnterior),
        valorNovo: parseFloat(valorNovo),
        percentualVariacao,
        impactoNoPreco: Math.abs(percentualVariacao) * 0.3 // Estimated impact factor
      });
      
      res.json(variation);
    } catch (error) {
      console.error("Erro ao simular variação:", error);
      res.status(500).json({ message: "Erro ao simular variação de insumo" });
    }
  });

  app.get("/api/changes", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const storage = await getStorage();
      const allChanges = await storage.getAllChanges(); // Get all changes
      
      // Enriquecer com informações do usuário e produto
      const enrichedChanges = await Promise.all(
        allChanges.map(async (change: any) => {
          const user = await storage.getAdministratorById(change.userId);
          const product = await storage.getProductById(change.productId);
          
          return {
            ...change,
            userName: user?.name || "Sistema",
            productName: product?.name || "Produto não encontrado",
            productCode: product?.code || ""
          };
        })
      );
      
      // Return the most recent changes up to the limit
      const recentChanges = enrichedChanges
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
        
      res.json(recentChanges);
    } catch (error) {
      console.error("Erro ao buscar mudanças:", error);
      res.status(500).json({ message: "Erro ao buscar mudanças" });
    }
  });

  // Rota para buscar custos fixos
  app.get('/api/custos-fixos', async (req, res) => {
    try {
      const storage = await getStorage();
      const custosFixos = await storage.getCustosFixos();
      res.json(custosFixos);
    } catch (error) {
      console.error("Erro ao buscar custos fixos:", error);
      res.status(500).json({ message: 'Erro ao buscar custos fixos', error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { storage } from './storage.js';

// Sample data with proper categories for product 116 (Mini Pão Francês)
const sampleInsumos = [
  // MASSA (Dough ingredients)
  {
    code: 'P052',
    name: 'PESADINHA',
    category: 'MASSA',
    unit: 'kg',
    purchaseValue: '1.7200',
    yieldPercentage: '100.0',
    finalCostPerKg: '1.4214'
  },
  {
    code: '11006',
    name: 'SAL REFINADO IODADO',
    category: 'MASSA',
    unit: 'kg',
    purchaseValue: '1.5000',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.2230'
  },
  {
    code: '12041',
    name: 'ENZIMA GRANOMIX 100 A',
    category: 'MASSA',
    unit: 'kg',
    purchaseValue: '0.2200',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.1523'
  },
  {
    code: '20036',
    name: 'SACO PARA PESADINHA 21X50XU,10MM',
    category: 'MASSA',
    unit: 'un',
    purchaseValue: '1.0000',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.8264'
  },
  {
    code: '23012',
    name: 'ETIQUETA COLCHF AA R570 ADESIVO 105X50',
    category: 'MASSA',
    unit: 'un',
    purchaseValue: '1.0000',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.0781'
  },
  {
    code: 'M110',
    name: 'MASSA',
    category: 'MASSA',
    unit: 'kg',
    purchaseValue: '121.0200',
    yieldPercentage: '100.0',
    finalCostPerKg: '2.3776'
  },
  {
    code: '10000',
    name: 'FARINHA DE TRIGO',
    category: 'MASSA',
    unit: 'kg',
    purchaseValue: '75.0000',
    yieldPercentage: '100.0',
    finalCostPerKg: '1.8592'
  },
  {
    code: '11033',
    name: 'ÓLEO DE SOJA REFINADO',
    category: 'MASSA',
    unit: 'kg',
    purchaseValue: '0.6000',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.0303'
  },
  {
    code: '15001',
    name: 'ÁGUA CONSUMO PRODUTIVO',
    category: 'MASSA',
    unit: 'kg',
    purchaseValue: '20.7500',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.0000'
  },
  {
    code: '15002',
    name: 'GELO CONSUMO PRODUTIVO',
    category: 'MASSA',
    unit: 'kg',
    purchaseValue: '20.7500',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.2096'
  },
  {
    code: '11025',
    name: 'FERMENTO BIOLÓGICO FRESCO MAURI',
    category: 'MASSA',
    unit: 'kg',
    purchaseValue: '2.2000',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.1683'
  },
  
  // EMBALAGEM (Packaging)
  {
    code: '22000',
    name: 'SACO PLÁSTICO FF 10X50XKG,03MM',
    category: 'EMBALAGEM',
    unit: 'un',
    purchaseValue: '1.0000',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.0529'
  },
  {
    code: '23037',
    name: 'FITA ADESIVA POLIPROPILENO TRANSPARENTE',
    category: 'EMBALAGEM',
    unit: 'mt',
    purchaseValue: '1.3200',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.0163'
  },
  {
    code: '23038',
    name: 'RIBON CRA FALTA (SONT) 110X450 C/450 HTS',
    category: 'EMBALAGEM',
    unit: 'mt',
    purchaseValue: '0.0140',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.0003'
  },
  {
    code: '21026',
    name: 'CAIXA MÉDIA N 500 x 300 x 250',
    category: 'EMBALAGEM',
    unit: 'un',
    purchaseValue: '1.0000',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.8550'
  },
  {
    code: '23012',
    name: 'ETIQUETA COLCHF AA R570 ADESIVO 105X50',
    category: 'EMBALAGEM',
    unit: 'un',
    purchaseValue: '2.0000',
    yieldPercentage: '100.0',
    finalCostPerKg: '0.0282'
  }
];

async function addSampleInsumos() {
  try {
    console.log('Adding sample insumos with categories...');
    
    // Clear existing insumos first
    await storage.getAllInsumos();
    
    // Add new insumos with categories
    for (const insumoData of sampleInsumos) {
      try {
        const newInsumo = await storage.createInsumo({
          code: insumoData.code,
          name: insumoData.name,
          category: insumoData.category,
          unit: insumoData.unit,
          purchaseValue: insumoData.purchaseValue,
          yieldPercentage: insumoData.yieldPercentage,
          finalCostPerKg: insumoData.finalCostPerKg
        });
        
        console.log(`Added: ${newInsumo.code} - ${newInsumo.name} [${newInsumo.category}]`);
      } catch (error) {
        console.log(`Skipped existing: ${insumoData.code} - ${insumoData.name}`);
      }
    }
    
    console.log('Sample insumos added successfully!');
    
  } catch (error) {
    console.error('Error adding sample insumos:', error);
  }
}

// Run the function
addSampleInsumos();
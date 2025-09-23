import { storage } from './storage.js';

// Exact data structure as provided by the user
const exactInsumoData = [
  // MASSA
  { code: '10000', name: 'FARINHA DE TRIGO', category: 'MASSA', unit: 'kg', yieldPercentage: '43.3', finalCostPerKg: '6.2428' },
  { code: '11033', name: 'ÓLEO DE SOJA REFINADO', category: 'MASSA', unit: 'kg', yieldPercentage: '2.2', finalCostPerKg: '251.1400' },
  { code: '15001', name: 'ÁGUA CONSUMO PRODUTIVO', category: 'MASSA', unit: 'kg', yieldPercentage: '12.7', finalCostPerKg: '0.0000' },
  { code: '15002', name: 'GELO CONSUMO PRODUTIVO', category: 'MASSA', unit: 'kg', yieldPercentage: '15.0', finalCostPerKg: '7.3200' },
  { code: '11028', name: 'FERMENTO BIOLÓGICO FRESCO MAURI', category: 'MASSA', unit: 'kg', yieldPercentage: '0.5', finalCostPerKg: '1542.5900' },
  { code: '13034', name: 'CALABRESA', category: 'MASSA', unit: 'kg', yieldPercentage: '18.2', finalCostPerKg: '90.8600' },
  { code: '13058', name: 'REQUEIJÃO', category: 'MASSA', unit: 'kg', yieldPercentage: '9.7', finalCostPerKg: '72.9700' },
  
  // PESADINHA
  { code: 'F052', name: 'PESADINHA', category: 'PESADINHA', unit: 'kg', yieldPercentage: '94.4', finalCostPerKg: '1.7576' },
  { code: '11006', name: 'SAL REFINADO IODADO', category: 'PESADINHA', unit: 'kg', yieldPercentage: '94.4', finalCostPerKg: '1.6937' },
  { code: '12041', name: 'ENZIMA GRANULIX 100 A', category: 'PESADINHA', unit: 'kg', yieldPercentage: '12.1', finalCostPerKg: '340.8900' },
  { code: '23012', name: 'ETIQUETA COUCHE 3A ESTO ADESIVO 105X90', category: 'PESADINHA', unit: 'un', yieldPercentage: '54.9', finalCostPerKg: '0.1422' },
  { code: '20036', name: 'SACO PARA PESADINHA 21X50X05,10MM', category: 'PESADINHA', unit: 'un', yieldPercentage: '54.9', finalCostPerKg: '0.7851' },
  
  // EMBALAGEM
  { code: '22000', name: 'SACO PLÁSTICO PP 10X32X0,03MM', category: 'EMBALAGEM', unit: 'un', yieldPercentage: '100.0', finalCostPerKg: '0.5150' },
  { code: '23037', name: 'FITA ADESIVA POLYPRES-430 TRANSPARENTE', category: 'EMBALAGEM', unit: 'mt', yieldPercentage: '100.0', finalCostPerKg: '0.0685' },
  { code: '23038', name: 'RIBON CRA FALTA (CONT) 110X450 C/450 HIS', category: 'EMBALAGEM', unit: 'mt', yieldPercentage: '100.0', finalCostPerKg: '0.1044' },
  { code: '21002', name: 'CAIXA PAPELÃO MÉDIA 388X288X260', category: 'EMBALAGEM', unit: 'un', yieldPercentage: '100.0', finalCostPerKg: '2.5122' },
];

async function updateWithExactData() {
  try {
    console.log('Updating with exact data structure...');
    
    const allInsumos = await storage.getAllInsumos();
    
    for (const exactData of exactInsumoData) {
      let insumo = allInsumos.find(i => i.code === exactData.code);
      
      if (insumo) {
        // Update existing insumo
        await storage.updateInsumo(insumo.id, {
          name: exactData.name,
          category: exactData.category,
          unit: exactData.unit,
          yieldPercentage: exactData.yieldPercentage,
          finalCostPerKg: exactData.finalCostPerKg,
          purchaseValue: '0.0000'
        });
        console.log(`Updated ${exactData.code} - ${exactData.name} [${exactData.category}]`);
      } else {
        // Create new insumo
        const newInsumo = await storage.createInsumo({
          code: exactData.code,
          name: exactData.name,
          category: exactData.category,
          unit: exactData.unit,
          yieldPercentage: exactData.yieldPercentage,
          finalCostPerKg: exactData.finalCostPerKg,
          purchaseValue: '0.0000'
        });
        
        // Associate with product 116 (ID 1)
        await storage.associateInsumoToProduct(1, newInsumo.id, 1.0);
        console.log(`Created ${exactData.code} - ${exactData.name} [${exactData.category}]`);
      }
    }
    
    console.log('Data update completed with exact structure!');
    
  } catch (error) {
    console.error('Error updating with exact data:', error);
  }
}

// Run the update
updateWithExactData();
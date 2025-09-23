import { storage } from './storage.js';

// Sample data with categories based on the image provided
const insumoUpdates = [
  // Product 116 - Mini Pão Francês
  { code: 'P052', category: 'PESADINHA', name: 'PESADINHA', unit: 'kg' },
  { code: '11006', category: 'PESADINHA', name: 'SAL REFINADO IODADO', unit: 'kg' },
  { code: '12041', category: 'PESADINHA', name: 'ENZIMA GRANOMIX 100 A', unit: 'kg' },
  { code: '20036', category: 'PESADINHA', name: 'SACO PARA PESADINHA 21X50XU,10MM', unit: 'un' },
  { code: '23012', category: 'PESADINHA', name: 'ETIQUETA COLCHF AA R570 ADESIVO 105X50', unit: 'un' },
  
  // Massa ingredients
  { code: 'M110', category: 'MASSA', name: 'MASSA', unit: 'kg' },
  { code: 'P052', category: 'PESADINHA', name: 'PESADINHA', unit: 'kg' },
  { code: '10000', category: 'MASSA', name: 'FARINHA DE TRIGO', unit: 'kg' },
  { code: '11033', category: 'MASSA', name: 'ÓLEO DE SOJA REFINADO', unit: 'kg' },
  { code: '15001', category: 'MASSA', name: 'ÁGUA CONSUMO PRODUTIVO', unit: 'kg' },
  { code: '15002', category: 'MASSA', name: 'GELO CONSUMO PRODUTIVO', unit: 'kg' },
  { code: '11025', category: 'MASSA', name: 'FERMENTO BIOLÓGICO FRESCO MAURI', unit: 'kg' },
  
  // Embalagem (Packaging)
  { code: '22000', category: 'EMBALAGEM', name: 'SACO PLÁSTICO PP 10X20XKG,03MM', unit: 'un' },
  { code: '23037', category: 'EMBALAGEM', name: 'FITA ADESIVA POLIPROPILENO TRANSPARENTE', unit: 'mt' },
  { code: '23038', category: 'EMBALAGEM', name: 'RIBON CRA FALTA (CONT) 110X450 C/450 HIS', unit: 'mt' },
  { code: '21026', category: 'EMBALAGEM', name: 'CAIXA MÉDIA M 300 x 200 x 250', unit: 'un' },
  { code: '23012', category: 'EMBALAGEM', name: 'ETIQUETA COLCHF AA R570 ADESIVO 105X50', unit: 'un' },
];

async function updateInsumosWithCategories() {
  try {
    console.log('Updating insumos with categories and units...');
    
    // Get all current insumos
    const allInsumos = await storage.getAllInsumos();
    
    let updated = 0;
    
    for (const insumo of allInsumos) {
      // Find matching update data
      const updateData = insumoUpdates.find(update => 
        update.code === insumo.code || 
        update.name.toLowerCase().includes(insumo.name.toLowerCase()) ||
        insumo.name.toLowerCase().includes(update.name.toLowerCase())
      );
      
      if (updateData) {
        // Update the insumo with category and unit
        await storage.updateInsumo(insumo.id, {
          category: updateData.category,
          unit: updateData.unit
        });
        
        console.log(`Updated ${insumo.code} - ${insumo.name} with category: ${updateData.category}, unit: ${updateData.unit}`);
        updated++;
      } else {
        // Set default category and unit for unmatched items
        await storage.updateInsumo(insumo.id, {
          category: 'MASSA',
          unit: 'kg'
        });
        
        console.log(`Set default category for ${insumo.code} - ${insumo.name}`);
        updated++;
      }
    }
    
    console.log(`Successfully updated ${updated} insumos with categories and units.`);
    
  } catch (error) {
    console.error('Error updating insumos:', error);
  }
}

// Run the update
updateInsumosWithCategories();
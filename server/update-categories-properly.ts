import { storage } from './storage.js';

// Update categories to separate PESADINHA, MASSA, and EMBALAGEM properly
const categoryUpdates = [
  // PESADINHA category
  { code: 'P052', category: 'PESADINHA' },
  
  // MASSA category (dough ingredients)
  { code: 'M110', category: 'MASSA' },
  { code: '10000', category: 'MASSA' },
  { code: '11006', category: 'MASSA' },
  { code: '11033', category: 'MASSA' },
  { code: '15001', category: 'MASSA' },
  { code: '15002', category: 'MASSA' },
  { code: '11025', category: 'MASSA' },
  { code: '12041', category: 'MASSA' },
  
  // EMBALAGEM category (packaging)
  { code: '20036', category: 'EMBALAGEM' },
  { code: '23012', category: 'EMBALAGEM' },
  { code: '22000', category: 'EMBALAGEM' },
  { code: '23037', category: 'EMBALAGEM' },
  { code: '23038', category: 'EMBALAGEM' },
  { code: '21026', category: 'EMBALAGEM' },
];

async function updateCategories() {
  try {
    console.log('Updating categories for proper separation...');
    
    const allInsumos = await storage.getAllInsumos();
    
    for (const update of categoryUpdates) {
      const insumo = allInsumos.find(i => i.code === update.code);
      
      if (insumo) {
        await storage.updateInsumo(insumo.id, {
          category: update.category
        });
        console.log(`Updated ${insumo.code} - ${insumo.name} to category: ${update.category}`);
      } else {
        console.log(`Insumo not found: ${update.code}`);
      }
    }
    
    console.log('Category updates completed!');
    
  } catch (error) {
    console.error('Error updating categories:', error);
  }
}

// Run the update
updateCategories();
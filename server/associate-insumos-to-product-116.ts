import { storage } from './storage.js';

// Associate insumos with product 116 (Mini Pão Francês)
const productInsumoAssociations = [
  { insumoCode: 'P052', quantity: '1.7200' },
  { insumoCode: '11006', quantity: '1.5000' },
  { insumoCode: '12041', quantity: '0.2200' },
  { insumoCode: '20036', quantity: '1.0000' },
  { insumoCode: '23012', quantity: '1.0000' },
  { insumoCode: 'M110', quantity: '121.0200' },
  { insumoCode: '10000', quantity: '75.0000' },
  { insumoCode: '11033', quantity: '0.6000' },
  { insumoCode: '15001', quantity: '20.7500' },
  { insumoCode: '15002', quantity: '20.7500' },
  { insumoCode: '11025', quantity: '2.2000' },
  { insumoCode: '22000', quantity: '1.0000' },
  { insumoCode: '23037', quantity: '1.3200' },
  { insumoCode: '23038', quantity: '0.0140' },
  { insumoCode: '21026', quantity: '1.0000' },
];

async function associateInsumosToProduct() {
  try {
    console.log('Associating insumos to product 116...');
    
    const productId = 1; // Product 116 has ID 1
    const allInsumos = await storage.getAllInsumos();
    
    for (const association of productInsumoAssociations) {
      const insumo = allInsumos.find(i => i.code === association.insumoCode);
      
      if (insumo) {
        try {
          await storage.associateInsumoToProduct(productId, insumo.id, parseFloat(association.quantity));
          console.log(`Associated ${insumo.code} - ${insumo.name} with quantity ${association.quantity}`);
        } catch (error) {
          console.log(`Association already exists for ${insumo.code}`);
        }
      } else {
        console.log(`Insumo not found: ${association.insumoCode}`);
      }
    }
    
    console.log('All associations completed!');
    
  } catch (error) {
    console.error('Error associating insumos:', error);
  }
}

// Run the association
associateInsumosToProduct();
import { storage } from "./storage";

async function addSampleVariations() {
  try {
    console.log('Creating sample insumo variations...');
    
    // Get some insumos to create variations for
    const insumos = await storage.getAllInsumos();
    
    if (insumos.length === 0) {
      console.log('No insumos found. Cannot create variations.');
      return;
    }

    // Create 3 sample variations
    const sampleVariations = [
      {
        insumoId: insumos[0].id,
        valorAnterior: parseFloat(insumos[0].purchaseValue?.toString() || '10'),
        valorNovo: parseFloat(insumos[0].purchaseValue?.toString() || '10') * 1.15, // 15% increase
        percentualVariacao: 15.0,
        impactoNoPreco: 4.5
      },
      {
        insumoId: insumos[1]?.id || insumos[0].id,
        valorAnterior: parseFloat(insumos[1]?.purchaseValue?.toString() || '5'),
        valorNovo: parseFloat(insumos[1]?.purchaseValue?.toString() || '5') * 0.92, // 8% decrease
        percentualVariacao: -8.0,
        impactoNoPreco: 2.4
      },
      {
        insumoId: insumos[2]?.id || insumos[0].id,
        valorAnterior: parseFloat(insumos[2]?.purchaseValue?.toString() || '20'),
        valorNovo: parseFloat(insumos[2]?.purchaseValue?.toString() || '20') * 1.23, // 23% increase
        percentualVariacao: 23.0,
        impactoNoPreco: 6.9
      }
    ];

    for (const variation of sampleVariations) {
      try {
        const result = await storage.createInsumoVariation(variation);
        console.log(`Created variation for insumo ${variation.insumoId}: ${variation.percentualVariacao}%`);
      } catch (error) {
        console.error(`Failed to create variation for insumo ${variation.insumoId}:`, error);
      }
    }

    console.log('Sample variations created successfully!');
    
    // Show current variations
    const variations = await storage.checkInsumoVariations();
    console.log(`Total variations: ${variations.length}`);
    
  } catch (error) {
    console.error('Error creating sample variations:', error);
  }
}

// Run if called directly
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  addSampleVariations().then(() => {
    console.log('Done!');
    process.exit(0);
  }).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export { addSampleVariations };
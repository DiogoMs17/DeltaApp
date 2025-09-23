import { storage } from "./storage.js";

async function setupConsultaUser() {
  try {
    console.log("Setting up consultation user...");

    // Create a consultation user
    const consultaUser = await storage.createAdministrator({
      name: "Diogo Moraes",
      accessCode: "consulta111",
      isActive: true,
      userType: "consulta",
    });

    console.log("Consultation user created:", consultaUser);

    // Create some sample insumo variations for testing
    const insumos = await storage.getAllInsumos();
    if (insumos.length > 0) {
      // Create variation for first insumo
      const insumo = insumos[0];
      const currentPrice = parseFloat(insumo.purchaseValue);
      const newPrice = currentPrice * 1.08; // 8% increase
      const variation = ((newPrice - currentPrice) / currentPrice) * 100;
      const impactOnPrice = 2.5; // 2.5% impact on final price

      const variationResult = await storage.createInsumoVariation({
        insumoId: insumo.id,
        valorAnterior: currentPrice,
        valorNovo: newPrice,
        percentualVariacao: variation,
        impactoNoPreco: impactOnPrice,
      });

      console.log("Sample variation created:", variationResult);
    }

    console.log("Setup completed successfully!");
  } catch (error) {
    console.error("Error during setup:", error);
  }
}

setupConsultaUser();

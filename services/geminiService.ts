
import { GoogleGenAI } from "@google/genai";

// Local database for zero-cost, offline-first advice
const LOCAL_KNOWLEDGE_BASE: Record<string, string> = {
  "Maize": `MAIZE (ABURO) PRODUCTION GUIDE
• Planting: Best done in April (Major season) or September (Minor season). Use 75cm x 25cm spacing.
• Soil: Requires well-drained loamy soil with high organic matter.
• Pests: Watch for Fall Armyworm. Use neem extracts or pheromone traps for organic control.
• Fertilizer: Apply NPK 15-15-15 at 2 weeks after planting.`,

  "Cocoa": `COCOA (KOKOO) PRODUCTION GUIDE
• Planting: Seedlings should be transplanted at the start of the rainy season (May/June).
• Shade: Young cocoa needs temporary shade from plantain or gliricidia.
• Pests: Mirids (Akate) are common. Practice regular pruning and "gunda" (removing diseased pods).
• Harvesting: Harvest only ripe yellow/orange pods. Ferment for 6 days under banana leaves.`,

  "Groundnut": `GROUNDNUT (NKATEE) PRODUCTION GUIDE
• Planting: Sow 3-5cm deep in May. Spacing should be 40cm x 10cm.
• Soil: Sandy loam is best to allow easy "pegging" (pod formation).
• Pests: Aphids can cause rosette disease. Early planting helps prevent this.
• Harvesting: Harvest when the inside of the shell turns brown. Dry immediately to prevent Aflatoxin.`,

  "Cowpea": `COWPEA (ADUA) PRODUCTION GUIDE
• Planting: Ideal for the Northern and Savanna regions. Plant in late July.
• Management: Requires at least two weedings. 
• Pests: Thrips and Maruca pods borers. Intercropping with Maize can reduce pest pressure.
• Storage: Use PICS bags to prevent weevil damage without chemicals.`,

  "Mango": `MANGO PRODUCTION GUIDE
• Varieties: Kent and Keitt are best for export from Ghana.
• Planting: Space trees 10m x 10m. Best for the Middle and Southern belts.
• Disease: Anthracnose and Bacterial Black Spot. Ensure good air circulation by pruning.
• Pruning: Prune after harvest to maintain tree height and improve yield.`,

  "Pineapple": `PINEAPPLE (ABRƆBƐ) PRODUCTION GUIDE
• Varieties: Smooth Cayenne or MD2.
• Soil: Well-drained, acidic soil (pH 4.5-5.5).
• Planting: Use "suckers" or "slips". Plant in double rows to maximize space.
• Flower Induction: Use calcium carbide (locally) or ethephon to ensure uniform fruiting.`,

  "Yam": `YAM (KUKUO) PRODUCTION GUIDE
• Mounding: Clear land and make high mounds (80cm) to allow tuber expansion.
• Staking: Use bamboo or strong sticks to support vines; this increases yield by 30%.
• Mulching: Cover the top of the mound with dry grass to prevent heat from killing the seed yam.
• Varieties: Pona (for flavor) or Laribako (for storage).`
};

export const getCropAdvice = async (crop: string, soil: string, region: string, language: 'en' | 'tw') => {
  const normalizedCrop = crop.trim().charAt(0).toUpperCase() + crop.trim().slice(1).toLowerCase();
  
  // 1. Try AI first if API Key exists
  if (process.env.API_KEY && process.env.API_KEY !== "undefined") {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Provide detailed agricultural advice for a smallholder farmer in Ghana growing ${crop} in ${soil} soil in the ${region} region. 
      Include planting tips, common pests/diseases in Ghana, and organic prevention methods. 
      Answer in ${language === 'tw' ? 'Twi' : 'English'}. 
      Format as a structured guide.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { temperature: 0.7 }
      });
      return response.text;
    } catch (error) {
      console.warn("Gemini API failed or limit reached, falling back to local database.");
    }
  }

  // 2. Fallback to Local Knowledge Base (Free & Offline)
  const localAdvice = LOCAL_KNOWLEDGE_BASE[normalizedCrop];
  
  if (localAdvice) {
    if (language === 'tw') {
      return `[LOCAL GUIDE] ${normalizedCrop} Ho Afutuo:\n\n` + 
             localAdvice.replace('PRODUCTION GUIDE', 'ADWUMAYƐ AKWANKYERƐ')
             .replace('Planting:', 'Dua:')
             .replace('Soil:', 'Dɔteɛ:')
             .replace('Pests:', 'Mmoawa:');
    }
    return `[LOCAL KNOWLEDGE BASE] ${localAdvice}\n\n*Note: This is pre-saved advice because you are offline or using the free local version.*`;
  }

  // 3. Generic Fallback
  return language === 'tw' ? 
    `Yɛnni afutuo pɔtee biara mma ${crop} seesei, nanso dua no bɛyɛ yie wɔ ${soil} mu wɔ ${region} mantɛm mu. Kɔhu wo mpasua so mfuomhwɛfoɔ (Extension Officer) hɔ ama afutuo pii.` :
    `We don't have specific local data for ${crop} yet. Generally, ensure you use certified seeds, test your soil, and time your planting with the ${region} rainy season. Consult your local extension officer for more details.`;
};

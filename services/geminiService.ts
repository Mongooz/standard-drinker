// import { GoogleGenAI, Type } from "@google/genai";

// Helper to calculate Australian standard drinks
// Formula: Volume (L) * ABV (%) * 0.789
const calculateStandardDrinks = (volumeMl: number, abv: number): number => {
  return (volumeMl / 1000) * abv * 0.789;
};

export const parseDrinkInput = async (userInput: string) => {
    return [];
    //   try {
//     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: userInput,
//       config: {
//         systemInstruction: `
//           You are an expert bartender and Australian alcohol regulations specialist.
//           Your task is to analyze user input describing drinks and extract the estimated volume (in milliliters) and Alcohol By Volume (ABV percentage).
          
//           Guidelines:
//           1. Identify common drink names and map them to typical Australian serving sizes if not specified (e.g., "Schooner" = 425ml, "Pint" = 570ml, "Pot" = 285ml, "Glass of wine" = 150ml).
//           2. Estimate ABV based on the drink type if not specified (e.g., "Beer" ~ 4.5-5%, "Wine" ~ 12-14%, "Vodka" ~ 40%).
//           3. Be precise with brand knowledge (e.g., "Guinness" is typically 4.2%, "VB" is 4.9%).
//           4. Return a list of identified drinks.
//         `,
//         responseMimeType: 'application/json',
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             drinks: {
//               type: Type.ARRAY,
//               items: {
//                 type: Type.OBJECT,
//                 properties: {
//                   name: { type: Type.STRING, description: "A concise name of the drink" },
//                   volumeMl: { type: Type.NUMBER, description: "Volume in milliliters" },
//                   abv: { type: Type.NUMBER, description: "Alcohol by Volume percentage (e.g., 5.0 for 5%)" },
//                 },
//                 required: ["name", "volumeMl", "abv"]
//               }
//             }
//           }
//         }
//       }
//     });

//     const result = JSON.parse(response.text || '{"drinks": []}');
    
//     // Add calculated standard drinks to the result
//     return result.drinks.map((d: any) => ({
//       ...d,
//       standardDrinks: calculateStandardDrinks(d.volumeMl, d.abv)
//     }));

//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     throw new Error("Failed to interpret drink description.");
//   }
};

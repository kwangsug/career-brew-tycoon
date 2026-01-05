"use server";

import { suggestAIAssistedItemNames } from "@/ai/flows/suggest-ai-assisted-item-names";

export async function getAINameSuggestions(itemType: string, storeLevel: number, language: string) {
  try {
    const result = await suggestAIAssistedItemNames({
      itemType,
      storeLevel,
      language,
    });
    return result.names;
  } catch (error) {
    console.error("Error fetching AI name suggestions:", error);
    return [];
  }
}

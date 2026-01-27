// AI suggestions disabled for static export
// To enable, deploy with a server (Vercel) instead of static hosting

export async function getAINameSuggestions(itemType: string, storeLevel: number, language: string): Promise<string[]> {
  // Static build: return empty suggestions
  // AI feature requires server deployment
  console.log("AI suggestions not available in static build");
  return [];
}

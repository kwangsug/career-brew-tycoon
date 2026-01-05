'use server';
/**
 * @fileOverview This file defines a Genkit flow that suggests creative names for store items using AI.
 *
 * The flow takes an item type and level as input and returns a list of suggested names.
 *
 * @remarks
 * The flow uses the `ai.generate` method to call the Gemini model and generate the names.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ItemNamingInputSchema = z.object({
  itemType: z.string().describe('The type of item to generate a name for.'),
  storeLevel: z.number().describe('The current level of the store.'),
});

export type ItemNamingInput = z.infer<typeof ItemNamingInputSchema>;

const ItemNamingOutputSchema = z.object({
  names: z.array(z.string()).describe('A list of suggested names for the item.'),
});

export type ItemNamingOutput = z.infer<typeof ItemNamingOutputSchema>;


export async function suggestAIAssistedItemNames(input: ItemNamingInput): Promise<ItemNamingOutput> {
  return suggestAIAssistedItemNamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestItemNamePrompt',
  input: {
    schema: ItemNamingInputSchema,
  },
  output: {
    schema: ItemNamingOutputSchema,
  },
  prompt: `You are a creative naming assistant for a coffee shop tycoon game.

  Suggest 5 creative and thematic names for a store item of type '{{itemType}}' for a store at level {{storeLevel}}.  The names should be related to coffee, business, or the item type.

  Return the names as a JSON array of strings.
  `,
});

const suggestAIAssistedItemNamesFlow = ai.defineFlow(
  {
    name: 'suggestAIAssistedItemNamesFlow',
    inputSchema: ItemNamingInputSchema,
    outputSchema: ItemNamingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

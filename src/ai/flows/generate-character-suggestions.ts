'use server';

/**
 * @fileOverview Generates character suggestions based on radicals placed in the crafting grid.
 *
 * - generateCharacterSuggestions - A function that suggests possible characters from given radicals.
 * - GenerateCharacterSuggestionsInput - The input type for the generateCharacterSuggestions function.
 * - GenerateCharacterSuggestionsOutput - The return type for the generateCharacterSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCharacterSuggestionsInputSchema = z.object({
  radicals: z
    .array(z.string())
    .describe('An array of radicals placed in the crafting grid.'),
});
export type GenerateCharacterSuggestionsInput = z.infer<
  typeof GenerateCharacterSuggestionsInputSchema
>;

const GenerateCharacterSuggestionsOutputSchema = z.object({
  suggestedCharacters: z
    .array(z.string())
    .describe(
      'An array of possible Chinese characters that can be formed from the given radicals.'
    ),
});
export type GenerateCharacterSuggestionsOutput = z.infer<
  typeof GenerateCharacterSuggestionsOutputSchema
>;

export async function generateCharacterSuggestions(
  input: GenerateCharacterSuggestionsInput
): Promise<GenerateCharacterSuggestionsOutput> {
  return generateCharacterSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCharacterSuggestionsPrompt',
  input: {schema: GenerateCharacterSuggestionsInputSchema},
  output: {schema: GenerateCharacterSuggestionsOutputSchema},
  prompt: `You are an expert in Chinese characters. Given the following radicals, suggest possible Chinese characters that can be formed from them. Return an array of characters. 

Radicals: {{{radicals}}}

Characters:`,
});

const generateCharacterSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateCharacterSuggestionsFlow',
    inputSchema: GenerateCharacterSuggestionsInputSchema,
    outputSchema: GenerateCharacterSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
